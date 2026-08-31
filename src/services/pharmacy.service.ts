import { prisma } from '@/lib/db/client';
import { DispensePrescriptionInput } from '@/lib/validations/pharmacy';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { logger } from '@/lib/utils/logger';

export class PharmacyService {
  /**
   * Get all pending prescriptions
   * Optionally filtered by branchId
   */
  static async getPendingPrescriptions(branchId?: string) {
    return await prisma.prescription.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        // Prescription has no direct branchId column — branch isolation is
        // enforced through the visit's patient (visit.patient.branchId).
        // Passing a raw `branchId` filter here (as in an earlier version)
        // is not a valid PrescriptionWhereInput field and causes Prisma to
        // throw an "Unknown argument" runtime error for every branch-scoped
        // caller (i.e. every non-SUPER_ADMIN pharmacist/doctor).
        ...(branchId ? { visit: { patient: { branchId } } } : {}),
      },
      include: {
        visit: {
          include: { patient: true }
        },
        doctor: {
          include: { user: true }
        },
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Dispense a prescription.
   *
   * When marking a prescription DISPENSED, this reduces real Medicine stock
   * for every item (quantity minus whatever was already dispensed), records
   * an InventoryTransaction per item, and fails the whole operation with a
   * 409 if any item does not have enough stock — dispensing must never
   * silently succeed without actually reducing inventory. PARTIAL simply
   * updates the prescription status; there is currently no per-item partial
   * quantity input from the UI, so partial dispensing does not adjust stock
   * (documented limitation — see Stage 13 report).
   */
  static async dispensePrescription(id: string, data: DispensePrescriptionInput, executorId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { visit: { include: { patient: true } }, items: { include: { medicine: true } } }
    });

    if (!prescription) throw new AppError('Prescription not found', 'NOT_FOUND', 404);
    if (prescription.status === 'DISPENSED') throw new AppError('Prescription already dispensed', 'VALIDATION_ERROR', 400);

    if (data.status === 'DISPENSED' && prescription.items.length > 0) {
      // Verify sufficient stock for every item before making any writes.
      for (const item of prescription.items) {
        const remaining = item.quantity - item.dispensedQty;
        if (remaining > 0 && item.medicine.stockQuantity < remaining) {
          throw new AppError(
            `Insufficient stock for ${item.medicine.name}: need ${remaining}, have ${item.medicine.stockQuantity}`,
            'CONFLICT',
            409
          );
        }
      }

      const updated = await prisma.$transaction(async (tx) => {
        for (const item of prescription.items) {
          const remaining = item.quantity - item.dispensedQty;
          if (remaining <= 0) continue;

          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stockQuantity: { decrement: remaining } },
          });

          await tx.medicationItem.update({
            where: { id: item.id },
            data: { dispensedQty: item.quantity },
          });

          await tx.inventoryTransaction.create({
            data: {
              medicineId: item.medicineId,
              type: 'OUT',
              quantity: remaining,
              reference: prescription.prescriptionId,
              notes: `Dispensed for prescription ${prescription.prescriptionId}`,
            },
          });
        }

        return tx.prescription.update({
          where: { id },
          data: { status: data.status, notes: data.notes },
        });
      });

      await AuditService.log({
        userId: executorId,
        userRole: 'PHARMACIST',
        action: 'DISPENSE_PRESCRIPTION',
        resource: 'PRESCRIPTION',
        resourceId: updated.id,
        branchId: prescription.visit.patient.branchId,
        details: { status: data.status, itemCount: prescription.items.length }
      }).catch(() => {});

      this.notifyPatientOfDispense(data.status, prescription.visit.patient.userId, updated.id).catch((err: unknown) => {
        logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
      });

      return updated;
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes
      }
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'PHARMACIST',
      action: 'DISPENSE_PRESCRIPTION',
      resource: 'PRESCRIPTION',
      resourceId: updated.id,
      branchId: prescription.visit.patient.branchId,
      details: { status: data.status }
    }).catch(() => {});

    this.notifyPatientOfDispense(data.status, prescription.visit.patient.userId, updated.id).catch((err: unknown) => {
      logger.error('Notification dispatch failed', { error: err instanceof Error ? err.message : String(err) });
    });

    return updated;
  }

  /**
   * Get dashboard stats: prescriptions dispensed today and currently pending.
   * Uses the same branch-isolation pattern as getPendingPrescriptions.
   */
  static async getDashboardStats(branchId?: string) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [dispensedToday, pendingCount] = await Promise.all([
      prisma.prescription.count({
        where: {
          status: 'DISPENSED',
          updatedAt: { gte: startOfDay, lte: endOfDay },
          ...(branchId ? { visit: { patient: { branchId } } } : {}),
        },
      }),
      prisma.prescription.count({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          ...(branchId ? { visit: { patient: { branchId } } } : {}),
        },
      }),
    ]);

    return { dispensedToday, pendingCount };
  }

  /**
   * Notify the patient when their prescription is fully dispensed
   * (ready/collected). Best-effort and a no-op for patients with no
   * linked portal account.
   */
  private static async notifyPatientOfDispense(status: string, patientUserId: string | null, prescriptionId: string) {
    if (status !== 'DISPENSED' || !patientUserId) return;
    await NotificationService.createNotification({
      userId: patientUserId,
      type: 'PRESCRIPTION',
      title: 'Prescription dispensed',
      body: 'Your prescription has been dispensed and is ready for collection.',
      link: '/patient',
      resource: 'PRESCRIPTION',
      resourceId: prescriptionId,
    });
  }
}
