import { prisma } from '@/lib/db/client';
import { withRole } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { AppError } from '@/lib/api/errors';

/**
 * GET /api/v1/patient/prescriptions
 * Prescriptions for the authenticated patient only (via Patient.userId link).
 *
 * Staff pharmacy queue intentionally excludes PATIENT (branch filter would
 * not isolate patients). This portal endpoint always scopes by session user,
 * so a patient only ever sees their own prescriptions.
 */
export const GET = withRole([ROLES.PATIENT], async (_req, session) => {
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true, deletedAt: true },
  });

  if (!patient || patient.deletedAt) {
    throw new AppError('Patient profile not found.', 'NOT_FOUND', 404);
  }

  const prescriptions = await prisma.prescription.findMany({
    where: { visit: { patientId: patient.id } },
    select: {
      id: true,
      prescriptionId: true,
      status: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          dosage: true,
          frequency: true,
          duration: true,
          quantity: true,
          dispensedQty: true,
          instructions: true,
          medicine: { select: { name: true, genericName: true, unit: true } },
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

  return ok(prescriptions);
});
