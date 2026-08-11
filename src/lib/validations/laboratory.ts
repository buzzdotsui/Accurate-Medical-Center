import { z } from 'zod';

export const SaveLabResultSchema = z.object({
  findings: z.string().min(1, 'Findings are required'),
  conclusion: z.string().optional(),
  referenceRange: z.string().optional(),
  isAbnormal: z.boolean()
});

export type SaveLabResultInput = z.infer<typeof SaveLabResultSchema>;
