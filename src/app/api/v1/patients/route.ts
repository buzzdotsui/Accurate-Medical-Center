import { NextRequest } from 'next/server';
import { withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter, resolveBranchId } from '@/lib/auth/resource-authorization';

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
export const GET = withRole(
  [
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE,
    ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_SCIENTIST, ROLES.RADIOGRAPHER,
    ROLES.ACCOUNTANT, ROLES.THEATRE_STAFF, ROLES.MATERNAL_STAFF,
    ROLES.MENTAL_HEALTH, ROLES.AMBULANCE,
  ],
  async (req, session) => {
    const query = parseQuery(req, ListPatientsQuerySchema);
    const branchFilter = buildBranchFilter(session.user);
    const result = await PatientService.listPatients({
      ...query,
      branchId: branchFilter.branchId,
    });
    return ok(result);
  }
);

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

    const branchId = await resolveBranchId(session.user, body.branchId);

    const patient = await PatientService.createPatient({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      address: body.address,
      bloodGroup: body.bloodGroup,
      genotype: body.genotype,
      branchId,
      auditContext: {
        userId: session.user.id,
        userRole: session.user.role,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        source: 'STAFF_REGISTRATION',
      }
    });
    return created(patient);
  }
);
