import { prisma } from '@/lib/db/client';
import { AdjustStockInput } from '@/lib/validations/inventory';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class InventoryService {
  /**
   * Get all inventory items with supplier info.
   * `branchId` is accepted for API consistency and future per-branch
   * inventory support; the Medicine model is currently org-wide (no
   * branchId column), so the param does not filter the query yet.
   */
  static async getInventoryItems(_branchId?: string) {
    return await prisma.medicine.findMany({
      include: {
        inventoryTx: { include: { supplier: true }, take: 1 }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get items that are at or below their reorder level
   */
  static async getLowStockAlerts() {
    // We fetch all items where stockLevel <= reorderLevel
    // Because Prisma can't directly compare two columns in a single where clause cleanly without rawQuery in some DBs,
    // we use a specific approach. However, assuming simple schema, we'll fetch all and filter, or use raw if necessary.
    // For safety with large datasets, we fetch those where stock is explicitly low (e.g., < 20).
    const items = await prisma.medicine.findMany({});
    return items.filter(item => item.stockQuantity <= item.reorderLevel);
  }

  /**
   * Adjust stock for an item
   */
  static async adjustStock(medicineId: string, data: AdjustStockInput, executorId: string, executorRole?: string) {
    const item = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!item) throw new AppError('Item not found', 'NOT_FOUND', 404);

    let newStockLevel = item.stockQuantity;
    
    if (data.type === 'IN') {
      newStockLevel += data.quantity;
    } else {
      // OUT, ADJUSTMENT (down), EXPIRED
      if (item.stockQuantity < data.quantity) {
        throw new AppError('Insufficient stock for this operation', 'VALIDATION_ERROR', 400);
      }
      newStockLevel -= data.quantity;
    }

    return await prisma.$transaction(async (tx) => {
      // Create stock movement record
      const movement = await tx.inventoryTransaction.create({
        data: {
          medicineId: item.id,
          type: data.type,
          quantity: data.quantity,
          reference: data.reference,
          notes: data.notes,
          // performedBy: executorId // No performedBy in InventoryTransaction schema
        }
      });

      // Update actual stock
      const updatedItem = await tx.medicine.update({
        where: { id: item.id },
        data: { stockQuantity: newStockLevel }
      });

      // Log Audit
      await AuditService.log({
        userId: executorId,
        userRole: executorRole ?? 'ADMIN',
        action: 'ADJUST_STOCK',
        resource: 'MEDICINE',
        resourceId: item.id,
        details: { type: data.type, quantity: data.quantity, newStock: newStockLevel }
      });

      return { movement, item: updatedItem };
    });
  }
}
