import { z } from 'zod';

export const StartVisitSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
  chiefComplaint: z.string().optional(),
});

export const RecordVitalsSchema = z.object({
  bloodPressure: z.string().optional(),
  heartRate: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
  respiratoryRate: z.coerce.number().optional(),
  spO2: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});

export const AddDiagnosisSchema = z.object({
  code: z.string().optional(),
  description: z.string().min(2),
  type: z.enum(['PRIMARY', 'SECONDARY']).default('PRIMARY'),
  notes: z.string().optional(),
});
