import { z } from 'zod';

export const AdmitPatientSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  visitId: z.string().optional(),
  bedId: z.string().min(1, 'Bed allocation is required'),
  reason: z.string().min(1, 'Admission reason is required')
});

export const DischargePatientSchema = z.object({
  dischargeNotes: z.string().optional()
});

export type AdmitPatientInput = z.infer<typeof AdmitPatientSchema>;
export type DischargePatientInput = z.infer<typeof DischargePatientSchema>;
