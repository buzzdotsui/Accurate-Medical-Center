import { withAuth, parseBody } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const UpdateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * PATCH /api/v1/users/email
 * Update the authenticated user's email address.
 * Note: This should trigger email verification in production.
 */
export const PATCH = withAuth(async (req, session) => {
  const body = await parseBody(req, UpdateEmailSchema);

  // Check if email is already taken
  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existing && existing.id !== session.user.id) {
    return ok({ error: 'Email already in use' }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: body.email,
      emailVerified: false, // Require re-verification
    },
    select: { id: true, name: true, email: true, emailVerified: true, role: true },
  });

  return ok(user);
});