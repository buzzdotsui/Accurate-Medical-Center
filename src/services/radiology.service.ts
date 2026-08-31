import { prisma } from '@/lib/db/client';
import { SaveRadiologyReportInput } from '@/lib/validations/radiology';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class RadiologyService {
  /**
   * Get all active radiology requests
   */
  static async getActiveRequests(branchId?: string) {
    return await prisma.radiologyRequest.findMany({
      where: {
        status: { in: ['REQUESTED', 'SCANNED'] },
        // Branch isolation is enforced through the visit's patient, since
        // RadiologyRequest has no direct branchId column.
        ...(branchId ? { visit: { patient: { branchId } } } : {}),
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
      include: {
        visit: { include: { patient: { select: { userId: true } } } },
        doctor: { select: { userId: true } },
      }
    });

    if (!request) throw new AppError('Radiology Request not found', 'NOT_FOUND', 404);
    if (request.status === 'REPORTED') throw new AppError('Request is already reported', 'VALIDATION_ERROR', 400);

    const created = await prisma.$transaction(async (tx) => {
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

    // Notify the requesting doctor and the patient that the report is
    // ready. Best-effort; never fails the radiology report save.
    if (request.doctor?.userId) {
      NotificationService.createNotification({
        userId: request.doctor.userId,
        type: 'RADIOLOGY',
        title: 'Radiology report ready',
        body: `Report for ${request.scanType} - ${request.region} (${request.requestId}) is now available.`,
        link: `/radiology/requests/${request.id}`,
        resource: 'RADIOLOGY_REQUEST',
        resourceId: request.id,
      }).catch(() => {});
    }

    if (request.visit.patient.userId) {
      NotificationService.createNotification({
        userId: request.visit.patient.userId,
        type: 'RADIOLOGY',
        title: 'Radiology report available',
        body: `Your ${request.scanType} report is now available.`,
        link: '/patient',
        resource: 'RADIOLOGY_REQUEST',
        resourceId: request.id,
      }).catch(() => {});
    }

    return created;
  }
}
