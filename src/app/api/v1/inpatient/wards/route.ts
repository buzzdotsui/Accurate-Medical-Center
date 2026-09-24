import { withRole } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/inpatient/wards
 * Ward/room/bed overview, scoped to the caller's branch (SUPER_ADMIN sees
 * every branch's wards).
 *
 * Role allowlist matches GET /api/v1/inpatient/admissions: operational
 * clinical/admin roles only. The response embeds beds → admissions →
 * patient PII, so it must not be readable by every authenticated role
 * (ACCOUNTANT, AMBULANCE, LAB_SCIENTIST, etc. have no ward-management need).
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.THEATRE_STAFF, ROLES.MATERNAL_STAFF],
  async (_req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const wards = await InpatientService.getWardsOverview(branchFilter.branchId);
    return ok(wards);
  },
);
