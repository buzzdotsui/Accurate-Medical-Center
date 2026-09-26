import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { StaffService } from '@/services/staff.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { UpdateStaffSchema } from '@/lib/validations/staff';
import { AppError } from '@/lib/api/errors';

/**
 * PATCH /api/v1/hr/staff/[id]
 * Update a staff member's profile (department, specialization, supervising doctor, etc.)
 * Requires SUPER_ADMIN or ADMIN role.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, { params }) => {
    const body = await parseBody(req, UpdateStaffSchema);
    const staffId = params.id;

    const staff = await StaffService.updateStaff(staffId, body, session.user.id);
    return ok(staff);
  }
);