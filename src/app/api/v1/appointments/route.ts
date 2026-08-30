import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreateAppointmentSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';
import { buildBranchFilter, resolveBranchId } from '@/lib/auth/resource-authorization';
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
 * Create a new appointment (staff-side scheduling).
 *
 * Authorization:
 * - RECEPTIONIST creates/manages appointments; ADMIN has appointment
 *   administration; SUPER_ADMIN has full access.
 * - Patients booking themselves go through the separate public booking
 *   flow (`AppointmentService.requestPublicAppointment`), not this route.
 * - Appointments are created in user's branch (or specified branch for SUPER_ADMIN)
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
  async (req, session) => {
    const body = await parseBody(req, CreateAppointmentSchema);

    const branchId = await resolveBranchId(session.user, body.branchId);

    const appointment = await AppointmentService.createAppointment(
      { ...body, branchId },
      session.user.id
    );
    return created(appointment);
  }
);
