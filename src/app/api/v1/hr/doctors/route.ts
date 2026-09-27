import { withRole } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/v1/hr/doctors
 * Returns a list of all active doctors in the branch for staff assignment.
 *
 * Authorization: SUPER_ADMIN or ADMIN only.
 * ADMIN is scoped to their own branch; SUPER_ADMIN sees all branches.
 */
export const GET = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (_req, session) => {
  const branchFilter = buildBranchFilter(session.user);

  const doctors = await prisma.staff.findMany({
    where: {
      ...(branchFilter.branchId ? { branchId: branchFilter.branchId } : {}),
      isActive: true,
      user: { role: ROLES.DOCTOR },
    },
    select: {
      id: true,
      staffId: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  const formatted = doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    staffId: d.staffId,
  }));

  return ok(formatted);
});