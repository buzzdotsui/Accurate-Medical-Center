import { prisma } from '@/lib/db/client';
import { SaveVitalsInput } from '@/lib/validations/vitals';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class VitalsService {
  /**
   * Save vitals to an active visit
   */
  static async saveVitals(data: SaveVitalsInput, executorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: data.visitId },
      include: { patient: true }
    });
    
    if (!visit) throw new AppError('NOT_FOUND', 'Visit not found', 404);
    if (visit.status === 'COMPLETED') throw new AppError('VALIDATION_ERROR', 'Visit is already completed', 400);

    // Save the structured vitals to the JSON column
    const updatedVisit = await prisma.visit.update({
      where: { id: data.visitId },
      data: {
        vitals: {
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate,
          temperature: data.temperature,
          respiratoryRate: data.respiratoryRate,
          oxygenSaturation: data.oxygenSaturation,
          weight: data.weight,
          height: data.height,
          notes: data.notes,
          recordedAt: new Date().toISOString(),
          recordedBy: executorId
        }
      }
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'NURSE',
      action: 'RECORD_VITALS',
      resource: 'VISIT',
      resourceId: visit.id,
      branchId: visit.patient.branchId,
      details: { patientId: visit.patientId }
    });

    return updatedVisit;
  }
}
