import { prisma } from '@/lib/db/client';
import { ProcessPaymentInput } from '@/lib/validations/billing';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { ROLES } from '@/config/roles';

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

      // Update Invoice Status
      const newAmountPaid = amountPaidSoFar + data.amount;
      const newStatus = newAmountPaid >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus }
      });

      // Audit Log
      await AuditService.log({
        userId: executorId,
        userRole: 'CASHIER',
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
        }).catch(() => {});
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
      }).catch(() => {});

      return result;
    });
  }
}
