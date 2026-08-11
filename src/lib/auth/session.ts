import { auth } from './config';
import { type NextRequest } from 'next/server';
import { AppError } from '@/lib/api/errors';

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

  // Block disabled accounts from accessing any protected resource.
  if (raw.isActive === false) {
    throw new AppError(
      'Your account has been disabled. Please contact your administrator.',
      'FORBIDDEN',
      403,
    );
  }

  const user: SessionUser = {
    id: raw.id as string,
    email: raw.email as string,
    name: (raw.name as string) ?? '',
    role: (raw.role as string) ?? 'PATIENT',
    branchId: raw.branchId as string | null | undefined,
    isActive: raw.isActive as boolean | null | undefined,
    image: raw.image as string | null | undefined,
  };

  return { session: session as NonNullable<AuthSession>, user };
}
