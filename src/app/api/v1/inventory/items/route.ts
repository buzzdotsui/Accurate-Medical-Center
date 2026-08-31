import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { InventoryService } from '@/services/inventory.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE],
  async (req: NextRequest, session) => {
    const { branchId } = buildBranchFilter(session.user);
    const items = await InventoryService.getInventoryItems(branchId);
    return ok(items);
  }
);
