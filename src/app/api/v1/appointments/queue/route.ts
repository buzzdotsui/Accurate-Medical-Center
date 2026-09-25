import { NextRequest } from 'next/server';
import { withRole, parseQuery } from '@/lib/api/middleware';
import { AppointmentService } from '@/services/appointment.service';
import { ok } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

const ListQueueQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  status: z.string().optional(),
});

/**
 * GET /api/v1/appointments/queue
 * Get the doctor's patient queue (appointments with visits in progress or scheduled for today).
 * 
 * Authorization: DOCTOR, NURSE, RECEPTIONIST, ADMIN, SUPER_ADMIN
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  async (req, session) => {
    const query = parseQuery(req, ListQueueQuerySchema);
    const branchFilter = buildBranchFilter(session.user);

    let doctorId: string | undefined;
    if (session.user.role === ROLES.DOCTOR) {
      const staff = await prisma.staff.findUnique({ where: { userId: session.user.id }, select: { id: true } });
      doctorId = staff?.id;
    }

    const result = await AppointmentService.listQueue({
      skip: query.skip,
      take: query.take,
      status: query.status,
      doctorId,
      branchId: branchFilter.branchId,
    });

    return ok(result);
  }
);

export const runtime = 'nodejs';