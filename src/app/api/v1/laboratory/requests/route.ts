import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { LaboratoryService } from '@/services/laboratory.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/laboratory/requests
 * List all active lab requests (the laboratory work queue).
 *
 * RBAC:
 * - SUPER_ADMIN: See all requests
 * - LAB_SCIENTIST, DOCTOR, ADMIN: See requests in their branch only
 *
 * This is an operational staff queue, not a patient-facing endpoint —
 * PATIENT is intentionally excluded (see the pharmacy queue route for the
 * same reasoning: `buildBranchFilter` does not scope PATIENT callers, so
 * this previously leaked every hospital's active lab requests to any
 * logged-in patient).
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.LAB_SCIENTIST, ROLES.DOCTOR, ROLES.ADMIN],
  async (req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const requests = await LaboratoryService.getActiveRequests(branchFilter.branchId);
    return ok(requests);
  }
);
