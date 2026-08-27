import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody } from '@/lib/api/middleware';
import { HrService } from '@/services/hr.service';
import { StaffService } from '@/services/staff.service';
import { ok, created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { CreateStaffSchema } from '@/lib/validations/staff';

export const GET = withAuth(async () => {
  const staff = await HrService.getStaffDirectory();
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
    // the server derives it from the admin's session.
    // SUPER_ADMIN may optionally specify a target branch.
    let branchId = (session.user.role === ROLES.SUPER_ADMIN && body.branchId)
      ? body.branchId
      : (body.branchId ?? session.user.branchId);

    // For non-SUPER_ADMIN, if they explicitly specify a different branch, reject it.
    if (session.user.role !== ROLES.SUPER_ADMIN && body.branchId && body.branchId !== session.user.branchId) {
      throw new Error('FORBIDDEN');
    }

    // SUPER_ADMIN may not have a personal branchId — fall back to the first (HQ) branch
    if (!branchId && session.user.role === ROLES.SUPER_ADMIN) {
      const { prisma: db } = await import('@/lib/db/client');
      const hq = await db.branch.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (!hq) {
        throw new Error('No active branch found. Please create a branch first.');
      }
      branchId = hq.id;
    }

    if (!branchId) {
      throw new Error('Branch ID is required');
    }
    
    const staff = await StaffService.createStaff({
      ...body,
      branchId: branchId,
    }, session.user.id);
    
    return created(staff);
  }
);
