import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { verifyRadiologyRequestAccess } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';
import { ok, notFound } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';

/**
 * GET /api/v1/radiology/requests/:id
 * Fetch a single radiology request with its visit/patient and doctor
 * details — used by the "Diagnostic Report" page to render the real
 * request context instead of mock data.
 *
 * DEFERRED — radiology workflows are not part of paid Phase 1 scope
 * (invoice TTI/2026/HMS-P1-002). Source preserved for a future phase.
 *
 * Authorization: SUPER_ADMIN, RADIOGRAPHER, DOCTOR, ADMIN.
 * Branch isolation is enforced via `verifyRadiologyRequestAccess`, which
 * also returns a 404 for a nonexistent request and a 403 for a request
 * outside the caller's branch.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.RADIOGRAPHER, ROLES.DOCTOR, ROLES.ADMIN],
  async (req, session, ctx: RouteContext) => {
    if (!isDeferredModuleEnabled()) {
      throw new AppError(
        'This module is not included in the current Phase 1 release.',
        'FORBIDDEN',
        403,
      );
    }
    const requestId = await getParam(ctx, 'id');
    await verifyRadiologyRequestAccess(session.user, requestId);

    const request = await prisma.radiologyRequest.findUnique({
      where: { id: requestId },
      include: {
        visit: { include: { patient: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!request) return notFound('Radiology request');

    return ok(request);
  }
);
