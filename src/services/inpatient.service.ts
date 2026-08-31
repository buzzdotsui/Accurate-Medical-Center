import { prisma } from '@/lib/db/client';
import { AdmitPatientInput, DischargePatientInput } from '@/lib/validations/inpatient';
import { AppError } from '@/lib/api/errors';
import { generateAdmissionId } from '@/lib/utils/generate-id';
import { NotificationService } from './notification.service';
import { ROLES } from '@/config/roles';
import { logger } from '@/lib/utils/logger';

export class InpatientService {
  /**
   * Get all wards and their bed statuses.
   * When `branchId` is provided (i.e. caller is not SUPER_ADMIN), results
   * are scoped to wards belonging to that branch only.
   */
  static async getWardsOverview(branchId?: string) {
    return await prisma.ward.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                admission: {
                  include: { patient: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get all active admissions.
   * When `branchId` is provided, results are scoped to admissions for
   * patients registered in that branch (Admission has no direct branchId
   * column, so isolation is enforced through the patient relation).
   */
  static async getActiveAdmissions(branchId?: string) {
    return await prisma.admission.findMany({
      where: {
        status: 'ADMITTED',
        ...(branchId ? { patient: { branchId } } : {}),
      },
      include: {
        patient: true,
        bed: { include: { room: { include: { ward: true } } } },
        doctor: { include: { user: true } }
      },
      orderBy: { admittedAt: 'desc' }
    });
  }

  /**
   * Admit a patient and allocate a bed.
   *
   * `branchId`, when provided (non-SUPER_ADMIN caller), must match both the
   * patient's branch and the bed's ward's branch — this prevents a staff
   * member from one branch admitting a patient into, or using a bed
   * belonging to, a different branch.
   */
  static async admitPatient(data: AdmitPatientInput, executorId: string, branchId?: string) {
    const bed = await prisma.bed.findUnique({
      where: { id: data.bedId },
      include: { room: { include: { ward: true } } },
    });
    if (!bed) throw new AppError('Bed not found', 'NOT_FOUND', 404);
    if (bed.status !== 'AVAILABLE') throw new AppError('Bed is not available', 'VALIDATION_ERROR', 400);
    if (branchId && bed.room.ward.branchId !== branchId) {
      throw new AppError('Bed does not belong to your branch', 'FORBIDDEN', 403);
    }

    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient || patient.deletedAt) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    if (branchId && patient.branchId !== branchId) {
      throw new AppError('Patient does not belong to your branch', 'FORBIDDEN', 403);
    }

    // The admitting doctor must be a real, active Staff record with the
    // DOCTOR role — never a client-supplied placeholder. This was previously
    // hardcoded to the literal string 'mock-doctor', which would violate the
    // Admission.doctorId foreign key constraint on every admission attempt.
    const doctor = await prisma.staff.findUnique({
      where: { id: data.doctorId },
      include: { user: { select: { role: true } } },
    });
    if (!doctor || !doctor.isActive) throw new AppError('Admitting doctor not found or inactive', 'NOT_FOUND', 404);
    if (doctor.user.role !== 'DOCTOR' && doctor.user.role !== 'SUPER_ADMIN') {
      throw new AppError('Admitting staff member must be a doctor', 'VALIDATION_ERROR', 400);
    }
    if (branchId && doctor.branchId !== branchId) {
      throw new AppError('Admitting doctor does not belong to your branch', 'FORBIDDEN', 403);
    }

    return await prisma.$transaction(async (tx) => {
      // Create admission
      const admission = await tx.admission.create({
        data: {
          admissionId: generateAdmissionId(),
          patientId: data.patientId,
          doctorId: data.doctorId,
          bedId: data.bedId,
          reason: data.reason,
          status: 'ADMITTED'
        }
      });

      // Update bed status
      await tx.bed.update({
        where: { id: data.bedId },
        data: { status: 'OCCUPIED' }
      });

      // Audit Log — written via `tx` so it rolls back with the transaction.
      await tx.auditLog.create({
        data: {
          userId: executorId,
          userRole: 'STAFF',
          action: 'ADMIT_PATIENT',
          resource: 'ADMISSION',
          resourceId: admission.id,
          details: { patientId: data.patientId, bedId: data.bedId, doctorId: data.doctorId },
          branchId: patient.branchId,
        },
      });

      return admission;
    }).then((admission) => {
      // Notification side-effects for the admission just created.
      // Best-effort: never blocks the admission itself.
      if (patient.userId) {
        NotificationService.createNotification({
          userId: patient.userId,
          type: 'INPATIENT',
          title: 'You have been admitted',
          body: `You have been admitted for: ${data.reason}.`,
          link: '/patient',
          resource: 'ADMISSION',
          resourceId: admission.id,
        }).catch((err: unknown) => {
          logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
        });
      }

      NotificationService.notifyRoleInBranch({
        roles: [ROLES.NURSE],
        branchId: patient.branchId,
        type: 'INPATIENT',
        title: 'New patient admission',
        body: `A new patient has been admitted: ${data.reason}.`,
        link: '/nurse/ward',
        resource: 'ADMISSION',
        resourceId: admission.id,
        excludeUserId: executorId,
      }).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });

      return admission;
    });
  }

  /**
   * Discharge a patient: closes the admission and frees the bed.
   * `branchId`, when provided, must match the admission's patient branch.
   */
  static async dischargePatient(admissionId: string, data: DischargePatientInput, executorId: string, branchId?: string) {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { patient: true, bed: true },
    });
    if (!admission) throw new AppError('Admission not found', 'NOT_FOUND', 404);
    if (admission.status !== 'ADMITTED') {
      throw new AppError('Admission is not currently active', 'VALIDATION_ERROR', 400);
    }
    if (branchId && admission.patient.branchId !== branchId) {
      throw new AppError('Admission does not belong to your branch', 'FORBIDDEN', 403);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: 'DISCHARGED',
          dischargedAt: new Date(),
          dischargeSummary: data.dischargeNotes ?? null,
        },
      });

      if (admission.bedId) {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: executorId,
          userRole: 'STAFF',
          action: 'DISCHARGE_PATIENT',
          resource: 'ADMISSION',
          resourceId: admission.id,
          details: { patientId: admission.patientId, bedId: admission.bedId },
          branchId: admission.patient.branchId,
        },
      });

      return updated;
    }).then((updated) => {
      // Best-effort: never blocks the discharge itself.
      if (admission.patient.userId) {
        NotificationService.createNotification({
          userId: admission.patient.userId,
          type: 'INPATIENT',
          title: 'You have been discharged',
          body: 'You have been discharged. Please review your discharge summary.',
          link: '/patient',
          resource: 'ADMISSION',
          resourceId: admission.id,
        }).catch((err: unknown) => {
          logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
        });
      }

      return updated;
    });
  }
}
