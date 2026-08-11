import { prisma } from '@/lib/db/client';
import { DispensePrescriptionInput } from '@/lib/validations/pharmacy';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class PharmacyService {
  /**
   * Get all pending prescriptions
   */
  static async getPendingPrescriptions() {
    return await prisma.prescription.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] }
      },
      include: {
        visit: {
          include: { patient: true }
        },
        doctor: {
          include: { user: true }
        },
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Dispense a prescription
   */
  static async dispensePrescription(id: string, data: DispensePrescriptionInput, executorId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { visit: true }
    });

    if (!prescription) throw new AppError('NOT_FOUND', 'Prescription not found', 404);
    if (prescription.status === 'DISPENSED') throw new AppError('VALIDATION_ERROR', 'Prescription already dispensed', 400);

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes
      }
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'PHARMACIST',
      action: 'DISPENSE_PRESCRIPTION',
      resource: 'PRESCRIPTION',
      resourceId: updated.id,
      details: { status: data.status }
    });

    return updated;
  }
}
