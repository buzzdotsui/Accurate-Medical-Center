import { z } from 'zod';
import { siteConfig } from '@/config/site';

export const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Invalid patient ID'),
  // branchId is OPTIONAL here — the API route resolves it from the session
  // (for SUPER_ADMIN: falls back to first active HQ branch).
  // Clients (dialogs) should never need to supply branchId.
  branchId: z.string().min(1, 'Invalid branch ID').optional(),
  doctorId: z.string().min(1, 'Invalid doctor ID').optional(),
  date: z.string().datetime(),
  timeSlot: z.string().optional(),
  type: z.enum(['IN_PERSON', 'ONLINE']).default('IN_PERSON'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CHECKED_IN', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'IN_PROGRESS']),
});

export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;

export const PUBLIC_APPOINTMENT_FIELD_LIMITS = {
  name: 100,
  phone: 32,
  email: 254,
  notes: 1_000,
} as const;

const headerSafe = (value: string) => !/[\r\n\u0000]/.test(value);
const phonePattern = /^[0-9+()./\-\s]*$/;
const publicServiceNames: readonly string[] = siteConfig.services.map((service) => service.name);

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const PublicAppointmentRequestSchema = z.object({
  firstName: z.string().trim().min(2, 'Please enter your first name.').max(PUBLIC_APPOINTMENT_FIELD_LIMITS.name, 'First name is too long.').refine(headerSafe, 'First name contains unsupported characters.'),
  lastName: z.string().trim().min(2, 'Please enter your last name.').max(PUBLIC_APPOINTMENT_FIELD_LIMITS.name, 'Last name is too long.').refine(headerSafe, 'Last name contains unsupported characters.'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(PUBLIC_APPOINTMENT_FIELD_LIMITS.phone, 'Phone number is too long.').regex(phonePattern, 'Phone number contains unsupported characters.'),
  email: z.string().trim().max(PUBLIC_APPOINTMENT_FIELD_LIMITS.email, 'Email address is too long.').email('Please enter a valid email address.').refine(headerSafe, 'Email address contains unsupported characters.').optional().or(z.literal('')),
  service: z.string().trim().refine((value) => publicServiceNames.includes(value), 'Please select a service.'),
  preferredDate: z.string().refine(isValidDateOnly, 'Please select a valid preferred date.'),
  notes: z.string().trim().max(PUBLIC_APPOINTMENT_FIELD_LIMITS.notes, 'Additional notes are too long.').refine(headerSafe, 'Additional notes contain unsupported characters.').optional().default(''),
  website: z.string().max(0).optional().default(''),
}).strict();

export type PublicAppointmentRequestInput = z.infer<typeof PublicAppointmentRequestSchema>;
