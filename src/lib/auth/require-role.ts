import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { ROLES, type Role } from '@/config/roles';
import { prisma } from '@/lib/db/client';

/**
 * Server-side page guard for role-scoped dashboard route groups.
 *
 * `(dashboard)/layout.tsx` only verifies that a session exists — it does
 * not restrict which role-specific section a signed-in user can reach.
 * The sidebar (`navConfig`) only hides links for the "wrong" role, which
 * is a UX convenience, not an access control boundary: a NURSE typing
 * `/admin/staff` directly into the address bar would otherwise still
 * render the page. This helper closes that gap at render time, in
 * addition to (never instead of) the per-endpoint `withRole`/`verifyXAccess`
 * checks already enforced in the API layer.
 *
 * SUPER_ADMIN always passes, mirroring the override in
 * `lib/auth/permissions.ts#canAccess`.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user.role as Role) || ROLES.PATIENT;

  if (role !== ROLES.SUPER_ADMIN && !allowedRoles.includes(role)) {
    redirect('/dashboard');
  }

  // Verify staff account is still active (mirrors getSessionUser behaviour)
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.PATIENT) {
    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id as string },
      select: { isActive: true },
    });
    if (staff && !staff.isActive) {
      redirect('/login');
    }
  }

  return session;
}
