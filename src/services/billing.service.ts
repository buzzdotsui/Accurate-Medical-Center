import { prisma } from '@/lib/db/client';
import { ProcessPaymentInput } from '@/lib/validations/billing';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class BillingService {
  /**
   * Get active invoices (unpaid or partially paid)
   */
  static async getActiveInvoices() {
    return await prisma.invoice.findMany({
      where: {
        status: { in: ['DRAFT', 'ISSUED', 'PARTIAL'] }
      },
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
      include: { payments: true }
    });

    if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found', 404);
    if (invoice.status === 'PAID') throw new AppError('VALIDATION_ERROR', 'Invoice is already fully paid', 400);
    if (invoice.status === 'CANCELLED') throw new AppError('VALIDATION_ERROR', 'Invoice is cancelled', 400);

    const amountPaidSoFar = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Number(invoice.totalAmount) - amountPaidSoFar;

    if (data.amount > balance) {
      throw new AppError('VALIDATION_ERROR', `Payment amount exceeds outstanding balance of ${balance}`, 400);
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
    });
  }
}
