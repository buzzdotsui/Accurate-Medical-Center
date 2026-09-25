import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { SaveRadiologyReportSchema } from '@/lib/validations/radiology';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';
import { verifyRadiologyRequestAccess } from '@/lib/auth/resource-authorization';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';

/**
 * POST /api/v1/radiology/requests/:id/report
 * Save a radiology report.
 *
 * DEFERRED — radiology workflows are not part of paid Phase 1 scope
 * (invoice TTI/2026/HMS-P1-002). Source preserved for a future phase.
 *
 * Authorization: RADIOGRAPHER or SUPER_ADMIN only. Previously open to
 * any authenticated user, allowing anyone (including a PATIENT) to write
 * clinical radiology reports.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.RADIOGRAPHER], async (req, session, ctx: RouteContext) => {
  if (!isDeferredModuleEnabled()) {
    throw new AppError(
      'This module is not included in the current Phase 1 release.',
      'FORBIDDEN',
      403,
    );
  }
  const requestId = await getParam(ctx, 'id');
  await verifyRadiologyRequestAccess(session.user, requestId, 'UPDATE');
  const body = await parseBody(req, SaveRadiologyReportSchema);
  const result = await RadiologyService.saveReport(requestId, body, session.user.id);
  return ok(result, { message: 'Radiology report saved successfully' });
});
