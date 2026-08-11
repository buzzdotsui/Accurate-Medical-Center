import { NextRequest } from 'next/server';
import { withAuth, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreateAppointmentSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';

const ListAppointmentsQuerySchema = z.object({
  branchId: z.string().optional(),
  doctorId: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
});

/**
 * GET /api/v1/appointments
 * List appointments with optional filters
 */
export const GET = withAuth(async (req) => {
  const query = parseQuery(req, ListAppointmentsQuerySchema);
  const appointments = await AppointmentService.listAppointments(query);
  return ok(appointments);
});

/**
 * POST /api/v1/appointments
 * Create a new appointment
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, CreateAppointmentSchema);
  const appointment = await AppointmentService.createAppointment(body, session.user.id);
  return created(appointment);
});
