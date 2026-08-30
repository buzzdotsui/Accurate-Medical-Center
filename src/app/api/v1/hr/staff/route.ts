import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { HrService } from '@/services/hr.service';
import { StaffService } from '@/services/staff.service';
import { ok, created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { CreateStaffSchema } from '@/lib/validations/staff';
import { buildBranchFilter, resolveBranchId } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/hr/staff
 * Staff directory (names, emails, roles, departments).
 *
 * Authorization: SUPER_ADMIN or ADMIN only — "staff management"/"staff
 * administration" are administrative responsibilities, not something
 * every authenticated role (down to PATIENT) should be able to browse.
 * ADMIN is additionally scoped to their own branch.
 */
export const GET = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  const staff = await HrService.getStaffDirectory(branchFilter.branchId);
  return ok(staff);
});

/**
 * POST /api/v1/hr/staff
 * Create a new staff member
 * Requires SUPER_ADMIN or ADMIN role.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session) => {
    const body = await parseBody(req, CreateStaffSchema);

    // Resolve the effective branchId. Dialog clients never send branchId;
    // the server derives it from the admin's session (SUPER_ADMIN may
    // optionally specify a target branch). See resolveBranchId for the
    // full resolution/validation rules.
    const branchId = await resolveBranchId(session.user, body.branchId);

    const staff = await StaffService.createStaff({
      ...body,
      branchId,
    }, session.user.id);
    
    return created(staff);
  }
);
