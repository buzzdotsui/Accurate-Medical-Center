import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';
import { prisma } from '@/lib/db/client';

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
  
  // Patients can only see their own invoices
  if (session.user.role === ROLES.PATIENT) {
    const patient = await prisma.patient.findFirst({
      where: { user: { id: session.user.id } },
      select: { id: true },
    });
    if (!patient) {
      throw new AppError('Patient profile not found.', 'NOT_FOUND', 404);
    }
    const invoices = await BillingService.getInvoicesByPatient(patient.id);
    return ok(invoices);
  }
  
  const invoices = await BillingService.getActiveInvoices(branchFilter.branchId);
  return ok(invoices);
});
