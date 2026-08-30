import { withRole, parseBody } from '@/lib/api/middleware';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { SetPatientStatusSchema } from '@/lib/validations/patient';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/patients/[id]/status
 * Activate (restore) or deactivate (soft-delete) a patient record.
 *
 * Authorization: SUPER_ADMIN, ADMIN, or RECEPTIONIST.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
  async (req, session, ctx: RouteContext) => {
    const patientId = await getParam(ctx, 'id');

    await verifyPatientAccess(session.user, patientId, 'UPDATE');

    const { isActive } = await parseBody(req, SetPatientStatusSchema);

    const patient = isActive
      ? await PatientService.activatePatient(patientId, session.user.id)
      : await PatientService.deletePatient(patientId, session.user.id);

    return ok(patient);
  }
);
