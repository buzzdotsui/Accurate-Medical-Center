import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { UpdatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { AppError } from '@/lib/api/errors';
import { RouteContext, getParam } from '@/lib/utils/route-types';

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
 * Update patient details
 * 
 * Authorization:
 * - SUPER_ADMIN: Can update any patient
 * - PATIENT: Cannot update (use patient portal)
 * - Staff: Can update patients in their branch
 */
export const PATCH = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');
  
  if (session.user.role === 'PATIENT') {
    throw new AppError(
      'Patients cannot update their profile via this endpoint.',
      'FORBIDDEN',
      403
    );
  }
  
  // Verify access before updating patient
  await verifyPatientAccess(session.user, patientId, 'UPDATE');
  
  const body = await parseBody(req, UpdatePatientSchema);
  
  const patient = await PatientService.updatePatient({ ...body, id: patientId });
  return ok(patient);
});
