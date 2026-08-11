import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { SaveRadiologyReportSchema } from '@/lib/validations/radiology';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';

export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const requestId = await getParam(ctx, 'id');
  const body = await parseBody(req, SaveRadiologyReportSchema);
  const result = await RadiologyService.saveReport(requestId, body, session.user.id);
  return ok(result, { message: 'Radiology report saved successfully' });
});
