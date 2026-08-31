import { prisma } from '@/lib/db/client';
import { CreateConsultationInput } from '@/lib/validations/consultation';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { generatePrescriptionId, generateLabRequestId, generateRadiologyRequestId } from '@/lib/utils/generate-id';

export class ConsultationService {
  static async saveConsultation(data: CreateConsultationInput, executorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: data.visitId },
      include: { patient: true }
    });
    
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    if (visit.status === 'COMPLETED') throw new AppError('Visit is already completed', 'VALIDATION_ERROR', 400);
    const requiresDoctor = Boolean(data.prescriptions?.length || data.labRequests?.length || data.radiologyRequests?.length);
    if (!visit.doctorId && requiresDoctor) {
      throw new AppError('Visit has no assigned doctor for prescriptions or requests', 'BAD_REQUEST', 400);
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

      // Prescriptions: create a real Prescription + MedicationItem rows
      // linked to actual Medicine catalog entries so Pharmacy's dispensing
      // queue (which joins through `items.medicine`) can see and dispense
      // them, with real stock tracking. Every referenced medicine must
      // exist — an invalid medicineId fails the whole transaction rather
      // than silently creating an orphaned/unusable prescription line.
      let prescriptionId: string | undefined;
      if (data.prescriptions && data.prescriptions.length > 0) {
        const medicineIds = [...new Set(data.prescriptions.map((p) => p.medicineId))];
        const medicines = await tx.medicine.findMany({ where: { id: { in: medicineIds } } });
        const foundIds = new Set(medicines.map((m) => m.id));
        const missing = medicineIds.filter((id) => !foundIds.has(id));
        if (missing.length > 0) {
          throw new AppError(`One or more prescribed medicines were not found: ${missing.join(', ')}`, 'BAD_REQUEST', 400);
        }

        const prescriptionCount = await tx.prescription.count();
        const prescId = generatePrescriptionId(prescriptionCount + 1);
        const prescription = await tx.prescription.create({
          data: {
            prescriptionId: prescId,
            visitId: data.visitId,
            doctorId: visit.doctorId!,
            status: 'PENDING',
            items: {
              create: data.prescriptions.map((p) => ({
                medicineId: p.medicineId,
                dosage: p.dosage,
                frequency: p.frequency,
                duration: p.duration,
                quantity: p.quantity,
                instructions: p.instructions ?? null,
              })),
            },
          }
        });
        prescriptionId = prescription.prescriptionId;
      }

      // Laboratory requests
      const labRequestIds: string[] = [];
      if (data.labRequests && data.labRequests.length > 0) {
        for (const lr of data.labRequests) {
          const category = await tx.labCategory.findUnique({ where: { id: lr.categoryId } });
          if (!category) throw new AppError('Selected lab category was not found', 'BAD_REQUEST', 400);
          const created = await tx.labRequest.create({
            data: {
              requestId: generateLabRequestId(),
              visitId: data.visitId,
              doctorId: visit.doctorId!,
              categoryId: lr.categoryId,
              testName: lr.testName,
              priority: lr.priority,
              notes: lr.notes ?? null,
            }
          });
          labRequestIds.push(created.requestId);
        }
      }

      // Radiology requests
      const radiologyRequestIds: string[] = [];
      if (data.radiologyRequests && data.radiologyRequests.length > 0) {
        for (const rr of data.radiologyRequests) {
          const created = await tx.radiologyRequest.create({
            data: {
              requestId: generateRadiologyRequestId(),
              visitId: data.visitId,
              doctorId: visit.doctorId!,
              scanType: rr.scanType,
              region: rr.region,
              priority: rr.priority,
              clinicalNotes: rr.clinicalNotes ?? null,
            }
          });
          radiologyRequestIds.push(created.requestId);
        }
      }

      await tx.visit.update({
        where: { id: data.visitId },
        data: { 
          status: 'COMPLETED',
          endedAt: new Date(),
          ...(visit.appointmentId ? { appointment: { update: { status: 'COMPLETED' } } } : {})
        }
      });

      return { consultation, prescriptionId, labRequestIds, radiologyRequestIds };
    });

    await AuditService.log({
      userId: executorId, userRole: 'DOCTOR', action: 'CREATE_CONSULTATION',
      resource: 'CONSULTATION', resourceId: result.consultation.id,
      branchId: visit.patient.branchId,
      details: { visitId: data.visitId, patientId: visit.patientId,
        rxCount: data.prescriptions?.length ?? 0,
        dxCount: data.diagnosis?.length ?? 0,
        labRequestCount: result.labRequestIds.length,
        radiologyRequestCount: result.radiologyRequestIds.length }
    }).catch(() => {});

    if (result.labRequestIds.length > 0) {
      await AuditService.log({
        userId: executorId, userRole: 'DOCTOR', action: 'CREATE_LAB_REQUEST',
        resource: 'LAB_REQUEST', resourceId: result.labRequestIds.join(','),
        branchId: visit.patient.branchId,
        details: { visitId: data.visitId, patientId: visit.patientId }
      }).catch(() => {});
    }
    if (result.radiologyRequestIds.length > 0) {
      await AuditService.log({
        userId: executorId, userRole: 'DOCTOR', action: 'CREATE_RADIOLOGY_REQUEST',
        resource: 'RADIOLOGY_REQUEST', resourceId: result.radiologyRequestIds.join(','),
        branchId: visit.patient.branchId,
        details: { visitId: data.visitId, patientId: visit.patientId }
      }).catch(() => {});
    }

    return result;
  }
}
