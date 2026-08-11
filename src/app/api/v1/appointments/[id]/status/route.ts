import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { UpdateAppointmentStatusSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';
import { verifyAppointmentAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/appointments/[id]/status
 * Update the status of an appointment
 * 
 * Authorization:
 * - User must have access to the appointment (verified by verifyAppointmentAccess)
 * - Only staff and admin can update status (not patients)
 */
export const PATCH = withAuth(async (req, session, ctx: RouteContext) => {
  const appointmentId = await getParam(ctx, 'id');
  
  // Verify user can access this appointment
  await verifyAppointmentAccess(session.user, appointmentId, 'UPDATE');
  
  const body = await parseBody(req, UpdateAppointmentStatusSchema);
  
  const appointment = await AppointmentService.updateStatus(appointmentId, body, session.user.id);
  return ok(appointment);
});
