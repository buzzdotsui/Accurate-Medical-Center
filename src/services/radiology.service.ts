import { prisma } from '@/lib/db/client';
import { SaveRadiologyReportInput } from '@/lib/validations/radiology';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class RadiologyService {
  /**
   * Get all active radiology requests
   */
  static async getActiveRequests() {
    return await prisma.radiologyRequest.findMany({
      where: {
        status: { in: ['REQUESTED', 'SCANNED'] }
      },
      include: {
        visit: {
          include: { patient: true }
        },
        doctor: {
          include: { user: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Save a radiology report and mark request as REPORTED
   */
  static async saveReport(requestId: string, data: SaveRadiologyReportInput, executorId: string) {
    const request = await prisma.radiologyRequest.findUnique({
      where: { id: requestId },
      include: { visit: true }
    });

    if (!request) throw new AppError('NOT_FOUND', 'Radiology Request not found', 404);
    if (request.status === 'REPORTED') throw new AppError('VALIDATION_ERROR', 'Request is already reported', 400);

    return await prisma.$transaction(async (tx) => {
      // Create Report
      const report = await tx.radiologyReport.create({
        data: {
          requestId: request.id,
          findings: data.findings,
          conclusion: data.conclusion,
          radiologistId: executorId,
          images: {
            create: data.images?.map(img => ({
              imageUrl: img.imageUrl,
              dicomUrl: img.dicomUrl,
              notes: img.notes
            })) || []
          }
        },
        include: { images: true }
      });

      // Update Request Status
      await tx.radiologyRequest.update({
        where: { id: request.id },
        data: { status: 'REPORTED' }
      });

      // Log Audit
      await AuditService.log({
        userId: executorId,
        userRole: 'RADIOLOGIST',
        action: 'SAVE_RADIOLOGY_REPORT',
        resource: 'RADIOLOGY_REPORT',
        resourceId: report.id,
        details: { requestId: request.id, scanType: request.scanType }
      });

      return report;
    });
  }
}
