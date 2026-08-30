import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { SaveLabResultSchema } from '@/lib/validations/laboratory';
import { LaboratoryService } from '@/services/laboratory.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/laboratory/requests/:id/result
 * Save lab result and complete request.
 *
 * Authorization: LAB_SCIENTIST or SUPER_ADMIN only. Previously open to
 * any authenticated user, allowing anyone (including a PATIENT) to write
 * clinical lab results.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.LAB_SCIENTIST], async (req, session, ctx: RouteContext) => {
  const requestId = await getParam(ctx, 'id');
  const body = await parseBody(req, SaveLabResultSchema);
  const result = await LaboratoryService.saveResult(requestId, body, session.user.id);
  return ok(result, { message: 'Lab result saved successfully' });
});
