import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

/**
 * PATCH /api/v1/patients/[id]/deactivate
 * Deactivate (soft delete) a patient
 * Requires ADMIN or SUPER_ADMIN role.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, { params }) => {
    const patientId = params.id;
    const patient = await PatientService.deletePatient(patientId, session.user.id);
    return ok(patient);
  }
);