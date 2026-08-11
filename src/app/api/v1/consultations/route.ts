import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { CreateConsultationSchema } from '@/lib/validations/consultation';
import { ConsultationService } from '@/services/consultation.service';
import { created } from '@/lib/api/response';

/**
 * POST /api/v1/consultations
 * Create a new consultation (SOAP note) and complete the visit
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, CreateConsultationSchema);
  const consultation = await ConsultationService.saveConsultation(body, session.user.id);
  return created(consultation);
});
