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

  /**
   * Create a prescription for a visit (from visit context - auto-resolves doctor/patient)
   */
  static async createPrescriptionFromVisit(visitId: string, data: {
    items: Array<{
      medicineId: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>;
  }, executorId: string) {
    // Get visit to find doctor and patient
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { patientId: true, doctorId: true },
    });
    
    if (!visit) throw new Error('Visit not found');
    if (!visit.doctorId) throw new Error('Visit has no assigned doctor');

    return this.createPrescription({
      visitId,
      patientId: visit.patientId,
      doctorId: visit.doctorId,
      items: data.items,
    }, executorId);
  }
}
