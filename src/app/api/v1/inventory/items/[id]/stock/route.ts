import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { AdjustStockSchema } from '@/lib/validations/inventory';
import { InventoryService } from '@/services/inventory.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';

export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const medicineId = await getParam(ctx, 'id');
  const body = await parseBody(req, AdjustStockSchema);
  const result = await InventoryService.adjustStock(medicineId, body, session.user.id);
  return ok(result, { message: 'Stock adjusted successfully' });
});
