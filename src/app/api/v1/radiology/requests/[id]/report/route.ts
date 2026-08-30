import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { SaveRadiologyReportSchema } from '@/lib/validations/radiology';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/radiology/requests/:id/report
 * Save a radiology report.
 *
 * Authorization: RADIOGRAPHER or SUPER_ADMIN only. Previously open to
 * any authenticated user, allowing anyone (including a PATIENT) to write
 * clinical radiology reports.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.RADIOGRAPHER], async (req, session, ctx: RouteContext) => {
  const requestId = await getParam(ctx, 'id');
  const body = await parseBody(req, SaveRadiologyReportSchema);
  const result = await RadiologyService.saveReport(requestId, body, session.user.id);
  return ok(result, { message: 'Radiology report saved successfully' });
});
