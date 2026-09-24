import { withRole } from '@/lib/api/middleware';
import { SettingsService } from '@/services/settings.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/settings/audit
 * Paginated, read-only view of the audit trail.
 *
 * Authorization: SUPER_ADMIN or ADMIN only — audit logs can reveal
 * administrative activity across every branch and must not be readable
 * by clinical/front-desk staff or patients. ADMIN (branch-scoped) only
 * sees events tied to their own branch; SUPER_ADMIN sees everything.
 * Branch scoping uses `buildBranchFilter`, which throws 403 for a
 * branchless ADMIN instead of failing open to the organization-wide trail.
 */
export const GET = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (req, session) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const branchFilter = buildBranchFilter(session.user);

  const logs = await SettingsService.getAuditLogs(page, limit, branchFilter.branchId);
  return ok(logs);
});
