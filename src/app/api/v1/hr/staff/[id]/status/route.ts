import { withRole, parseBody } from '@/lib/api/middleware';
import { StaffService } from '@/services/staff.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { SetStaffStatusSchema } from '@/lib/validations/staff';
import { verifyStaffAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/hr/staff/[id]/status
 * Activate or deactivate a staff member's access.
 *
 * Authorization: SUPER_ADMIN or ADMIN only.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, ctx: RouteContext) => {
    const staffId = await getParam(ctx, 'id');

    await verifyStaffAccess(session.user, staffId, 'UPDATE');

    const { isActive } = await parseBody(req, SetStaffStatusSchema);

    const staff = await StaffService.setActive(staffId, isActive, session.user.id);
    return ok(staff);
  }
);
