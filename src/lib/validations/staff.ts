import { z } from 'zod';
import { ROLES } from '@/config/roles';

/**
 * Server-side staff creation schema.
 *
 * FIX (Stage 3.5):
 * 1. z.string().cuid() was removed in Zod v4. Replaced with z.string().min(1)
 *    for ID fields that arrive as opaque strings from the database.
 * 2. branchId is now OPTIONAL in the schema. The API route already injects
 *    the correct branch from the admin's session when branchId is absent —
 *    the previous required .cuid() caused every request from the dialog
 *    (which never sends branchId) to fail with a 422 Validation Error.
 */
export const CreateStaffSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE,
    ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_SCIENTIST,
    ROLES.RADIOGRAPHER, ROLES.ACCOUNTANT, ROLES.THEATRE_STAFF,
    ROLES.MATERNAL_STAFF, ROLES.MENTAL_HEALTH, ROLES.AMBULANCE
  ]),
  // Optional — the API route resolves the correct branch from the session.
  branchId: z.string().min(1, 'Invalid branch ID').optional(),
  // Optional fields — department/specialization are not required for all roles.
  departmentId: z.string().min(1, 'Invalid department ID').optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
