import { prisma } from '@/lib/db/client';
import { z } from 'zod';
import { StartVisitSchema, RecordVitalsSchema, AddDiagnosisSchema } from '@/lib/validations/clinical';
import { generateVisitId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class ClinicalService {
  /**
   * Start a new patient visit (e.g. at triage or doctor's office)
   */
  static async startVisit(data: z.infer<typeof StartVisitSchema>, executorId: string) {
    const visitId = generateVisitId();
    
    const visit = await prisma.visit.create({
      data: {
        visitId,
        patientId: data.patientId,
        appointmentId: data.appointmentId || null,
        doctorId: data.doctorId || null,
        chiefComplaint: data.chiefComplaint || null,
        status: 'IN_PROGRESS',
      },
    });

    if (data.appointmentId) {
      // Automatically update appointment to ARRIVED if it was scheduled
      await prisma.appointment.update({
        where: { id: data.appointmentId },
        data: { status: 'ARRIVED' }
      });
    }

    await AuditService.log({
      userId: executorId,
      userRole: 'CLINICAL',
      action: 'START_VISIT',
      resource: 'VISIT',
      resourceId: visit.id,
      details: { patientId: data.patientId }
    });

    return visit;
  }

  /**
   * Record vitals for a visit
   */
  static async recordVitals(visitId: string, vitals: z.infer<typeof RecordVitalsSchema>, executorId: string) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: { vitals: vitals as any },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'CLINICAL',
      action: 'RECORD_VITALS',
      resource: 'VISIT',
      resourceId: visit.id,
    });

    return updated;
  }

  /**
   * Add a diagnosis to a visit
   */
  static async addDiagnosis(visitId: string, data: z.infer<typeof AddDiagnosisSchema>, executorId: string) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);

    const diagnosis = await prisma.diagnosis.create({
      data: {
        visitId,
        code: data.code || null,
        description: data.description,
        type: data.type,
        notes: data.notes || null,
      },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'CLINICAL',
      action: 'ADD_DIAGNOSIS',
      resource: 'DIAGNOSIS',
      resourceId: diagnosis.id,
      details: { visitId }
    });

    return diagnosis;
  }
  
  /**
   * Get complete visit details
   */
  static async getVisitDetails(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, patientId: true,
            phone: true, email: true, gender: true, dateOfBirth: true,
            bloodGroup: true, genotype: true, allergies: true, chronicConditions: true,
          }
        },
        doctor: { select: { id: true, user: { select: { name: true } } } },
        diagnoses: true,
        notes: true,
        prescriptions: true,
        labRequests: true,
        radRequests: true,
      }
    });
    
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    
    return visit;
  }

  /**
   * List visits with optional filters for queue views (triage, doctor, etc.)
   */
  static async listVisits(params: {
    skip?: number;
    take?: number;
    status?: string;
    doctorId?: string;
    branchId?: string;
    hasVitals?: boolean;
    patientId?: string;
  }) {
    const { skip = 0, take = 50, status, doctorId, branchId, hasVitals, patientId } = params;

    const where: any = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (branchId) where.patient = { branchId };

    const visits = await prisma.visit.findMany({
      where,
      orderBy: { startedAt: 'asc' },
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, patientId: true,
            gender: true, dateOfBirth: true,
          }
        },
        doctor: { include: { user: { select: { name: true } } } },
        appointment: { select: { timeSlot: true, reason: true } },
        diagnoses: { take: 1 },
      }
    });

    const filtered = hasVitals === undefined
      ? visits
      : visits.filter((visit) => hasVitals ? Boolean(visit.vitals) : !visit.vitals);

    return {
      total: filtered.length,
      visits: filtered.slice(skip, skip + take),
    };
  }
}
