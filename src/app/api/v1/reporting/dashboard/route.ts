import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { ReportingService } from '@/services/reporting.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const metrics = await ReportingService.getExecutiveDashboardMetrics();
  return ok(metrics);
});
