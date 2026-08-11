import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { UpdatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';

/**
 * GET /api/v1/patients/[id]
 * Get a specific patient by CUID or PAT-ID
 */
export const GET = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const patient = await PatientService.getPatient(params.id);
  return ok(patient);
});

/**
 * PATCH /api/v1/patients/[id]
 * Update patient details
 */
export const PATCH = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, UpdatePatientSchema);
  
  const patient = await PatientService.updatePatient({ ...body, id: params.id });
  return ok(patient);
});
