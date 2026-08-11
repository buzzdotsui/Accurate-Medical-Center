import { prisma } from '@/lib/db/client';
import { CreateConsultationInput } from '@/lib/validations/consultation';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { generatePrescriptionId } from '@/lib/utils/generate-id';

export class ConsultationService {
  static async saveConsultation(data: CreateConsultationInput, executorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: data.visitId },
      include: { patient: true }
    });
    
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    if (visit.status === 'COMPLETED') throw new AppError('Visit is already completed', 'VALIDATION_ERROR', 400);
    if (!visit.doctorId && data.prescriptions?.length) {
      throw new AppError('Visit has no assigned doctor for prescriptions', 'BAD_REQUEST', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
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

      if (data.diagnosis && data.diagnosis.length > 0) {
        for (const desc of data.diagnosis) {
          await tx.diagnosis.create({
          data: {
            visitId: data.visitId,
            description: desc,
            type: 'PRIMARY',
          }});
        }
      }

      if (data.prescriptions && data.prescriptions.length > 0) {
        const prescriptionCount = await tx.prescription.count();
        const prescId = generatePrescriptionId(prescriptionCount + 1);
        const prescription = await tx.prescription.create({
          data: {
            prescriptionId: prescId,
            visitId: data.visitId,
            doctorId: visit.doctorId!,
            status: 'PENDING',
            notes: data.prescriptions.map((p) => `${p.medicationName} - ${p.dosage} ${p.frequency} for ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`).join('\n'),
          }
        });
      }

      await tx.visit.update({
        where: { id: data.visitId },
        data: { 
          status: 'COMPLETED',
          endedAt: new Date(),
          ...(visit.appointmentId ? { appointment: { update: { status: 'COMPLETED' } } } : {})
        }
      });

      return { consultation };
    });

    await AuditService.log({
      userId: executorId, userRole: 'DOCTOR', action: 'CREATE_CONSULTATION',
      resource: 'CONSULTATION', resourceId: result.consultation.id,
      branchId: visit.patient.branchId,
      details: { visitId: data.visitId, patientId: visit.patientId,
        rxCount: data.prescriptions?.length ?? 0,
        dxCount: data.diagnosis?.length ?? 0 }
    }).catch(() => {});

    return result;
  }
}
