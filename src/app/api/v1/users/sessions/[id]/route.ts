import { withAuth } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * DELETE /api/v1/users/sessions/[id]
 * Revoke a specific session.
 */
export const DELETE = withAuth(async (_req, session, ctx: RouteContext) => {
  const sessionId = await getParam(ctx, 'id');

  // Don't allow deleting the current session via this endpoint
  const currentSession = await prisma.session.findFirst({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    orderBy: { updatedAt: 'desc' },
  });

  if (currentSession && currentSession.id === sessionId) {
    return ok({ error: 'Cannot revoke current session. Use logout instead.' }, { status: 400 });
  }

  await prisma.session.delete({
    where: { id: sessionId, userId: session.user.id },
  });

  return ok({ success: true });
});