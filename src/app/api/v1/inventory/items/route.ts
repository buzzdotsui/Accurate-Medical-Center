import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { InventoryService } from '@/services/inventory.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const items = await InventoryService.getInventoryItems();
  return ok(items);
});
