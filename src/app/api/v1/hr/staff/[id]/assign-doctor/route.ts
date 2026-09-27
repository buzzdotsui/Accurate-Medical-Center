import { withRole, parseBody } from '@/lib/api/middleware';
import { StaffService } from '@/services/staff.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { AssignStaffDoctorSchema } from '@/lib/validations/staff';
import { verifyStaffAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/hr/staff/[id]/assign-doctor
 * Assign or remove a doctor assignment for a staff member.
 *
 * Authorization: SUPER_ADMIN or ADMIN only.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, ctx: RouteContext) => {
    const staffId = await getParam(ctx, 'id');

    await verifyStaffAccess(session.user, staffId, 'UPDATE');

    const body = await parseBody(req, AssignStaffDoctorSchema);

    const staff = await StaffService.updateStaff(staffId, { assignedDoctorId: body.assignedDoctorId }, session.user.id);
    return ok(staff);
  }
);