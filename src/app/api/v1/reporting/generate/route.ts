import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { GenerateReportSchema } from '@/lib/validations/reporting';
import { ReportingService } from '@/services/reporting.service';
import { ok } from '@/lib/api/response';

export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, GenerateReportSchema);
  const result = await ReportingService.generateReportData(body);
  
  // Note: In production, if format === 'PDF', this endpoint would trigger a lambda or use a library (like puppeteer/pdfkit)
  // to render the PDF buffer and return it. For now, we return JSON payload for all types.
  
  return ok({ data: result, format: body.format }, { message: 'Report generated successfully' });
});
