import { z } from 'zod';

export const SaveRadiologyReportSchema = z.object({
  findings: z.string().min(1, 'Findings are required'),
  conclusion: z.string().min(1, 'Conclusion is required'),
  images: z.array(z.object({
    imageUrl: z.string().url(),
    dicomUrl: z.string().url().optional(),
    notes: z.string().optional()
  })).optional()
});

export type SaveRadiologyReportInput = z.infer<typeof SaveRadiologyReportSchema>;
