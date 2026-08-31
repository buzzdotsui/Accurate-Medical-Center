import { withAuth } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { verifyInvoiceAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * GET /api/v1/billing/invoices/[id]
 * Fetch a single invoice with its line items, patient, and payment
 * history - backs the invoice detail / process-payment page.
 *
 * Authorization:
 * - SUPER_ADMIN: any invoice.
 * - Staff (ADMIN, ACCOUNTANT, RECEPTIONIST, etc.): own-branch invoices only.
 * - PATIENT: their own invoice only.
 * All enforced by `verifyInvoiceAccess`, the same helper used by the
 * payment-processing route - no separate/parallel authorization logic.
 */
export const GET = withAuth(async (_req, session, ctx: RouteContext) => {
  const invoiceId = await getParam(ctx, 'id');
  await verifyInvoiceAccess(session.user, invoiceId);
  const invoice = await BillingService.getInvoiceById(invoiceId);
  return ok(invoice);
});
