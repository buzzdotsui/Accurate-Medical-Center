import { withAuth } from '@/lib/api/middleware';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';
import { verifyAppointmentAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * GET /api/v1/appointments/[id]
 * Fetch a single appointment by its database ID.
 *
 * Authorization:
 * - SUPER_ADMIN: any appointment
 * - Staff: own-branch appointments only (verifyAppointmentAccess)
 * - PATIENT: own appointments only (verifyAppointmentAccess)
 */
export const GET = withAuth(async (req, session, ctx: RouteContext) => {
  const appointmentId = await getParam(ctx, 'id');
  await verifyAppointmentAccess(session.user, appointmentId, 'READ');
  const appointment = await AppointmentService.getAppointment(appointmentId);
  return ok(appointment);
});
