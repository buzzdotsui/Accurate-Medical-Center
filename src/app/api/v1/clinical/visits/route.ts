import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { StartVisitSchema } from '@/lib/validations/clinical';
import { ClinicalService } from '@/services/clinical.service';
import { created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/clinical/visits
 * Start a new clinical visit for a patient (check-in at triage/front desk
 * or directly by a clinician).
 *
 * Authorization: RECEPTIONIST (check-in), NURSE (triage), DOCTOR
 * (starting a consult), ADMIN/SUPER_ADMIN.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE, ROLES.DOCTOR],
  async (req, session) => {
    const body = await parseBody(req, StartVisitSchema);
    const visit = await ClinicalService.startVisit(body, session.user.id);
    return created(visit);
  }
);
