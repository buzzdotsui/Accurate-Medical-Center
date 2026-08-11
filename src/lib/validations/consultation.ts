import { z } from 'zod';

export const CreateConsultationSchema = z.object({
  visitId: z.string().cuid('Invalid visit ID'),
  subjective: z.string().min(1, 'Subjective notes are required'),
  objective: z.string().min(1, 'Objective notes are required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
  diagnosis: z.array(z.string()).optional(),
  prescriptions: z.array(z.object({
    medicationName: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional()
  })).optional()
});

export type CreateConsultationInput = z.infer<typeof CreateConsultationSchema>;
