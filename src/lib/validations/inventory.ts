import { z } from 'zod';

export const AdjustStockSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'EXPIRED']),
  quantity: z.number().int().positive('Quantity must be positive'),
  reference: z.string().optional(),
  notes: z.string().optional()
});

export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
