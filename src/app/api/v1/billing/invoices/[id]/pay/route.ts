import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { ProcessPaymentSchema } from '@/lib/validations/billing';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { verifyInvoiceAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * POST /api/v1/billing/invoices/[id]/pay
 * Process a payment for an invoice
 * 
 * Authorization:
 * - User must have access to the invoice (via verifyInvoiceAccess)
 * - Patients can pay their own invoices
 * - Staff can process payments for their branch's invoices
 */
export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const invoiceId = await getParam(ctx, 'id');
  
  // Verify user can access this invoice
  await verifyInvoiceAccess(session.user, invoiceId, 'UPDATE');
  
  const body = await parseBody(req, ProcessPaymentSchema);
  const result = await BillingService.processPayment(invoiceId, body, session.user.id);
  return ok(result, { message: 'Payment processed successfully' });
});
