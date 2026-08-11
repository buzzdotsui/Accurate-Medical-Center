import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  hospitalName: z.string().min(2, 'Hospital name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  currency: z.string().length(3, 'Currency must be a 3-letter code (e.g., USD)'),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
