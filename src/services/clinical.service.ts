import { prisma } from '@/lib/db/client';
import { z } from 'zod';
import { StartVisitSchema, RecordVitalsSchema, AddDiagnosisSchema } from '@/lib/validations/clinical';
import { generateVisitId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { ROLES } from '@/config/roles';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';

export class ClinicalService {
  /**
   * Start a new patient visit (e.g. at triage or doctor's office)
   */
  static async startVisit(data: z.infer<typeof StartVisitSchema>, executorId: string, executorRole?: string) {
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
      userRole: executorRole ?? 'NURSE',
      action: 'START_VISIT',
      resource: 'VISIT',
      resourceId: visit.id,
      details: { patientId: data.patientId }
    });

    // A new visit means a patient just entered the clinical queue — notify
    // the branch's nurses (triage/vitals) and the assigned doctor, if any.
    // Best-effort: never blocks the check-in itself.
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { branchId: true },
    });
    if (patient) {
      NotificationService.notifyRoleInBranch({
        roles: [ROLES.NURSE],
        branchId: patient.branchId,
        type: 'APPOINTMENT',
        title: 'New patient in queue',
        body: 'A patient is waiting for triage/vitals.',
        link: '/nurse/queue',
        resource: 'VISIT',
        resourceId: visit.id,
        excludeUserId: executorId,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });
    }

    if (data.doctorId) {
      prisma.staff.findUnique({ where: { id: data.doctorId }, select: { userId: true } }).then((doctor) => {
        if (!doctor) return;
        NotificationService.createNotification({
          userId: doctor.userId,
          type: 'APPOINTMENT',
          title: 'Patient checked in',
          body: 'A patient assigned to you has checked in.',
          link: '/doctor/queue',
          resource: 'VISIT',
          resourceId: visit.id,
        }).catch((err: unknown) => {
          logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
        });
      }).catch(() => {});
    }

    return visit;
  }

  /**
   * Record vitals for a visit
   */
  static async recordVitals(visitId: string, vitals: z.infer<typeof RecordVitalsSchema>, executorId: string, executorRole?: string) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);

    const updated = await prisma.visit.update({
      where: { id: visitId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { vitals: vitals as any },
    });

    await AuditService.log({
      userId: executorId,
      userRole: executorRole ?? 'NURSE',
      action: 'RECORD_VITALS',
      resource: 'VISIT',
      resourceId: visit.id,
    });

    return updated;
  }

  /**
   * Add a diagnosis to a visit
   */
  static async addDiagnosis(visitId: string, data: z.infer<typeof AddDiagnosisSchema>, executorId: string, executorRole?: string) {
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
      userRole: executorRole ?? 'DOCTOR',
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
   * Start a consultation for an existing visit (change status to IN_PROGRESS)
   */
  static async startConsultation(visitId: string, data: { chiefComplaint?: string; vitals?: Record<string, unknown> }, executorId: string) {
    const existingVisit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!existingVisit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    
    if (existingVisit.status === 'COMPLETED') {
      throw new AppError('Cannot start a completed visit', 'BAD_REQUEST', 400);
    }

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'IN_PROGRESS',
        chiefComplaint: data.chiefComplaint ?? existingVisit.chiefComplaint,
        vitals: (data.vitals ?? existingVisit.vitals ?? undefined) as Prisma.InputJsonValue,
      },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'DOCTOR',
      action: 'START_VISIT',
      resource: 'VISIT',
      resourceId: existingVisit.id,
      details: { chiefComplaint: data.chiefComplaint }
    });

    return updated;
  }

  /**
   * Complete a consultation (change status to COMPLETED, add diagnoses, notes, treatment plan)
   */
  static async completeConsultation(visitId: string, data: { 
    diagnoses?: Array<{ description: string; code?: string; type?: 'PRIMARY' | 'SECONDARY'; notes?: string }>;
    notes?: string;
    treatmentPlan?: string;
    vitals?: Record<string, unknown>;
  }, executorId: string) {
    const existingVisit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!existingVisit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    
    if (existingVisit.status !== 'IN_PROGRESS') {
      throw new AppError('Can only complete visits in progress', 'BAD_REQUEST', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update visit
      const visit = await tx.visit.update({
        where: { id: visitId },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          notes: data.notes ? { create: { noteText: data.notes } } : undefined,
          vitals: (data.vitals ?? existingVisit.vitals ?? undefined) as Prisma.InputJsonValue,
        },
      });

      // Add diagnoses
      if (data.diagnoses && data.diagnoses.length > 0) {
        for (const d of data.diagnoses) {
          await tx.diagnosis.create({
            data: {
              visitId,
              code: d.code || null,
              description: d.description,
              type: d.type || 'PRIMARY',
              notes: d.notes || null,
            },
          });
        }
      }

      // Add treatment plan
      if (data.treatmentPlan) {
        await tx.treatmentPlan.upsert({
          where: { visitId },
          update: { instructions: data.treatmentPlan!, followUpDate: null },
          create: { visitId, instructions: data.treatmentPlan! },
        });
      }

      return visit;
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'DOCTOR',
      action: 'COMPLETE_VISIT',
      resource: 'VISIT',
      resourceId: existingVisit.id,
    });

    return updated;
  }

  /**
   * List appointments queue for doctor (today's appointments with IN_PROGRESS, ARRIVED, SCHEDULED status)
   */
  static async listQueue(params: {
    branchId?: string;
    doctorId?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const { skip = 0, take = 50 } = params;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (params.branchId) where.branchId = params.branchId;
    if (params.doctorId) where.doctorId = params.doctorId;
    if (params.status) where.status = params.status;
    
    // For queue, show appointments that are SCHEDULED, ARRIVED, or IN_PROGRESS today
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(today); endOfDay.setUTCHours(23,59,59,999);
    where.date = { gte: startOfDay, lte: endOfDay };
    where.status = { in: ['SCHEDULED', 'ARRIVED', 'CHECKED_IN', 'IN_PROGRESS'] };

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where, skip, take,
        include: {
          patient: { 
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              patientId: true, 
              phone: true 
            } 
          },
          staff: { 
            select: { 
              id: true, 
              user: { select: { name: true } } 
            } 
          },
        },
        orderBy: { date: 'asc' },
      })
    ]);

    return { total, appointments };
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
