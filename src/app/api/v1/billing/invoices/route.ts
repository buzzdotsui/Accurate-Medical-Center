import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';
import { PatientService } from '@/services/patient.service';

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
