import { z } from 'zod';

export const AssignShiftSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'OFF']),
  notes: z.string().optional()
});

export type AssignShiftInput = z.infer<typeof AssignShiftSchema>;
