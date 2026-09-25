import { NextRequest } from 'next/server';
import { withRole, parseQuery } from '@/lib/api/middleware';
import { PrescriptionService } from '@/services/prescription.service';
import { ok } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';

const ListDoctorPrescriptionsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  status: z.string().optional(),
});

/**
 * GET /api/v1/doctor/prescriptions
 * List prescriptions created by the authenticated doctor.
 * 
 * Authorization: DOCTOR, ADMIN, SUPER_ADMIN
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR],
  async (req, session) => {
    const query = parseQuery(req, ListDoctorPrescriptionsQuerySchema);
    const branchFilter = buildBranchFilter(session.user);

    // Get the doctor's staff ID
    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    const doctorId = staff?.id;

    if (!doctorId) {
      return ok({ total: 0, prescriptions: [] });
    }

    const where: Record<string, unknown> = {
      doctorId,
      branchId: branchFilter.branchId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [total, prescriptions] = await Promise.all([
      prisma.prescription.count({ where }),
      prisma.prescription.findMany({
        where,
        skip: query.skip,
        take: query.take,
        include: {
          visit: { 
            select: { 
              id: true, 
              visitId: true, 
              startedAt: true,
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  patientId: true,
                }
              }
            } 
          },
          items: {
            include: {
              medicine: { select: { name: true, unit: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return ok({ total, prescriptions });
  }
);

export const runtime = 'nodejs';