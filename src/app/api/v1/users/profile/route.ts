import { withAuth, parseBody } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
});

/**
 * PATCH /api/v1/users/profile
 * Update the authenticated user's profile (name, email, phone).
 */
export const PATCH = withAuth(async (req, session) => {
  const body = await parseBody(req, UpdateProfileSchema);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name,
      email: body.email,
      // Phone would need to be stored in staff/patient profile
    },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, updatedAt: true },
  });

  return ok(user);
});

/**
 * GET /api/v1/users/profile
 * Get the authenticated user's profile.
 */
export const GET = withAuth(async (_req, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    return ok(null);
  }

  return ok(user);
});