import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';

const ListPatientsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  search: z.string().optional(),
});

/**
 * GET /api/v1/patients
 * List all patients (Requires Authentication)
 */
export const GET = withAuth(async (req) => {
  const query = parseQuery(req, ListPatientsQuerySchema);
  const result = await PatientService.listPatients(query);
  return ok(result);
});

/**
 * POST /api/v1/patients
 * Register a new patient
 * Requires RECEPTIONIST, ADMIN, or SUPER_ADMIN role.
 */
export const POST = withRole(
  [ROLES.RECEPTIONIST, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  async (req) => {
    const body = await parseBody(req, CreatePatientSchema);
    const patient = await PatientService.createPatient(body);
    return created(patient);
  }
);
