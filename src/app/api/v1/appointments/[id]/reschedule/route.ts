import { withRole, parseBody } from '@/lib/api/middleware';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';
import { verifyAppointmentAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';
import { z } from 'zod';

const RescheduleSchema = z.object({
  date: z.string().datetime('date must be a valid ISO datetime string'),
  timeSlot: z.string().optional(),
});

/**
 * PATCH /api/v1/appointments/[id]/reschedule
 * Reschedule an existing appointment to a new date and optional time slot.
 *
 * Delegates to AppointmentService.reschedule which:
 *  - Validates the appointment exists
 *  - Rejects reschedule of COMPLETED / CANCELLED appointments
 *  - Resets status to SCHEDULED
 *  - Logs an APPOINTMENT_UPDATED audit event
 *
 * Authorization:
 *  - SUPER_ADMIN, ADMIN, RECEPTIONIST only
 *  - verifyAppointmentAccess enforces branch isolation
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST],
  async (req, session, ctx: RouteContext) => {
    const appointmentId = await getParam(ctx, 'id');
    await verifyAppointmentAccess(session.user, appointmentId, 'UPDATE');
    const body = await parseBody(req, RescheduleSchema);
    const appointment = await AppointmentService.reschedule(
      appointmentId,
      body.date,
      body.timeSlot,
      session.user.id
    );
    return ok(appointment);
  }
);
