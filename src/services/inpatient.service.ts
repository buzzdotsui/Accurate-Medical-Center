import { prisma } from '@/lib/db/client';
import { AdmitPatientInput } from '@/lib/validations/inpatient';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class InpatientService {
  /**
   * Get all wards and their bed statuses
   */
  static async getWardsOverview() {
    return await prisma.ward.findMany({
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                admission: {
                  include: { patient: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get all active admissions
   */
  static async getActiveAdmissions() {
    return await prisma.admission.findMany({
      where: { status: 'ADMITTED' },
      include: {
        patient: true,
        bed: { include: { room: { include: { ward: true } } } },
        doctor: { include: { user: true } }
      },
      orderBy: { admittedAt: 'desc' }
    });
  }

  /**
   * Admit a patient and allocate a bed
   */
  static async admitPatient(data: AdmitPatientInput, executorId: string) {
    const bed = await prisma.bed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new AppError('Bed not found', 'NOT_FOUND', 404);
    if (bed.status !== 'AVAILABLE') throw new AppError('Bed is not available', 'VALIDATION_ERROR', 400);

    return await prisma.$transaction(async (tx) => {
      // Create admission
      const admission = await tx.admission.create({
        data: {
          admissionId: `ADM-${Date.now()}`,
          patientId: data.patientId,
          doctorId: 'mock-doctor', // Add doctorId to AdmitPatientInput if needed
          bedId: data.bedId,
          reason: data.reason,
          status: 'ADMITTED'
        }
      });

      // Update bed status
      await tx.bed.update({
        where: { id: data.bedId },
        data: { status: 'OCCUPIED' }
      });

      // Audit Log
      await AuditService.log({
        userId: executorId,
        userRole: 'ADMIN', // Or specific ward manager role
        action: 'ADMIT_PATIENT',
        resource: 'ADMISSION',
        resourceId: admission.id,
        details: { patientId: data.patientId, bedId: data.bedId }
      });

      return admission;
    });
  }
}
