import { prisma } from '@/lib/db/client';
import { DispensePrescriptionInput } from '@/lib/validations/pharmacy';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class PharmacyService {
  /**
   * Get all pending prescriptions
   * Optionally filtered by branchId
   */
  static async getPendingPrescriptions(branchId?: string) {
    return await prisma.prescription.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        ...(branchId ? { branchId } : {}),
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

    if (!prescription) throw new AppError('Prescription not found', 'NOT_FOUND', 404);
    if (prescription.status === 'DISPENSED') throw new AppError('Prescription already dispensed', 'VALIDATION_ERROR', 400);

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
