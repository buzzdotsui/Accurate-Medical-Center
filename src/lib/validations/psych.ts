import { z } from 'zod';

export const CreatePsychAssessmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  evaluation: z.string().min(2, 'Evaluation is required'),
  score: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export type CreatePsychAssessmentInput = z.infer<typeof CreatePsychAssessmentSchema>;

export const CreateTherapySessionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  date: z.string().min(1, 'Date is required'),
  duration: z.coerce.number().int().min(5, 'Duration must be at least 5 minutes').max(480),
  sessionType: z.enum(['CBT', 'COUNSELING', 'ADDICTION'], {
    message: 'Session type must be CBT, COUNSELING, or ADDICTION',
  }),
  progressNotes: z.string().min(2, 'Progress notes are required'),
  nextSteps: z.string().optional(),
});

export type CreateTherapySessionInput = z.infer<typeof CreateTherapySessionSchema>;
