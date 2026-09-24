import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/api/public-form';
import { AppError } from '@/lib/api/errors';

/**
 * Proxy (Next.js 16 middleware) for authentication endpoints.
 *
 * Wires the existing Upstash-backed `checkRateLimit(..., 'auth')` helper
 * onto Better Auth's /api/auth/* surface (sign-in, sign-up, password reset).
 *
 * Behavior when Redis/Upstash is not configured: `checkRateLimit` for type
 * 'auth' is a no-op (does not fail closed) so local development remains
 * usable. Public contact/appointment forms retain their existing fail-closed
 * behavior in the route handlers themselves.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  try {
    await checkRateLimit(getClientIp(request), 'auth');
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 429) {
      return NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 },
      );
    }
    // Unexpected rate-limit infrastructure failure: do not block auth
    // entirely — log-free fail-open preserves login availability.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*'],
};
