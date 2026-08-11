import { z } from 'zod';

export const SaveVitalsSchema = z.object({
  visitId: z.string().cuid('Invalid visit ID'),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Format must be SYS/DIA (e.g. 120/80)').optional().or(z.literal('')),
  heartRate: z.coerce.number().min(30).max(250).optional(),
  temperature: z.coerce.number().min(30).max(45).optional(),
  respiratoryRate: z.coerce.number().min(5).max(60).optional(),
  oxygenSaturation: z.coerce.number().min(50).max(100).optional(),
  weight: z.coerce.number().min(1).max(500).optional(),
  height: z.coerce.number().min(20).max(300).optional(),
  notes: z.string().optional()
});

export type SaveVitalsInput = z.infer<typeof SaveVitalsSchema>;
