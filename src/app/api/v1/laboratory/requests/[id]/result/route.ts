import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { SaveLabResultSchema } from '@/lib/validations/laboratory';
import { LaboratoryService } from '@/services/laboratory.service';
import { ok } from '@/lib/api/response';

/**
 * POST /api/v1/laboratory/requests/:id/result
 * Save lab result and complete request
 */
export const POST = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, SaveLabResultSchema);
  const result = await LaboratoryService.saveResult(params.id, body, session.user.id);
  return ok(result, { message: 'Lab result saved successfully' });
});
