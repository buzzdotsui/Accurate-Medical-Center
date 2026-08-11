import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

const ListPatientsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  search: z.string().optional(),
});

/**
 * GET /api/v1/patients
 * List all patients (Requires Authentication)
 * 
 * RBAC:
 * - SUPER_ADMIN: See all patients
 * - ADMIN, DOCTOR, NURSE, PHARMACIST, etc.: See patients in their branch only
 * - PATIENT: Not accessible
 */
export const GET = withAuth(async (req, session) => {
  const query = parseQuery(req, ListPatientsQuerySchema);
  const branchFilter = buildBranchFilter(session.user);
  
  const result = await PatientService.listPatients({
    ...query,
    branchId: branchFilter.branchId,
  });
  return ok(result);
});

/**
 * POST /api/v1/patients
 * Register a new patient
 * Requires RECEPTIONIST, ADMIN, or SUPER_ADMIN role.
 * Patient is registered in the requester's branch.
 */
export const POST = withRole(
  [ROLES.RECEPTIONIST, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  async (req, session) => {
    const body = await parseBody(req, CreatePatientSchema);
    
    // If user specified a branchId, ensure they can only specify their own branch
    if (body.branchId && session.user.role !== ROLES.SUPER_ADMIN) {
      if (body.branchId !== session.user.branchId) {
        throw new Error('FORBIDDEN');
      }
    }
    
    // Use user's branch if not SUPER_ADMIN
    const branchId = session.user.role === ROLES.SUPER_ADMIN 
      ? body.branchId 
      : session.user.branchId;
    
    const patient = await PatientService.createPatient({
      ...body,
      branchId: branchId!,
    }, session.user.id);
    return created(patient);
  }
);
