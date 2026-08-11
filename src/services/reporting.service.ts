import { prisma } from '@/lib/db/client';
import { GenerateReportInput } from '@/lib/validations/reporting';

export class ReportingService {
  /**
   * Get high-level KPI metrics for the hospital executive dashboard
   */
  static async getExecutiveDashboardMetrics() {
    // Note: In production, these would be filtered by current month vs previous month for trends
    
    // 1. Total Active Patients
    const totalPatients = await prisma.patient.count();
    
    // 2. Revenue (Sum of all completed payments)
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    const totalRevenue = Number(payments._sum.amount || 0);

    // 3. Active Admissions
    const activeAdmissions = await prisma.admission.count({
      where: { status: 'ADMITTED' }
    });

    // 4. Pending Consultations
    const pendingConsultations = await prisma.appointment.count({
      where: { status: 'SCHEDULED' }
    });

    return {
      totalPatients,
      totalRevenue,
      activeAdmissions,
      pendingConsultations
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
