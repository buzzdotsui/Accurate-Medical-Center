import { z } from 'zod';

/**
 * FIX (Stage 3.5): z.string().cuid() was removed in Zod v4.
 * Replaced with z.string().min(1) for all ID fields.
 */
export const CreatePatientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  genotype: z.enum(['AA', 'AS', 'SS', 'AC', 'SC']).optional(),
  address: z.string().optional(),
  branchId: z.string().min(1, 'Invalid branch ID').optional(),
  userId: z.string().min(1, 'Invalid user ID').optional(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = CreatePatientSchema.partial().extend({
  id: z.string().min(1, 'Invalid patient ID'),
});

export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;

export const SetPatientStatusSchema = z.object({
  isActive: z.boolean(),
});

export type SetPatientStatusInput = z.infer<typeof SetPatientStatusSchema>;
