import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { SaveVitalsSchema } from '@/lib/validations/vitals';
import { VitalsService } from '@/services/vitals.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';

/**
 * POST /api/v1/vitals
 * Save patient vitals to an active visit. "Vitals" is a nurse
 * responsibility; doctors may also record them during a consult.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.NURSE, ROLES.DOCTOR], async (req, session) => {
  const body = await parseBody(req, SaveVitalsSchema);
  await verifyVisitAccess(session.user, body.visitId, 'UPDATE');
  const result = await VitalsService.saveVitals(body, session.user.id);
  return ok(result, { message: 'Vitals recorded successfully' });
});
