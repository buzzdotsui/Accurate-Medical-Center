import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { CreateConsultationSchema } from '@/lib/validations/consultation';
import { ConsultationService } from '@/services/consultation.service';
import { created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';

/**
 * POST /api/v1/consultations
 * Create a new consultation (SOAP note), diagnoses, and prescriptions,
 * and complete the visit. This is exclusively a doctor's clinical
 * responsibility.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.DOCTOR], async (req, session) => {
  const body = await parseBody(req, CreateConsultationSchema);
  await verifyVisitAccess(session.user, body.visitId, 'UPDATE');
  const consultation = await ConsultationService.saveConsultation(body, session.user.id);
  return created(consultation);
});
