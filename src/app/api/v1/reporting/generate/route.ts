import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { GenerateReportSchema } from '@/lib/validations/reporting';
import { ReportingService } from '@/services/reporting.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/reporting/generate
 * Generate a financial or clinical report.
 *
 * Authorization: SUPER_ADMIN, ADMIN, or ACCOUNTANT only.
 * Report data can include sensitive financial and clinical records that must
 * not be accessible to clinical staff, front-desk roles, or patients.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
  async (req, _session) => {
    const body = await parseBody(req, GenerateReportSchema);
    const result = await ReportingService.generateReportData(body);

    // Note: In production, if format === 'PDF', this endpoint would trigger a lambda or use a library (like puppeteer/pdfkit)
    // to render the PDF buffer and return it. For now, we return JSON payload for all types.

    return ok({ data: result, format: body.format }, { message: 'Report generated successfully' });
  }
);
