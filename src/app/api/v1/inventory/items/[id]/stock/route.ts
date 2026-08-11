import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { AdjustStockSchema } from '@/lib/validations/inventory';
import { InventoryService } from '@/services/inventory.service';
import { ok } from '@/lib/api/response';

export const POST = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, AdjustStockSchema);
  const result = await InventoryService.adjustStock(params.id, body, session.user.id);
  return ok(result, { message: 'Stock adjusted successfully' });
});
