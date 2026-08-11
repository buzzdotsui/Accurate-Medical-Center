import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { ProcessPaymentSchema } from '@/lib/validations/billing';
import { BillingService } from '@/services/billing.service';
import { ok } from '@/lib/api/response';

export const POST = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, ProcessPaymentSchema);
  const result = await BillingService.processPayment(params.id, body, session.user.id);
  return ok(result, { message: 'Payment processed successfully' });
});
