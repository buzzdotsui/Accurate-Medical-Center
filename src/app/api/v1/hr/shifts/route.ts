import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { withRole, parseBody } from '@/lib/api/middleware';
import { AssignShiftSchema } from '@/lib/validations/hr';
import { HrService } from '@/services/hr.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { verifyStaffAccess, buildBranchFilter } from '@/lib/auth/resource-authorization';

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  department: string | null;
  date: string;
  shift: string;
  notes: string | null;
  assignedAt: string;
}

/**
 * GET /api/v1/hr/shifts?date=YYYY-MM-DD
 * Returns shift assignments recorded for a given date (defaults to today).
 *
 * Persistence model: there is no dedicated Schedule table. Assignments are
 * written as ASSIGN_SHIFT audit-log events by HrService.assignShift, and this
 * route reads them back for the roster UI. SUPER_ADMIN sees hospital-wide;
 * ADMIN is limited to staff in their branch.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req: NextRequest, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const date =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date().toISOString().slice(0, 10);

    const logs = await prisma.auditLog.findMany({
      where: {
        action: 'ASSIGN_SHIFT',
        resource: 'SCHEDULE',
        createdAt: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
        ...(branchFilter.branchId ? { branchId: branchFilter.branchId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Latest assignment wins per (staffId, shift) slot for the day.
    const latest = new Map<string, ShiftAssignment>();
    for (const log of logs) {
      const details = (log.details ?? {}) as {
        staffId?: string;
        date?: string;
        shift?: string;
        notes?: string;
        staffName?: string;
        department?: string;
      };
      if (!details.staffId || !details.shift) continue;
      const key = `${details.staffId}:${details.shift}`;
      if (!latest.has(key)) {
        latest.set(key, {
          id: log.id,
          staffId: details.staffId,
          staffName: details.staffName ?? details.staffId,
          department: details.department ?? null,
          date: details.date ?? date,
          shift: details.shift,
          notes: details.notes ?? null,
          assignedAt: log.createdAt.toISOString(),
        });
      }
    }

    // Enrich with live staff directory (name/department) for staff in scope.
    const staffIds = [...new Set([...latest.values()].map((s) => s.staffId))];
    const staffRows = staffIds.length
      ? await prisma.staff.findMany({
          where: {
            id: { in: staffIds },
            ...(branchFilter.branchId ? { branchId: branchFilter.branchId } : {}),
          },
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        })
      : [];
    const staffById = new Map(staffRows.map((s) => [s.id, s]));

    const enriched = [...latest.values()]
      .map((s) => {
        const staff = staffById.get(s.staffId);
        if (!staff) return null; // drop cross-branch or deleted staff
        return {
          ...s,
          staffName: staff.user.name,
          department: staff.department?.name ?? null,
        };
      })
      .filter(Boolean) as ShiftAssignment[];

    return ok({ date, assignments: enriched });
  },
);

/**
 * POST /api/v1/hr/shifts
 * Shift assignment is an administrative (staff management) action.
 * staffId is a client-supplied Staff ID — verified for branch ownership
 * before HrService.assignShift runs (branch-A ADMIN cannot target
 * branch-B staff).
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (req, session) => {
  const body = await parseBody(req, AssignShiftSchema);
  await verifyStaffAccess(session.user, body.staffId, 'UPDATE');
  const result = await HrService.assignShift(
    body,
    session.user.id,
    session.user.branchId ?? undefined,
  );
  return ok(result, { message: 'Shift assigned successfully' });
});
