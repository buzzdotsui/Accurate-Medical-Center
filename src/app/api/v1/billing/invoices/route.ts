import { withAuth, withRole, parseBody } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok, created } from '@/lib/api/response';
import { buildBranchFilter, resolveBranchId } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';
import { PatientService } from '@/services/patient.service';
import { CreateInvoiceSchema } from '@/lib/validations/billing';

/**
 * GET /api/v1/billing/invoices
 * List invoices
 * 
 * RBAC:
 * - SUPER_ADMIN: See all invoices
 * - ACCOUNTANT, ADMIN: See invoices in their branch
 * - PATIENT: See only their own invoices
 */
export const GET = withAuth(async (req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  
  // Patients can only see their own invoices. Self-heals a missing
  // Patient profile instead of permanently 404ing a user whose
  // self-registration never completed (see PatientService.ensureSelfProfile).
  if (session.user.role === ROLES.PATIENT) {
    const patient = await PatientService.ensureSelfProfile(session.user);
    const invoices = await BillingService.getInvoicesByPatient(patient.id);
    return ok(invoices);
  }
  
  const invoices = await BillingService.getActiveInvoices(branchFilter.branchId);
  return ok(invoices);
});

/**
 * POST /api/v1/billing/invoices
 * Create a new invoice for a patient (front-desk/finance roles only).
 *
 * Authorization: SUPER_ADMIN, ADMIN, ACCOUNTANT, RECEPTIONIST — the same
 * roles already trusted to process payments against an invoice
 * (`POST /api/v1/billing/invoices/[id]/pay`).
 * Branch is always resolved server-side via `resolveBranchId` — the
 * client's `branchId` is never trusted directly for non-SUPER_ADMIN.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST],
  async (req, session) => {
    const body = await parseBody(req, CreateInvoiceSchema);
    const branchId = await resolveBranchId(session.user, body.branchId);
    const invoice = await BillingService.createInvoice({ ...body, branchId }, session.user.id);
    return created(invoice, 'Invoice created successfully');
  }
);
