import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { UpdateAppointmentStatusSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';

/**
 * PATCH /api/v1/appointments/[id]/status
 * Update the status of an appointment
 */
export const PATCH = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, UpdateAppointmentStatusSchema);
  
  const appointment = await AppointmentService.updateStatus(params.id, body, session.user.id);
  return ok(appointment);
});
