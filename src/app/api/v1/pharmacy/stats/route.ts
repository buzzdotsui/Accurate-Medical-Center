import { withRole } from '@/lib/api/middleware';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/pharmacy/stats
 * Dispensed-today count and pending prescription count for the pharmacy dashboard.
 *
 * RBAC: pharmacy-facing stats are restricted to staff roles.
 * - SUPER_ADMIN: organization-wide.
 * - ADMIN, PHARMACIST: branch-scoped.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PHARMACIST],
  async (_req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const stats = await PharmacyService.getDashboardStats(branchFilter.branchId);
    return ok(stats);
  }
);
