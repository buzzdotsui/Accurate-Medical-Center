import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/radiology/requests
 * List all active radiology requests (the radiology work queue).
 *
 * RBAC:
 * - SUPER_ADMIN: See all requests
 * - RADIOGRAPHER, DOCTOR, ADMIN: See requests in their branch only
 *
 * Previously this endpoint had no authorization at all beyond a valid
 * session (`withAuth`) and no branch scoping — any authenticated user,
 * including a PATIENT, could list every radiology request across every
 * branch in the hospital. This is an operational staff queue.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.RADIOGRAPHER, ROLES.DOCTOR, ROLES.ADMIN],
  async (req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const requests = await RadiologyService.getActiveRequests(branchFilter.branchId);
    return ok(requests);
  }
);
