import { prisma } from '@/lib/db/client';
import { withRole } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';

/**
 * GET /api/v1/patient/lab-results
 * Lab results for the authenticated patient only (via Patient.userId link).
 *
 * PATIENT cannot call /api/v1/laboratory/requests (staff work queue, branch
 * scoping would not isolate patients). This portal endpoint always scopes by
 * session.user.id → Patient.userId, so cross-patient access is impossible.
 */
export const GET = withRole([ROLES.PATIENT], async (_req, session) => {
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true, deletedAt: true },
  });

  if (!patient || patient.deletedAt) {
    throw new AppError('Patient profile not found.', 'NOT_FOUND', 404);
  }

  const requests = await prisma.labRequest.findMany({
    where: { visit: { patientId: patient.id } },
    select: {
      id: true,
      requestId: true,
      testName: true,
      status: true,
      priority: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      result: {
        select: {
          findings: true,
          conclusion: true,
          referenceRange: true,
          isAbnormal: true,
          createdAt: true,
        },
      },
      visit: {
        select: {
          visitId: true,
          startedAt: true,
          doctor: { select: { user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return ok(requests);
});
