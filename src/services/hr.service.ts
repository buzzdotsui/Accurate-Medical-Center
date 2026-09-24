import { prisma } from '@/lib/db/client';
import { AssignShiftInput } from '@/lib/validations/hr';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class HrService {
  /**
   * Get all staff members with their departments.
   * When `branchId` is provided (i.e. caller is not SUPER_ADMIN), results
   * are scoped to that branch only.
   */
  static async getStaffDirectory(branchId?: string) {
    return await prisma.staff.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        user: { select: { name: true, email: true, role: true } },
        department: true
      },
      orderBy: { isActive: 'desc' } // ACTIVE first
    });
  }

  /**
   * Assign or update a shift for a staff member.
   *
   * There is no Schedule table in the schema. The assignment is persisted as
   * an ASSIGN_SHIFT audit-log event (resource SCHEDULE) that GET
   * /api/v1/hr/shifts reads back, with staff name/department snapshotted so
   * the roster stays readable if directory data changes later.
   */
  static async assignShift(
    data: AssignShiftInput,
    executorId: string,
    branchId?: string,
  ) {
    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId },
      include: {
        user: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    if (!staff) throw new AppError('Staff member not found', 'NOT_FOUND', 404);

    const shiftDate = new Date(data.date);
    const result = {
      id: `shift:${data.staffId}:${data.date}:${data.shift}`,
      staffId: data.staffId,
      date: shiftDate,
      shift: data.shift,
      notes: data.notes,
    };

    await AuditService.log({
      userId: executorId,
      userRole: 'ADMIN',
      action: 'ASSIGN_SHIFT',
      resource: 'SCHEDULE',
      resourceId: result.id,
      details: {
        staffId: data.staffId,
        staffName: staff.user.name,
        department: staff.department?.name ?? null,
        date: data.date,
        shift: data.shift,
        notes: data.notes ?? null,
      },
      branchId: branchId ?? staff.branchId,
    });

    return result;
  }
}
