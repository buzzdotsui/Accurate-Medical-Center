import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';
import { generateReceiptId } from '@/lib/utils/generate-id';

export interface InitializePaymentParams {
  invoiceId: string;
  amount: number;
  email: string;
  gateway: 'PAYSTACK' | 'FLUTTERWAVE';
}

export class PaymentService {
  /**
   * Initialize a payment session with a gateway (Paystack/Flutterwave)
   */
  static async initializePayment(params: InitializePaymentParams) {
    const { invoiceId, amount, email: _email, gateway } = params;

    // Verify invoice
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new AppError('Invoice not found', 'NOT_FOUND', 404);
    if (invoice.status === 'PAID') throw new AppError('Invoice already paid', 'BAD_REQUEST', 400);

    const reference = `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: gateway,
        reference,
        status: 'PENDING',
        receiptId: "PENDING-" + Date.now(),
      },
    });

    if (gateway === 'PAYSTACK') {
      // TODO: Call Paystack API
      // const response = await fetch('https://api.paystack.co/transaction/initialize', { ... })
      return {
        paymentId: payment.id,
        reference,
        authorizationUrl: 'https://checkout.paystack.com/mock-url', // MOCK
      };
    } else {
      // TODO: Call Flutterwave API
      return {
        paymentId: payment.id,
        reference,
        authorizationUrl: 'https://flutterwave.com/pay/mock-url', // MOCK
      };
    }
  }

  /**
   * Webhook handler to verify and complete a payment
   */
  static async handleWebhook(reference: string, gatewayStatus: 'SUCCESS' | 'FAILED') {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { reference },
        include: { invoice: true },
      });

      if (!payment) throw new AppError('Payment reference not found', 'NOT_FOUND', 404);
      if (payment.status !== 'PENDING') return payment; // Already processed

      if (gatewayStatus === 'SUCCESS') {
        const totalReceipts = await tx.payment.count({ where: { status: 'COMPLETED' } });
        const receiptId = generateReceiptId(totalReceipts + 1);

        // Mark payment as completed
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', receiptId },
        });

        // Mark invoice as paid
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID' },
        });

        return updatedPayment;
      } else {
        return await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
      }
    });
  }
}
