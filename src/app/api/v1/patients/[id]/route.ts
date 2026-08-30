import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody } from '@/lib/api/middleware';
import { UpdatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/patients/[id]
 * Get a specific patient by CUID or PAT-ID
 * 
 * RBAC:
 * - SUPER_ADMIN: Can access any patient
 * - PATIENT: Can only access their own record
 * - Staff: Can only access patients in their branch
 */
export const GET = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');
  
  // Verify access before retrieving patient
  await verifyPatientAccess(session.user, patientId, 'READ');
  
  const patient = await PatientService.getPatient(patientId);
  return ok(patient);
});

/**
 * PATCH /api/v1/patients/[id]
 * Update administrative patient details (demographics, contact info).
 * 
 * Authorization:
 * - SUPER_ADMIN: Can update any patient
 * - ADMIN, RECEPTIONIST: "update administrative patient information" is
 *   their responsibility, scoped to their own branch
 * - PATIENT: Cannot update via this endpoint (use the patient portal)
 * - Other clinical/support roles (DOCTOR, NURSE, PHARMACIST, etc.) do not
 *   edit patient demographic records — they work through visits,
 *   diagnoses, and prescriptions instead.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
  async (req, session, ctx: RouteContext) => {
    const patientId = await getParam(ctx, 'id');

    // Verify access before updating patient
    await verifyPatientAccess(session.user, patientId, 'UPDATE');

    const body = await parseBody(req, UpdatePatientSchema);

    const patient = await PatientService.updatePatient({ ...body, id: patientId }, session.user.id);
    return ok(patient);
  }
);
