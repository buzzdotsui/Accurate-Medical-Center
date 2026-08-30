import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { AdjustStockSchema } from '@/lib/validations/inventory';
import { InventoryService } from '@/services/inventory.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';

/**
 * POST /api/v1/inventory/items/:id/stock
 * Adjust stock levels for an inventory item.
 *
 * Authorization: PHARMACIST, ADMIN, or SUPER_ADMIN only. Previously open
 * to any authenticated user, allowing anyone (including a PATIENT) to
 * mutate medicine/consumable stock levels.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PHARMACIST],
  async (req, session, ctx: RouteContext) => {
    const medicineId = await getParam(ctx, 'id');
    const body = await parseBody(req, AdjustStockSchema);
    const result = await InventoryService.adjustStock(medicineId, body, session.user.id);
    return ok(result, { message: 'Stock adjusted successfully' });
  }
);
