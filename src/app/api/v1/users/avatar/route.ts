import { withAuth } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

/**
 * DELETE /api/v1/users/avatar
 * Remove the authenticated user's avatar.
 */
export const DELETE = withAuth(async (_req, session) => {
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  return ok({ success: true });
});