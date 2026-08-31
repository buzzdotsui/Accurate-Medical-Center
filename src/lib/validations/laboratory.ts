import { z } from 'zod';

export const SaveLabResultSchema = z.object({
  findings: z.string().min(1, 'Findings are required'),
  conclusion: z.string().optional(),
  referenceRange: z.string().optional(),
  isAbnormal: z.boolean(),
  attachments: z.array(z.object({
    fileUrl: z.string().url(),
    fileName: z.string().min(1),
    fileType: z.string().min(1)
  })).optional()
});

export type SaveLabResultInput = z.infer<typeof SaveLabResultSchema>;
