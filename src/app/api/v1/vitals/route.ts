import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { SaveVitalsSchema } from '@/lib/validations/vitals';
import { VitalsService } from '@/services/vitals.service';
import { ok } from '@/lib/api/response';

/**
 * POST /api/v1/vitals
 * Save patient vitals to an active visit
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, SaveVitalsSchema);
  const result = await VitalsService.saveVitals(body, session.user.id);
  return ok(result, { message: 'Vitals recorded successfully' });
});
