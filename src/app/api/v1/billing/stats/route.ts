import { withRole } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/billing/stats
 * Revenue/outstanding/payment counters for the Finance & Billing dashboard.
 *
 * RBAC: financial visibility is a staff/admin concern, never a patient one.
 * - SUPER_ADMIN: organization-wide.
 * - ADMIN, ACCOUNTANT: branch-scoped.
 */
export const GET = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT], async (_req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  const stats = await BillingService.getDashboardStats(branchFilter.branchId);
  return ok(stats);
});
