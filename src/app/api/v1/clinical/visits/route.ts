import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { StartVisitSchema } from '@/lib/validations/clinical';
import { ClinicalService } from '@/services/clinical.service';
import { created } from '@/lib/api/response';

/**
 * POST /api/v1/clinical/visits
 * Start a new clinical visit for a patient
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, StartVisitSchema);
  const visit = await ClinicalService.startVisit(body, session.user.id);
  return created(visit);
});
