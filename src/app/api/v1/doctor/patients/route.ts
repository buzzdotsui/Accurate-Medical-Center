import { NextRequest } from 'next/server';
import { withRole, parseQuery } from '@/lib/api/middleware';
import { ClinicalService } from '@/services/clinical.service';
import { ok } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

const ListDoctorPatientsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  search: z.string().optional(),
});

/**
 * GET /api/v1/doctor/patients
 * List patients assigned to the authenticated doctor (patients they have visited or have appointments with).
 * 
 * Authorization: DOCTOR, ADMIN, SUPER_ADMIN
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR],
  async (req, session) => {
    const query = parseQuery(req, ListDoctorPatientsQuerySchema);
    const branchFilter = buildBranchFilter(session.user);

    // Get the doctor's staff ID
    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    const doctorId = staff?.id;

    // Get patients from visits where this doctor was the attending physician
    // Also include patients from appointments with this doctor
    const where: Record<string, unknown> = {
      branchId: branchFilter.branchId,
    };

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip: query.skip,
        take: query.take,
        include: {
          branch: { select: { name: true, code: true } },
          appointments: {
            where: { doctorId },
            take: 1,
            orderBy: { date: 'desc' },
            select: { id: true, date: true, status: true, appointmentId: true },
          },
          visits: {
            where: { doctorId },
            take: 1,
            orderBy: { startedAt: 'desc' },
            select: { id: true, startedAt: true, status: true, visitId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return ok({ total, patients });
  }
);

export const runtime = 'nodejs';