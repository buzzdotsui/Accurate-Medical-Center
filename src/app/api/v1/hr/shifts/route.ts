import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { AssignShiftSchema } from '@/lib/validations/hr';
import { HrService } from '@/services/hr.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/hr/shifts
 * Shift assignment is an administrative (staff management) action.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (req, session) => {
  const body = await parseBody(req, AssignShiftSchema);
  const result = await HrService.assignShift(body, session.user.id);
  return ok(result, { message: 'Shift assigned successfully' });
});
