import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { SaveRadiologyReportSchema } from '@/lib/validations/radiology';
import { RadiologyService } from '@/services/radiology.service';
import { ok } from '@/lib/api/response';

export const POST = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, SaveRadiologyReportSchema);
  const result = await RadiologyService.saveReport(params.id, body, session.user.id);
  return ok(result, { message: 'Radiology report saved successfully' });
});
