import { withRole, parseBody } from '@/lib/api/middleware';
import { StaffService } from '@/services/staff.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { UpdateStaffSchema } from '@/lib/validations/staff';
import { verifyStaffAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/hr/staff/[id]
 * Update a staff member's profile (department, specialization, license,
 * contact info). Credential/role changes are out of scope for this route.
 *
 * Authorization: SUPER_ADMIN or ADMIN only.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, ctx: RouteContext) => {
    const staffId = await getParam(ctx, 'id');

    await verifyStaffAccess(session.user, staffId, 'UPDATE');

    const body = await parseBody(req, UpdateStaffSchema);

    const staff = await StaffService.updateStaff(staffId, body, session.user.id);
    return ok(staff);
  }
);
