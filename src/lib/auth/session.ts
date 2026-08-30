import { auth } from './config';
import { type NextRequest } from 'next/server';
import { AppError } from '@/lib/api/errors';
import { prisma } from '@/lib/db/client';
import { ROLES } from '@/config/roles';

/**
 * A typed representation of the authenticated user extracted from a session.
 * This is the authoritative type passed through all auth HOFs.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string | null | undefined;
  isActive: boolean | null | undefined;
  image?: string | null;
}

/**
 * Inferred session type from Better Auth.
 */
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Resolves and validates the session from a Next.js request.
 *
 * @throws {AppError} 401 if no session exists.
 * @throws {AppError} 403 if the account is disabled.
 */
export async function getSessionUser(req: NextRequest): Promise<{
  session: NonNullable<AuthSession>;
  user: SessionUser;
}> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    throw new AppError('Authentication required.', 'UNAUTHORIZED', 401);
  }

  const raw = session.user as Record<string, unknown>;
  const role = (raw.role as string) ?? ROLES.PATIENT;

  // Deactivated staff must be blocked immediately, even mid-session.
  // There is no `isActive` column/additionalField on the Better Auth
  // `User` record, so `raw.isActive` is never actually populated by
  // Better Auth — checking it here would silently never trigger. The real,
  // authoritative flag is `Staff.isActive` (toggled by
  // `StaffService.setActive`), so we look it up directly for staff roles.
  let isActive: boolean | null = null;
  if (role !== ROLES.PATIENT) {
    const staff = await prisma.staff.findUnique({
      where: { userId: raw.id as string },
      select: { isActive: true },
    });
    isActive = staff?.isActive ?? null;

    if (staff && !staff.isActive) {
      throw new AppError(
        'Your account has been disabled. Please contact your administrator.',
        'FORBIDDEN',
        403,
      );
    }
  }

  const user: SessionUser = {
    id: raw.id as string,
    email: raw.email as string,
    name: (raw.name as string) ?? '',
    role,
    branchId: raw.branchId as string | null | undefined,
    isActive,
    image: raw.image as string | null | undefined,
  };

  return { session: session as NonNullable<AuthSession>, user };
}
