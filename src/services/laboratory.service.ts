import { prisma } from '@/lib/db/client';
import { SaveLabResultInput } from '@/lib/validations/laboratory';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class LaboratoryService {
  /**
   * Get all active lab requests (not completed)
   * Optionally filtered by branchId
   */
  static async getActiveRequests(branchId?: string) {
    return await prisma.labRequest.findMany({
      where: {
        status: { in: ['REQUESTED', 'SAMPLED', 'ANALYZING'] },
        ...(branchId ? { branchId } : {}),
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
      include: { visit: true }
    });

    if (!request) throw new AppError('Lab Request not found', 'NOT_FOUND', 404);
    if (request.status === 'COMPLETED') throw new AppError('Lab Request is already completed', 'VALIDATION_ERROR', 400);

    return await prisma.$transaction(async (tx) => {
      // Create the result
      const result = await tx.labResult.create({
        data: {
          requestId: request.id,
          findings: data.findings,
          conclusion: data.conclusion,
          referenceRange: data.referenceRange,
          isAbnormal: data.isAbnormal,
          performedBy: executorId
        }
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
  }
}
