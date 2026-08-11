import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { LaboratoryService } from '@/services/laboratory.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/laboratory/requests
 * List all active lab requests
 * 
 * RBAC:
 * - SUPER_ADMIN: See all requests
 * - LAB_SCIENTIST: See requests in their branch
 * - DOCTOR: See requests in their branch
 * - PATIENT: See their own requests only
 */
export const GET = withAuth(async (req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  const requests = await LaboratoryService.getActiveRequests(branchFilter.branchId);
  return ok(requests);
});
