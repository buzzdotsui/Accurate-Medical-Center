import { z } from 'zod';

export const GenerateReportSchema = z.object({
  type: z.enum(['FINANCIAL', 'CLINICAL', 'INVENTORY', 'HR']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  format: z.enum(['CSV', 'PDF', 'JSON'])
});

export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
