import { z } from 'zod';

export const CreateConsultationSchema = z.object({
  visitId: z.string().min(1, 'Invalid visit ID'),
  subjective: z.string().min(1, 'Subjective notes are required'),
  objective: z.string().min(1, 'Objective notes are required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
  diagnosis: z.array(z.string()).optional(),
  // Prescriptions must reference a real Medicine catalog entry (medicineId)
  // so the resulting MedicationItem rows are visible to, and dispensable
  // by, Pharmacy — a free-text medication name (the previous shape) had no
  // link to the Medicine/inventory model at all, so nothing prescribed by a
  // doctor could ever be dispensed with real stock tracking.
  prescriptions: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine is required'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional()
  })).optional(),
  labRequests: z.array(z.object({
    categoryId: z.string().min(1, 'Lab category is required'),
    testName: z.string().min(1, 'Test name is required'),
    priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
    notes: z.string().optional(),
  })).optional(),
  radiologyRequests: z.array(z.object({
    scanType: z.enum(['XRAY', 'ULTRASOUND', 'MRI', 'CT']),
    region: z.string().min(1, 'Region is required'),
    priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
    clinicalNotes: z.string().optional(),
  })).optional(),
});

export type CreateConsultationInput = z.infer<typeof CreateConsultationSchema>;
