import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';
import {
  CreatePsychAssessmentInput,
  CreateTherapySessionInput,
} from '@/lib/validations/psych';
import { AuditService } from './audit.service';

export class PsychService {
  /**
   * Resolve the caller's Staff record (assessor/therapist identity is
   * always the session user — never a client-supplied staffId).
   */
  private static async resolveStaffId(userId: string): Promise<string> {
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true, isActive: true },
    });
    if (!staff || !staff.isActive) {
      throw new AppError('Staff profile not found or inactive.', 'NOT_FOUND', 404);
    }
    return staff.id;
  }

  static async listAssessments(branchId?: string, take = 50) {
    return await prisma.psychologicalAssessment.findMany({
      where: branchId
        ? { patient: { branchId } }
        : undefined,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, patientId: true },
        },
        assessor: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
      orderBy: { date: 'desc' },
      take,
    });
  }

  static async listSessions(branchId?: string, take = 50) {
    return await prisma.therapySession.findMany({
      where: branchId
        ? { patient: { branchId } }
        : undefined,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, patientId: true },
        },
        therapist: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
      orderBy: { date: 'desc' },
      take,
    });
  }

  static async createAssessment(
    data: CreatePsychAssessmentInput,
    executorUserId: string,
    executorRole: string,
    branchId?: string,
  ) {
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { id: true, branchId: true, deletedAt: true },
    });
    if (!patient || patient.deletedAt) {
      throw new AppError('Patient not found.', 'NOT_FOUND', 404);
    }
    if (branchId && patient.branchId !== branchId) {
      throw new AppError('Patient does not belong to your branch.', 'FORBIDDEN', 403);
    }

    const assessorId = await this.resolveStaffId(executorUserId);

    const assessment = await prisma.psychologicalAssessment.create({
      data: {
        patientId: data.patientId,
        evaluation: data.evaluation,
        score: data.score ?? undefined,
        assessorId,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, patientId: true },
        },
        assessor: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    });

    await AuditService.log({
      userId: executorUserId,
      userRole: executorRole,
      action: 'CREATE_PSYCH_ASSESSMENT',
      resource: 'PsychAssessment',
      resourceId: assessment.id,
      details: { patientId: data.patientId },
      branchId: patient.branchId,
    });

    return assessment;
  }

  static async createSession(
    data: CreateTherapySessionInput,
    executorUserId: string,
    executorRole: string,
    branchId?: string,
  ) {
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { id: true, branchId: true, deletedAt: true },
    });
    if (!patient || patient.deletedAt) {
      throw new AppError('Patient not found.', 'NOT_FOUND', 404);
    }
    if (branchId && patient.branchId !== branchId) {
      throw new AppError('Patient does not belong to your branch.', 'FORBIDDEN', 403);
    }

    const therapistId = await this.resolveStaffId(executorUserId);

    const session = await prisma.therapySession.create({
      data: {
        patientId: data.patientId,
        date: new Date(data.date),
        duration: data.duration,
        sessionType: data.sessionType,
        progressNotes: data.progressNotes,
        nextSteps: data.nextSteps || null,
        therapistId,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, patientId: true },
        },
        therapist: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    });

    await AuditService.log({
      userId: executorUserId,
      userRole: executorRole,
      action: 'CREATE_THERAPY_SESSION',
      resource: 'TherapySession',
      resourceId: session.id,
      details: { patientId: data.patientId, sessionType: data.sessionType },
      branchId: patient.branchId,
    });

    return session;
  }

  static async getStats(branchId?: string) {
    const patientFilter = branchId ? { branchId } : undefined;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalAssessments, totalSessions, sessionsToday, activePatients] =
      await Promise.all([
        prisma.psychologicalAssessment.count({
          where: patientFilter ? { patient: patientFilter } : undefined,
        }),
        prisma.therapySession.count({
          where: patientFilter ? { patient: patientFilter } : undefined,
        }),
        prisma.therapySession.count({
          where: {
            date: { gte: startOfDay },
            ...(patientFilter ? { patient: patientFilter } : {}),
          },
        }),
        prisma.patient.count({
          where: {
            ...(patientFilter ?? {}),
            deletedAt: null,
            OR: [
              { psychAssessments: { some: {} } },
              { therapySessions: { some: {} } },
            ],
          },
        }),
      ]);

    return {
      totalAssessments,
      totalSessions,
      sessionsToday,
      activePatients,
    };
  }
}
