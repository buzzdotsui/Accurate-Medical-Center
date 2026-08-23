import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  patientId: z.string().cuid('Invalid patient ID'),
  branchId: z.string().cuid('Invalid branch ID'),
  doctorId: z.string().cuid('Invalid doctor ID').optional(),
  date: z.string().datetime(),
  timeSlot: z.string().optional(),
  type: z.enum(['IN_PERSON', 'ONLINE']).default('IN_PERSON'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;

export const PublicAppointmentRequestSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  service: z.string().min(2, 'Service selection is required'),
  preferredDate: z.string().datetime(),
  notes: z.string().optional(),
});

export type PublicAppointmentRequestInput = z.infer<typeof PublicAppointmentRequestSchema>;
