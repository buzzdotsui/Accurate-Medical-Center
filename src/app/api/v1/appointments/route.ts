import { NextRequest } from 'next/server';
import { withAuth, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreateAppointmentSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

const ListAppointmentsQuerySchema = z.object({
  branchId: z.string().optional(),
  doctorId: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  patientId: z.string().optional(),
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
});

/**
 * GET /api/v1/appointments
 * List appointments with optional filters
 * 
 * RBAC:
 * - SUPER_ADMIN: See all appointments
 * - ADMIN, DOCTOR, NURSE, RECEPTIONIST: See appointments in their branch
 * - PATIENT: See their own appointments only
 * - Other roles: Limited visibility based on clinical responsibility
 */
export const GET = withAuth(async (req, session) => {
  const query = parseQuery(req, ListAppointmentsQuerySchema);
  const branchFilter = buildBranchFilter(session.user);
  
  // Patients can only see their own appointments
  if (session.user.role === ROLES.PATIENT) {
    const patient = await prisma.patient.findFirst({
      where: { user: { id: session.user.id } },
      select: { id: true },
    });
    if (!patient) {
      throw new AppError(
        'Patient profile not found.',
        'NOT_FOUND',
        404
      );
    }
    query.patientId = patient.id;
  }
  
  const appointments = await AppointmentService.listAppointments({
    ...query,
    branchId: branchFilter.branchId,
  });
  return ok(appointments);
});

/**
 * POST /api/v1/appointments
 * Create a new appointment
 * 
 * Authorization:
 * - RECEPTIONIST, DOCTOR, NURSE, PATIENT can create appointments
 * - Appointments are created in user's branch (or specified branch for SUPER_ADMIN)
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, CreateAppointmentSchema);
  
  // Enforce branch isolation
  if (body.branchId && session.user.role !== ROLES.SUPER_ADMIN) {
    if (body.branchId !== session.user.branchId) {
      throw new AppError(
        'You can only create appointments in your branch.',
        'FORBIDDEN',
        403
      );
    }
  }
  
  // Use user's branch if not SUPER_ADMIN
  let branchId = session.user.role === ROLES.SUPER_ADMIN 
    ? body.branchId 
    : session.user.branchId;
  
  // SUPER_ADMIN may not have a personal branchId — fall back to the first (HQ) branch
  if (!branchId && session.user.role === ROLES.SUPER_ADMIN) {
    const hq = await prisma.branch.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!hq) {
      throw new AppError('No active branch found. Please create a branch first.', 'BAD_REQUEST', 400);
    }
    branchId = hq.id;
  }
  
  const appointment = await AppointmentService.createAppointment(
    { ...body, branchId: branchId! },
    session.user.id
  );
  return created(appointment);
});
