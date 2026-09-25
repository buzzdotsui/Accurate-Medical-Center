import { withRole } from '@/lib/api/middleware';
import { PsychService } from '@/services/psych.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';

/**
 * GET /api/v1/psych/stats
 * DEFERRED — not part of paid Phase 1. Source preserved for a future phase.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MENTAL_HEALTH, ROLES.DOCTOR],
  async (_req, session) => {
    if (!isDeferredModuleEnabled()) {
      throw new AppError(
        'This module is not included in the current Phase 1 release.',
        'FORBIDDEN',
        403,
      );
    }
    const branchFilter = buildBranchFilter(session.user);
    const stats = await PsychService.getStats(branchFilter.branchId);
    return ok(stats);
  },
);
