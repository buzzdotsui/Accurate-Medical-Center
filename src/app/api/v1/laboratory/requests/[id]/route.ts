import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { verifyLabRequestAccess } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';
import { ok, notFound } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/laboratory/requests/:id
 * Fetch a single lab request with its visit/patient, doctor, and category
 * details — used by the "Input Lab Result" page to render the real request
 * context instead of mock data.
 *
 * Authorization: SUPER_ADMIN, LAB_SCIENTIST, DOCTOR, ADMIN.
 * Branch isolation is enforced via `verifyLabRequestAccess`, which also
 * returns a 404 for a nonexistent request and a 403 for a request outside
 * the caller's branch.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.LAB_SCIENTIST, ROLES.DOCTOR, ROLES.ADMIN],
  async (req, session, ctx: RouteContext) => {
    const requestId = await getParam(ctx, 'id');
    await verifyLabRequestAccess(session.user, requestId);

    const request = await prisma.labRequest.findUnique({
      where: { id: requestId },
      include: {
        visit: { include: { patient: true } },
        doctor: { include: { user: true } },
        category: true,
      },
    });

    if (!request) return notFound('Lab request');

    return ok(request);
  }
);
