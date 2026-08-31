import { prisma } from '@/lib/db/client';
import { GenerateReportInput } from '@/lib/validations/reporting';

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

    // 6. Low-stock medicine count (hospital-wide — Medicine has no branchId,
    // inventory is not currently branch-scoped in the schema).
    const medicines = await prisma.medicine.findMany({ select: { stockQuantity: true, reorderLevel: true } });
    const lowStockCount = medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;

    // 7. Active (unresolved) lab/radiology requests — operational load indicators.
    const pendingLabRequests = await prisma.labRequest.count({
      where: {
        status: { in: ['REQUESTED', 'SAMPLED', 'ANALYZING'] },
        ...(branchId ? { visit: { patient: { branchId } } } : {}),
      },
    });
    const pendingRadiologyRequests = await prisma.radiologyRequest.count({
      where: {
        status: { in: ['REQUESTED', 'SCANNED'] },
        ...(branchId ? { visit: { patient: { branchId } } } : {}),
      },
    });

    return {
      totalPatients,
      totalRevenue,
      activeAdmissions,
      pendingConsultations,
      bedOccupancyRate,
      occupiedBeds,
      totalBeds,
      lowStockCount,
      pendingLabRequests,
      pendingRadiologyRequests,
    };
  }

  /**
   * Generate raw data for specific report types
   */
  static async generateReportData(data: GenerateReportInput) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    end.setHours(23, 59, 59, 999); // Include full end day

    switch (data.type) {
      case 'FINANCIAL':
        return await prisma.payment.findMany({
          where: { createdAt: { gte: start, lte: end } },
          include: { invoice: { select: { invoiceId: true, patient: { select: { firstName: true, lastName: true } } } } },
          orderBy: { createdAt: 'desc' }
        });
        
      case 'CLINICAL':
        return await prisma.visit.findMany({
          where: { startedAt: { gte: start, lte: end } },
          include: { patient: { select: { firstName: true, lastName: true } }, doctor: { select: { user: { select: { name: true } } } } },
          orderBy: { startedAt: 'desc' }
        });
        
      default:
        return [];
    }
  }
}
