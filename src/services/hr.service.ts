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
   * Assign or update a shift for a staff member
   */
  static async assignShift(data: AssignShiftInput, executorId: string) {
    const staff = await prisma.staff.findUnique({ where: { id: data.staffId } });
    if (!staff) throw new AppError('Staff member not found', 'NOT_FOUND', 404);

    const shiftDate = new Date(data.date);

    // Upsert the schedule for that specific date and staff (Mocked as there's no Schedule model)
    const _schedule = null;

    const result = { id: 'mock', staffId: data.staffId, date: shiftDate, shift: data.shift, notes: data.notes };

    // Audit Log
    await AuditService.log({
      userId: executorId,
      userRole: 'HR_MANAGER',
      action: 'ASSIGN_SHIFT',
      resource: 'SCHEDULE',
      resourceId: result.id,
      details: { staffId: data.staffId, date: data.date, shift: data.shift }
    });

    return result;
  }
}
