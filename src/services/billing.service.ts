import { prisma } from '@/lib/db/client';
import { ProcessPaymentInput, CreateInvoiceInput } from '@/lib/validations/billing';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { ROLES } from '@/config/roles';
import { IdGeneratorService } from '@/lib/utils/generate-id';
import { logger } from '@/lib/utils/logger';

export class BillingService {
  /**
   * Get active invoices (unpaid or partially paid)
   * Optionally filtered by branchId
   */
  static async getActiveInvoices(branchId?: string) {
    return await prisma.invoice.findMany({
      where: {
        status: { in: ['DRAFT', 'ISSUED', 'PARTIAL'] },
        ...(branchId ? { branchId } : {}),
      },
      include: {
        patient: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get invoices for a specific patient
   */
  static async getInvoicesByPatient(patientId: string) {
    return await prisma.invoice.findMany({
      where: { patientId },
      include: {
        patient: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get a single invoice with full line items, patient, and payment
   * history — used by the invoice detail / process-payment page.
   * Access control (branch/patient ownership) is enforced by the caller
   * via `verifyInvoiceAccess`, not here.
   */
  static async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!invoice) throw new AppError('Invoice not found', 'NOT_FOUND', 404);
    return invoice;
  }

  /**
   * Create a new invoice for a patient, with one or more line items.
   *
   * This is the entry point that was missing entirely before Stage 17 —
   * `processPayment` requires an existing Invoice row, but nothing ever
   * created one. Kept intentionally minimal: no tax engine, no recurring
   * billing, no payment gateway — just the smallest real invoice-creation
   * flow the existing billing workflow needs to actually function.
   */
  static async createInvoice(data: CreateInvoiceInput & { branchId: string }, executorId: string) {
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient || patient.deletedAt) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    if (patient.branchId !== data.branchId) {
      throw new AppError('Patient does not belong to your branch', 'FORBIDDEN', 403);
    }

    const itemsWithTotals = data.items.map((item) => {
      const quantity = item.quantity ?? 1;
      const totalPrice = Math.round(quantity * item.unitPrice * 100) / 100;
      return { ...item, quantity, totalPrice };
    });
    const subTotal = itemsWithTotals.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = data.discount ?? 0;
    const tax = data.tax ?? 0;
    const totalAmount = subTotal - discount + tax;

    if (totalAmount < 0) {
      throw new AppError('Invoice total cannot be negative', 'BAD_REQUEST', 400);
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceId = await IdGeneratorService.generateInvoiceId(tx);
      return tx.invoice.create({
        data: {
          invoiceId,
          patientId: data.patientId,
          branchId: data.branchId,
          subTotal,
          discount,
          tax,
          totalAmount,
          // Matches the status values `getActiveInvoices`/`getInvoicesByPatient`
          // already filter for ('DRAFT' | 'ISSUED' | 'PARTIAL') — a freshly
          // created invoice is issued and awaiting payment.
          status: 'ISSUED',
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          items: {
            create: itemsWithTotals.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              reference: item.reference,
            })),
          },
        },
        include: { items: true },
      });
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'ACCOUNTANT',
      action: 'INVOICE_CREATED',
      resource: 'INVOICE',
      resourceId: invoice.id,
      branchId: data.branchId,
      details: { patientId: data.patientId, totalAmount, itemCount: itemsWithTotals.length },
    }).catch(() => {});

    if (patient.userId) {
      NotificationService.createNotification({
        userId: patient.userId,
        type: 'BILLING',
        title: 'New invoice generated',
        body: `A new invoice (${invoice.invoiceId}) for ${totalAmount} has been generated for you.`,
        link: '/patient',
        resource: 'INVOICE',
        resourceId: invoice.id,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });
    }

    return invoice;
  }

  /**
   * Aggregate billing stats for the finance/billing dashboard, scoped to a
   * branch (or organization-wide for SUPER_ADMIN when branchId is
   * undefined).
   */
  static async getDashboardStats(branchId?: string) {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setUTCHours(23, 59, 59, 999);

    const [paymentsToday, activeInvoices] = await Promise.all([
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
          ...(branchId ? { invoice: { branchId } } : {}),
        },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['DRAFT', 'ISSUED', 'PARTIAL'] },
          ...(branchId ? { branchId } : {}),
        },
        select: { totalAmount: true, amountPaid: true },
      }),
    ]);

    const revenueToday = paymentsToday.reduce((sum, p) => sum + Number(p.amount), 0);
    const outstanding = activeInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)),
      0,
    );

    return {
      revenueToday,
      outstanding,
      paymentsTodayCount: paymentsToday.length,
    };
  }

  /**
   * Process a payment against an invoice
   */
  static async processPayment(invoiceId: string, data: ProcessPaymentInput, executorId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true, patient: { select: { userId: true, branchId: true } } }
    });

    if (!invoice) throw new AppError('Invoice not found', 'NOT_FOUND', 404);
    if (invoice.status === 'PAID') throw new AppError('Invoice is already fully paid', 'VALIDATION_ERROR', 400);
    if (invoice.status === 'CANCELLED') throw new AppError('Invoice is cancelled', 'VALIDATION_ERROR', 400);

    const amountPaidSoFar = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Number(invoice.totalAmount) - amountPaidSoFar;

    if (data.amount > balance) {
      throw new AppError(`Payment amount exceeds outstanding balance of ${balance}`, 'VALIDATION_ERROR', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          receiptId: `RCP-${Date.now()}`,
          invoiceId: invoice.id,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          processedBy: executorId
        }
      });

      // Update Invoice Status. `amountPaid` is kept in sync here too —
      // previously only `status` was updated, leaving the stored
      // `amountPaid` column permanently at 0 even after real payments.
      const newAmountPaid = amountPaidSoFar + data.amount;
      const newStatus = newAmountPaid >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus, amountPaid: newAmountPaid }
      });

      // Audit Log
      await AuditService.log({
        userId: executorId,
        userRole: 'ACCOUNTANT',
        action: 'PROCESS_PAYMENT',
        resource: 'INVOICE',
        resourceId: invoice.id,
        details: { amount: data.amount, method: data.method, newStatus }
      });

      return { payment, invoice: updatedInvoice };
    }).then((result) => {
      // Notification side-effects for the payment just recorded.
      // Best-effort: never blocks the payment itself.
      if (invoice.patient.userId) {
        NotificationService.createNotification({
          userId: invoice.patient.userId,
          type: 'BILLING',
          title: 'Payment received',
          body: `A payment of ${data.amount} was received for your invoice. New status: ${result.invoice.status}.`,
          link: '/patient',
          resource: 'INVOICE',
          resourceId: invoice.id,
        }).catch((err: unknown) => {
          logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
        });
      }

      NotificationService.notifyRoleInBranch({
        roles: [ROLES.ADMIN],
        branchId: invoice.patient.branchId,
        type: 'BILLING',
        title: 'Payment received',
        body: `A payment of ${data.amount} was recorded against an invoice. New status: ${result.invoice.status}.`,
        link: '/billing/invoices',
        resource: 'INVOICE',
        resourceId: invoice.id,
        excludeUserId: executorId,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });

      return result;
    });
  }
}
