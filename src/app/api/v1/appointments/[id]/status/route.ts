import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { UpdateAppointmentStatusSchema } from '@/lib/validations/appointment';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';
import { verifyAppointmentAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * PATCH /api/v1/appointments/[id]/status
 * Update the status of an appointment (check-in, cancel, complete, etc.)
 * 
 * Authorization:
 * - Only staff who legitimately touch the appointment lifecycle: RECEPTIONIST
 *   (check-in/cancel), DOCTOR/NURSE (arrival/completion during care),
 *   ADMIN/SUPER_ADMIN (appointment administration). Patients cannot
 *   directly transition status.
 * - `verifyAppointmentAccess` additionally enforces branch scoping.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE],
  async (req, session, ctx: RouteContext) => {
    const appointmentId = await getParam(ctx, 'id');

    // Verify user can access this appointment
    await verifyAppointmentAccess(session.user, appointmentId, 'UPDATE');

    const body = await parseBody(req, UpdateAppointmentStatusSchema);

    const appointment = await AppointmentService.updateStatus(appointmentId, body, session.user.id);
    return ok(appointment);
  }
);
