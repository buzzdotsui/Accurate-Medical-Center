import { withAuth } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/v1/settings/departments
 * Returns the list of all departments.
 * Requires authentication.
 */
export const GET = withAuth(async () => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true },
  });
  return ok(departments);
});
