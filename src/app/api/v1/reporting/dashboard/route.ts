import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { ReportingService } from '@/services/reporting.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/reporting/dashboard
 * High-level KPI metrics for the hospital executive dashboard.
 *
 * Authorization: SUPER_ADMIN or ADMIN only.
 * This endpoint returns aggregate hospital metrics (patient totals, revenue,
 * admissions, pending consultations) and must not be accessible to clinical
 * staff, front-desk roles, or patients.
 *
 * Branch scoping: SUPER_ADMIN sees hospital-wide totals; ADMIN is scoped to
 * their own branch via `buildBranchFilter` (see ReportingService for why
 * this matters — it previously always returned hospital-wide figures).
 */
export const GET = withRole([ROLES.SUPER_ADMIN, ROLES.ADMIN], async (req, session) => {
  const branchFilter = buildBranchFilter(session.user);
  const metrics = await ReportingService.getExecutiveDashboardMetrics(branchFilter.branchId);
  return ok(metrics);
});
