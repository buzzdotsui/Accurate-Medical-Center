import { z } from 'zod';

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
  branchId: z.string().cuid('Invalid branch ID').optional(),
  userId: z.string().cuid('Invalid user ID').optional(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = CreatePatientSchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
