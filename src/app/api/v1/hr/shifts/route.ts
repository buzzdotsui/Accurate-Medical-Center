import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { AssignShiftSchema } from '@/lib/validations/hr';
import { HrService } from '@/services/hr.service';
import { ok } from '@/lib/api/response';

export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, AssignShiftSchema);
  const result = await HrService.assignShift(body, session.user.id);
  return ok(result, { message: 'Shift assigned successfully' });
});
