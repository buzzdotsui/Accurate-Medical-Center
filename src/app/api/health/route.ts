import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/health
 * Unauthenticated liveness/readiness probe for uptime monitors, load
 * balancers, and the Phase 7 smoke test.
 *
 * - 200: app up and database reachable
 * - 503: database unreachable (app process still running)
 *
 * Exempt from global rate limiting (see withApiHandler).
 */
export async function GET() {
  const startedAt = Date.now();
  const body = {
    status: 'ok' as 'ok' | 'degraded',
    service: 'accurate-medical-center-hms',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown' as 'up' | 'down',
      latencyMs: 0,
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    body.status = 'ok';
    body.checks.database = 'up';
  } catch {
    body.status = 'degraded';
    body.checks.database = 'down';
  }

  body.checks.latencyMs = Date.now() - startedAt;

  return Response.json(body, {
    status: body.status === 'ok' ? 200 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
