import { prisma } from '@/lib/db/client';
import { CreateConsultationInput } from '@/lib/validations/consultation';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class ConsultationService {
  /**
   * Save a consultation (SOAP notes) and optionally complete the visit
   */
  static async saveConsultation(data: CreateConsultationInput, executorId: string) {
    // Verify visit exists and is active
    const visit = await prisma.visit.findUnique({
      where: { id: data.visitId },
      include: { patient: true }
    });
    
    if (!visit) throw new AppError('NOT_FOUND', 'Visit not found', 404);
    if (visit.status === 'COMPLETED') throw new AppError('VALIDATION_ERROR', 'Visit is already completed', 400);

    // Run within a transaction to ensure consultation, prescriptions, and visit status all commit together
    return await prisma.$transaction(async (tx) => {
      // 1. Create Consultation Record
      const consultation = await tx.clinicalNote.create({
        data: {
          visitId: data.visitId,
          noteText: JSON.stringify({
            subjective: data.subjective,
            objective: data.objective,
            assessment: data.assessment,
            plan: data.plan,
            diagnosis: data.diagnosis || [],
          })
        },
      });

      // 2. Create Prescriptions if any
      if (data.prescriptions && data.prescriptions.length > 0) {
        await tx.prescription.create({
          data: {
            prescriptionId: "RX-" + Date.now(),
            visitId: data.visitId,
            doctorId: visit.doctorId!,
            status: 'PENDING'
          }
        });
      }

      // 3. Mark Visit as Completed
      await tx.visit.update({
        where: { id: data.visitId },
        data: { 
          status: 'COMPLETED',
          // Automatically update the underlying appointment if one exists
          ...(visit.appointmentId ? { appointment: { update: { status: 'COMPLETED' } } } : {})
        }
      });

      // 4. Audit Log
      await AuditService.log({
        userId: executorId,
        userRole: 'DOCTOR',
        action: 'CREATE_CONSULTATION',
        resource: 'CONSULTATION',
        resourceId: consultation.id,
        branchId: visit.patient.branchId,
        details: { visitId: data.visitId, patientId: visit.patientId }
      });

      return consultation;
    });
  }
}
