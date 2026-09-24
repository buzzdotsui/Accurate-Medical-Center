import { withAuth, withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreateAppointmentSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter, resolveBranchId, verifyPatientAccess, verifyAssignableDoctor } from '@/lib/auth/resource-authorization';
import { PatientService } from '@/services/patient.service';

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
  
  // Patients can only see their own appointments. Self-heals a missing
  // Patient profile (see PatientService.ensureSelfProfile) instead of
  // permanently 404ing a user whose self-registration never completed.
  if (session.user.role === ROLES.PATIENT) {
    const patient = await PatientService.ensureSelfProfile(session.user);
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

    // Patient must be reachable by the caller (branch isolation / self-access).
    const patient = await verifyPatientAccess(session.user, body.patientId, 'UPDATE');

    // Resolve appointment branch. SUPER_ADMIN who omits branchId books into
    // the patient's own branch (not an arbitrary HQ fallback) so the
    // appointment and doctor stay consistent.
    const requestedBranchId =
      body.branchId ??
      (session.user.role === ROLES.SUPER_ADMIN ? patient.branchId : undefined);
    const branchId = await resolveBranchId(session.user, requestedBranchId);

    // doctorId is a client-supplied Staff ID — never trusted blindly.
    if (body.doctorId) {
      await verifyAssignableDoctor(session.user, body.doctorId, branchId);
    }

    const appointment = await AppointmentService.createAppointment(
      { ...body, branchId },
      session.user.id
    );
    return created(appointment);
  }
);
