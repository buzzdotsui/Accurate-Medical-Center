import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { AppointmentService } from '@/services/appointment.service';
import { ok, forbidden } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';
import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';

/**
 * GET /api/v1/appointments/stats
 * Appointment & visit statistics for dashboard widgets.
 *
 * Scope rules:
 * - SUPER_ADMIN: All branches
 * - ADMIN / RECEPTIONIST / NURSE: Branch-scoped totals
 * - DOCTOR: Their own appointments + consultations only
 *   (doctor ID resolved from session — client cannot override)
 * - PATIENT: Not allowed (403)
 */
export const GET = withAuth(async (_req: NextRequest, session) => {
  const { user } = session;

  // Patients have no business calling this endpoint
  if (user.role === ROLES.PATIENT) {
    return forbidden('Access denied.');
  }

  const branchFilter = buildBranchFilter(user);

  if (user.role === ROLES.DOCTOR) {
    // Resolve the staff record from the session user — never trust client input
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!staff) {
      throw new AppError('Staff profile not found.', 'NOT_FOUND', 404);
    }

    // Today's date boundaries (UTC)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [todayCount, totalPatients, completedConsultations] = await Promise.all([
      // Today's appointments for this doctor
      prisma.appointment.count({
        where: {
          doctorId: staff.id,
          date: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      }),
      // Distinct patients seen by this doctor (completed visits)
      prisma.visit.groupBy({
        by: ['patientId'],
        where: {
          doctorId: staff.id,
          status: 'COMPLETED',
        },
        _count: true,
      }),
      // Completed consultations (visits)
      prisma.visit.count({
        where: {
          doctorId: staff.id,
          status: 'COMPLETED',
        },
      }),
    ]);

    return ok({
      todayAppointments: todayCount,
      myPatientsCount: totalPatients.length,
      consultationsDone: completedConsultations,
    });
  }

  // Branch-level stats for ADMIN, SUPER_ADMIN, RECEPTIONIST, NURSE, etc.
  const stats = await AppointmentService.getDashboardStats(branchFilter.branchId);
  return ok(stats);
});
