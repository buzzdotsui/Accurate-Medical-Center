import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { GenerateReportSchema } from '@/lib/validations/reporting';
import { ReportingService } from '@/services/reporting.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';

/**
 * POST /api/v1/reporting/generate
 * Generate a financial or clinical report.
 *
 * DEFERRED — advanced reporting/analytics is future scope (invoice
 * TTI/2026/HMS-P1-002). Source preserved for a future phase; the endpoint
 * returns 403 unless PHASE1_ENABLE_DEFERRED_MODULES=true. Operational
 * dashboard KPIs use GET /api/v1/reporting/dashboard, which stays available
 * to Phase 1 admin dashboards.
 *
 * Authorization: SUPER_ADMIN, ADMIN, or ACCOUNTANT only.
 * Report data can include sensitive financial and clinical records that must
 * not be accessible to clinical staff, front-desk roles, or patients.
 *
 * Branch scoping: SUPER_ADMIN sees hospital-wide data; every other role is
 * restricted to their own branch via `buildBranchFilter` (enforced in the
 * service queries — never by the client).
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
  async (req, session) => {
    if (!isDeferredModuleEnabled()) {
      throw new AppError(
        'This module is not included in the current Phase 1 release.',
        'FORBIDDEN',
        403,
      );
    }
    const body = await parseBody(req, GenerateReportSchema);
    const branchFilter = buildBranchFilter(session.user);
    const result = await ReportingService.generateReportData(body, branchFilter.branchId);

    // Note: In production, if format === 'PDF', this endpoint would trigger a lambda or use a library (like puppeteer/pdfkit)
    // to render the PDF buffer and return it. For now, we return JSON payload for all types.

    return ok({ data: result, format: body.format }, { message: 'Report generated successfully' });
  }
);
