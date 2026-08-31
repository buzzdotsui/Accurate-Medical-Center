import { withRole } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';

/**
 * GET /api/v1/patients/self/dashboard
 * Returns patient-specific dashboard statistics for the authenticated patient.
 *
 * Security: Patient ID is resolved exclusively from the authenticated session.
 * The client never supplies a patientId — no IDOR risk.
 * Authorization: PATIENT role only.
 */
export const GET = withRole([ROLES.PATIENT], async (_req, session) => {
  const { user } = session;

  // Resolve the patient record from the authenticated user
  const patient = await prisma.patient.findFirst({
    where: { userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!patient) {
    throw new AppError(
      'Patient profile not found. Please contact reception.',
      'NOT_FOUND',
      404
    );
  }

  const patientId = patient.id;

  // Fetch all four counts in parallel for efficiency
  const [appointmentCount, labRequestCount, prescriptionCount, pendingInvoices] =
    await Promise.all([
      prisma.appointment.count({
        where: { patientId },
      }),
      prisma.labRequest.count({
        where: { visit: { patientId } },
      }),
      prisma.prescription.count({
        where: { visit: { patientId } },
      }),
      prisma.invoice.findMany({
        where: {
          patientId,
          status: { in: ['DRAFT', 'ISSUED', 'PARTIAL'] },
        },
        select: { totalAmount: true },
      }),
    ]);

  const pendingInvoiceTotal = pendingInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount ?? 0),
    0
  );

  return ok({
    appointmentCount,
    labRequestCount,
    prescriptionCount,
    pendingInvoiceTotal,
  });
});
