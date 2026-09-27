import { withAuth, parseBody } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { auth } from '@/lib/auth/config';
import { z } from 'zod';
import { AuditService } from '@/services/audit.service';

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * PATCH /api/v1/users/password
 * Update the authenticated user's password.
 */
export const PATCH = withAuth(async (req, session) => {
  const body = await parseBody(req, UpdatePasswordSchema);

  // Verify current password by attempting to sign in
  try {
    await auth.api.signInEmail({
      body: {
        email: session.user.email,
        password: body.currentPassword,
      },
    });
  } catch {
    return ok({ error: 'Current password is incorrect' }, { status: 401 });
  }

  // Update password via Better Auth - use changePassword
  await auth.api.changePassword({
    body: {
      newPassword: body.newPassword,
      currentPassword: body.currentPassword,
    },
    headers: new Headers({ 'cookie': req.headers.get('cookie') || '' }),
  });

  await AuditService.log({
    userId: session.user.id,
    userRole: ((session.user as unknown as Record<string, unknown>)?.role as string) || 'USER',
    action: 'PASSWORD_CHANGED' as const,
    resource: 'USER',
    resourceId: session.user.id,
  }).catch(() => {});

  return ok({ success: true });
});