import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { ProcessPaymentSchema } from '@/lib/validations/billing';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { verifyInvoiceAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/billing/invoices/[id]/pay
 * Process a payment for an invoice
 * 
 * Authorization:
 * - Front-desk/finance roles only (ACCOUNTANT, RECEPTIONIST, ADMIN,
 *   SUPER_ADMIN). This previously accepted any authenticated user
 *   (including PATIENT), which would let a patient record an arbitrary
 *   payment against their own invoice — fixed here.
 * - `verifyInvoiceAccess` additionally enforces branch scoping.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST],
  async (req, session, ctx: RouteContext) => {
    const invoiceId = await getParam(ctx, 'id');

    // Verify user can access this invoice
    await verifyInvoiceAccess(session.user, invoiceId, 'UPDATE');

    const body = await parseBody(req, ProcessPaymentSchema);
    const result = await BillingService.processPayment(invoiceId, body, session.user.id);
    return ok(result, { message: 'Payment processed successfully' });
  }
);
