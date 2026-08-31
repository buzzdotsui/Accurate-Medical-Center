import { prisma } from '@/lib/db/client';
import { SaveLabResultInput } from '@/lib/validations/laboratory';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { logger } from '@/lib/utils/logger';

export class LaboratoryService {
  /**
   * Get all active lab requests (not completed)
   * Optionally filtered by branchId
   */
  static async getActiveRequests(branchId?: string) {
    return await prisma.labRequest.findMany({
      where: {
        status: { in: ['REQUESTED', 'SAMPLED', 'ANALYZING'] },
        // LabRequest has no direct branchId column — branch isolation is
        // enforced through the visit's patient (visit.patient.branchId).
        // A raw `branchId` filter here is not a valid LabRequestWhereInput
        // field and causes Prisma to throw an "Unknown argument" runtime
        // error for every branch-scoped caller.
        ...(branchId ? { visit: { patient: { branchId } } } : {}),
      },
      include: {
        visit: {
          include: { patient: true }
        },
        doctor: {
          include: { user: true }
        },
        category: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Save result and mark request as COMPLETED
   */
  static async saveResult(requestId: string, data: SaveLabResultInput, executorId: string) {
    const request = await prisma.labRequest.findUnique({
      where: { id: requestId },
      include: {
        visit: { include: { patient: { select: { userId: true } } } },
        doctor: { select: { userId: true } },
      }
    });

    if (!request) throw new AppError('Lab Request not found', 'NOT_FOUND', 404);
    if (request.status === 'COMPLETED') throw new AppError('Lab Request is already completed', 'VALIDATION_ERROR', 400);

    const created = await prisma.$transaction(async (tx) => {
      // Create the result
      const result = await tx.labResult.create({
        data: {
          requestId: request.id,
          findings: data.findings,
          conclusion: data.conclusion,
          referenceRange: data.referenceRange,
          isAbnormal: data.isAbnormal,
          performedBy: executorId,
          attachments: {
            create: data.attachments?.map(att => ({
              fileUrl: att.fileUrl,
              fileName: att.fileName,
              fileType: att.fileType
            })) || []
          }
        },
        include: { attachments: true }
      });

      // Mark request as COMPLETED
      await tx.labRequest.update({
        where: { id: request.id },
        data: { status: 'COMPLETED' }
      });

      // Audit Log
      await AuditService.log({
        userId: executorId,
        userRole: 'LAB_SCIENTIST',
        action: 'SAVE_LAB_RESULT',
        resource: 'LAB_RESULT',
        resourceId: result.id,
        details: { requestId: request.id, isAbnormal: data.isAbnormal }
      });

      return result;
    });

    // Notify the requesting doctor and the patient that the result is
    // ready. Best-effort; never fails the lab result save.
    if (request.doctor?.userId) {
      NotificationService.createNotification({
        userId: request.doctor.userId,
        type: 'LAB',
        title: 'Lab result ready',
        body: `Result for ${request.testName} (${request.requestId}) is now available.`,
        link: `/laboratory/requests/${request.id}`,
        resource: 'LAB_REQUEST',
        resourceId: request.id,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });
    }

    if (request.visit.patient.userId) {
      NotificationService.createNotification({
        userId: request.visit.patient.userId,
        type: 'LAB',
        title: 'Lab result available',
        body: `Your result for ${request.testName} is now available.`,
        link: '/patient',
        resource: 'LAB_REQUEST',
        resourceId: request.id,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });
    }

    return created;
  }
}
