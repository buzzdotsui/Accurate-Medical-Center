import { z } from 'zod';

export const DispensePrescriptionSchema = z.object({
  status: z.enum(['DISPENSED', 'PARTIAL']),
  notes: z.string().optional()
});

export type DispensePrescriptionInput = z.infer<typeof DispensePrescriptionSchema>;
