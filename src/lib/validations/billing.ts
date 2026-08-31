import { z } from 'zod';

export const ProcessPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'INSURANCE']),
  reference: z.string().optional()
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;

export const CreateInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().positive().optional().default(1),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  reference: z.string().optional(),
});

export const CreateInvoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  branchId: z.string().optional(), // resolved server-side for non-SUPER_ADMIN
  items: z.array(CreateInvoiceItemSchema).min(1, 'At least one item is required'),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
  dueDate: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
