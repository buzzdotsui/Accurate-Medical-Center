import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreatePatientSchema } from '@/lib/validations/patient';
import { PatientService } from '@/services/patient.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

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
    
    // Resolve branchId from session, or for SUPER_ADMIN fall back to HQ branch
    let branchId = session.user.role === ROLES.SUPER_ADMIN 
      ? body.branchId 
      : session.user.branchId;
    
    if (!branchId && session.user.role === ROLES.SUPER_ADMIN) {
      const hq = await prisma.branch.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (!hq) throw new Error('No active branch found.');
      branchId = hq.id;
    }
    
    const patient = await PatientService.createPatient({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      address: body.address,
      bloodGroup: body.bloodGroup,
      branchId: branchId!,
      auditContext: {
        userId: session.user.id,
        userRole: session.user.role,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    });
    return created(patient);
  }
);
