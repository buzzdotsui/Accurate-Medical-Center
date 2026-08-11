import { z } from 'zod';

export const ProcessPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'INSURANCE']),
  reference: z.string().optional()
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;
