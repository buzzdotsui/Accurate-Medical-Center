import { prisma } from '@/lib/db/client';
import { generatePrescriptionId } from '@/lib/utils/generate-id';
import { AuditService } from './audit.service';

export class PrescriptionService {
  /**
   * Create a prescription for a visit
   */
  static async createPrescription(data: {
    visitId: string;
    patientId: string;
    doctorId: string;
    notes?: string;
    items: Array<{
      medicineId: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>;
  }, executorId: string) {
    return await prisma.$transaction(async (tx) => {
      const total = await tx.prescription.count();
      const prescriptionId = generatePrescriptionId(total + 1);

      const prescription = await tx.prescription.create({
        data: {
          prescriptionId,
          visitId: data.visitId,
          doctorId: data.doctorId,
          status: 'PENDING',
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              medicineId: item.medicineId,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              quantity: item.quantity,
              instructions: item.instructions,
            }))
          }
        },
        include: { items: true }
      });

      await AuditService.log({
        userId: executorId,
        userRole: 'DOCTOR',
        action: 'CREATE_PRESCRIPTION',
        resource: 'PRESCRIPTION',
        resourceId: prescription.id,
      });

      return prescription;
    });
  }
}
