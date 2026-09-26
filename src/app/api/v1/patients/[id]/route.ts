import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { UpdatePatientSchema } from '@/lib/validations/patient';
import { AppError } from '@/lib/api/errors';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * PATCH /api/v1/patients/[id]
 * Update a patient's information
 * Requires ADMIN or SUPER_ADMIN role.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req, session, { params }) => {
    const body = await parseBody(req, UpdatePatientSchema);
    const patientId = params.id;

    const patient = await PatientService.updatePatient(
      { id: patientId, ...body },
      session.user.id
    );
    return ok(patient);
  }
);