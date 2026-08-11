import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const invoices = await BillingService.getActiveInvoices();
  return ok(invoices);
});
