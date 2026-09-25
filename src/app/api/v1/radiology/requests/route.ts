import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';

/**
 * GET /api/v1/radiology/requests
 * List all active radiology requests (the radiology work queue).
 *
 * DEFERRED — radiology workflows are not part of paid Phase 1 scope
 * (invoice TTI/2026/HMS-P1-002). Source preserved for a future phase;
 * access is disabled unless PHASE1_ENABLE_DEFERRED_MODULES=true.
 * Consultation-time imaging orders are unaffected (created server-side).
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
    if (!isDeferredModuleEnabled()) {
      throw new AppError(
        'This module is not included in the current Phase 1 release.',
        'FORBIDDEN',
        403,
      );
    }
    const branchFilter = buildBranchFilter(session.user);
    const requests = await RadiologyService.getActiveRequests(branchFilter.branchId);
    return ok(requests);
  }
);
