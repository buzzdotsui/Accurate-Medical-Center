import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { DischargePatientSchema } from '@/lib/validations/inpatient';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { resolveBranchId } from '@/lib/auth/resource-authorization';

/**
 * POST /api/v1/inpatient/admissions/:id/discharge
 * Discharge an admitted patient and free their bed.
 *
 * Authorization: DOCTOR, NURSE, ADMIN, or SUPER_ADMIN. Branch ownership is
 * enforced in `InpatientService.dischargePatient` against the caller's own
 * branch for non-SUPER_ADMIN users.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  async (req, session, ctx: RouteContext) => {
    const admissionId = await getParam(ctx, 'id');
    const body = await parseBody(req, DischargePatientSchema);
    const branchId = session.user.role === ROLES.SUPER_ADMIN ? undefined : await resolveBranchId(session.user, undefined);
    const admission = await InpatientService.dischargePatient(admissionId, body, session.user.id, branchId);
    return ok(admission, { message: 'Patient discharged successfully' });
  }
);
