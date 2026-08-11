import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/pharmacy/prescriptions
 * List all pending and partial prescriptions
 * 
 * RBAC:
 * - SUPER_ADMIN: See all prescriptions
 * - PHARMACIST: See prescriptions in their branch only
 * - DOCTOR: See prescriptions in their branch
 * - PATIENT: See their own prescriptions only
 */
export const GET = withAuth(async (req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  const prescriptions = await PharmacyService.getPendingPrescriptions(branchFilter.branchId);
  return ok(prescriptions);
});
