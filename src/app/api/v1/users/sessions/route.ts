import { withAuth } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/v1/users/sessions
 * Get all active sessions for the authenticated user.
 */
export const GET = withAuth(async (_req, session) => {
  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      ipAddress: true,
      userAgent: true,
      expiresAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Mark current session (the one with the latest updatedAt that hasn't expired)
  const now = new Date();
  const currentSessionId = sessions.find(s => new Date(s.expiresAt) > now)?.id;

  const formatted = sessions.map(s => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    lastActiveAt: s.updatedAt.toISOString(),
    ipAddress: s.ipAddress ?? undefined,
    userAgent: s.userAgent ?? undefined,
    isCurrent: s.id === currentSessionId,
  }));

  return ok(formatted);
});

/**
 * DELETE /api/v1/users/sessions
 * Revoke all sessions except the current one.
 */
export const DELETE = withAuth(async (req, session) => {
  // Get current session token from cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const sessionCookie = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session_token=') || c.startsWith('better-auth.session_token='));
  
  const currentToken = sessionCookie?.split('=')[1];

  // Delete all other sessions
  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      NOT: currentToken ? { token: currentToken } : {},
    },
  });

  return ok({ success: true });
});