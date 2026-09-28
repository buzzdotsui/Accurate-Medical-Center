import { prisma } from '@/lib/db/client';
import { GenerateReportInput } from '@/lib/validations/reporting';
import { ROLES } from '@/config/roles';

export class ReportingService {
  /**
   * Get high-level KPI metrics for the hospital executive dashboard.
   *
   * `branchId` scopes every metric to a single branch. SUPER_ADMIN callers
   * pass `undefined` (see the route handler) and see hospital-wide totals;
   * every other role is restricted to their own branch. Previously this
   * method took no branchId at all, so a branch-level ADMIN calling
   * `GET /api/v1/reporting/dashboard` saw revenue/patient/admission counts
   * for the *entire hospital* rather than just their branch — a branch
   * isolation leak in a report that is explicitly financial/administrative.
   */
  static async getExecutiveDashboardMetrics(branchId?: string) {
    // Note: In production, these would be filtered by current month vs previous month for trends

    const patientBranch = branchId ? { branchId } : {};

    // 1. Total Active Patients
    const totalPatients = await prisma.patient.count({
      where: { ...patientBranch, deletedAt: null },
    });

    // 2. Revenue (Sum of all completed payments), scoped via the invoice's branch
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: branchId ? { invoice: { branchId } } : undefined,
    });
    const totalRevenue = Number(payments._sum.amount || 0);

    // 3. Active Admissions
    const activeAdmissions = await prisma.admission.count({
      where: { status: 'ADMITTED', ...(branchId ? { patient: { branchId } } : {}) },
    });

    // 4. Upcoming (scheduled) appointments
    const pendingConsultations = await prisma.appointment.count({
      where: { status: 'SCHEDULED', ...patientBranch },
    });

    // 5. Bed occupancy — real figures from the Ward/Room/Bed schema.
    const beds = await prisma.bed.findMany({
      where: branchId ? { room: { ward: { branchId } } } : undefined,
      select: { status: true },
    });
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const bedOccupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : null;

    // 6. Active staff count
    const staffWhere = branchId ? { branchId, isActive: true } : { isActive: true };
    const activeStaff = await prisma.staff.count({ where: staffWhere });

    // 7. Doctors on duty (staff with DOCTOR role who are active)
    const doctorsOnDuty = await prisma.staff.count({
      where: {
        ...staffWhere,
        user: { role: ROLES.DOCTOR },
      },
    });

    // 8. 7-Day Flow Data (Visits and Revenue)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recentVisits = await prisma.visit.findMany({
      where: {
        startedAt: { gte: sevenDaysAgo },
        ...(branchId ? { patient: { branchId } } : {}),
      },
      select: { startedAt: true },
    });

    const recentPayments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        ...(branchId ? { invoice: { branchId } } : {}),
      },
      select: { createdAt: true, amount: true },
    });

    const flowDataMap = new Map<string, { patients: number; revenue: number }>();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dayName = days[d.getDay()];
      flowDataMap.set(dayName, { patients: 0, revenue: 0 });
    }

    recentVisits.forEach((v) => {
      const dayName = days[v.startedAt.getDay()];
      if (flowDataMap.has(dayName)) {
        flowDataMap.get(dayName)!.patients += 1;
      }
    });

    recentPayments.forEach((p) => {
      const dayName = days[p.createdAt.getDay()];
      if (flowDataMap.has(dayName)) {
        flowDataMap.get(dayName)!.revenue += Number(p.amount);
      }
    });

    // Ensure order is chronological from 6 days ago to today
    const flowData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dayName = days[d.getDay()];
      return {
        name: dayName,
        patients: flowDataMap.get(dayName)?.patients || 0,
        revenue: flowDataMap.get(dayName)?.revenue || 0,
      };
    });

    return {
      totalPatients,
      totalRevenue,
      activeAdmissions,
      pendingConsultations,
      bedOccupancyRate,
      occupiedBeds,
      totalBeds,
      activeStaff,
      doctorsOnDuty,
      flowData,
    };
  }

  /**
   * Generate raw data for specific report types.
   *
   * `branchId` scopes every query to the caller's permitted branch
   * (undefined = SUPER_ADMIN / hospital-wide). Payments are scoped through
   * `invoice.branchId`; visits through `patient.branchId`.
   */
  static async generateReportData(data: GenerateReportInput, branchId?: string) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    end.setHours(23, 59, 59, 999); // Include full end day

    switch (data.type) {
      case 'FINANCIAL':
        return await prisma.payment.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            ...(branchId ? { invoice: { branchId } } : {}),
          },
          include: { invoice: { select: { invoiceId: true, patient: { select: { firstName: true, lastName: true } } } } },
          orderBy: { createdAt: 'desc' }
        });
        
      case 'CLINICAL':
        return await prisma.visit.findMany({
          where: {
            startedAt: { gte: start, lte: end },
            ...(branchId ? { patient: { branchId } } : {}),
          },
          include: { patient: { select: { firstName: true, lastName: true } }, doctor: { select: { user: { select: { name: true } } } } },
          orderBy: { startedAt: 'desc' }
        });
        
      default:
        return [];
    }
  }
}
