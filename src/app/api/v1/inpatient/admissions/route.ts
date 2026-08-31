import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok, created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { AdmitPatientSchema } from '@/lib/validations/inpatient';
import { buildBranchFilter, resolveBranchId } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/inpatient/admissions
 * List all currently active (ADMITTED) admissions, scoped to the caller's
 * branch. Staff-only — ward/admission data is operational, not
 * patient-facing here (patients see their own admissions via their
 * profile/timeline).
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  async (req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const admissions = await InpatientService.getActiveAdmissions(branchFilter.branchId);
    return ok(admissions);
  }
);

/**
 * POST /api/v1/inpatient/admissions
 * Admit a patient and allocate a bed.
 *
 * Authorization: DOCTOR, NURSE, ADMIN, or SUPER_ADMIN. The admitting doctor
 * identity comes from `doctorId` in the body (validated server-side against
 * real, active Staff records in `InpatientService.admitPatient` — never
 * trusted blindly), and branch ownership of both the patient and the bed is
 * enforced against the caller's own branch for non-SUPER_ADMIN users.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  async (req, session) => {
    const body = await parseBody(req, AdmitPatientSchema);
    const branchId = session.user.role === ROLES.SUPER_ADMIN ? undefined : await resolveBranchId(session.user, undefined);
    const admission = await InpatientService.admitPatient(body, session.user.id, branchId);
    return created(admission, 'Patient admitted successfully');
  }
);
