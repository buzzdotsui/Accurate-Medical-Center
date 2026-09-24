import { withRole } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { verifyInvoiceAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/billing/invoices/[id]
 * Fetch a single invoice with its line items, patient, and payment
 * history - backs the invoice detail / process-payment page.
 *
 * Authorization:
 * - Role allowlist: SUPER_ADMIN, ADMIN, ACCOUNTANT, RECEPTIONIST, PATIENT
 *   (same financial/front-desk policy as the list route and POST/pay).
 * - SUPER_ADMIN: any invoice.
 * - Staff: own-branch invoices only via `verifyInvoiceAccess`.
 * - PATIENT: their own invoice only via `verifyInvoiceAccess`.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.PATIENT],
  async (_req, session, ctx: RouteContext) => {
    const invoiceId = await getParam(ctx, 'id');
    await verifyInvoiceAccess(session.user, invoiceId);
    const invoice = await BillingService.getInvoiceById(invoiceId);
    return ok(invoice);
  },
);
