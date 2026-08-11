import { z } from 'zod';
import { ROLES } from '@/config/roles';

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
  departmentId: z.string().cuid('Invalid department ID').optional(),
  branchId: z.string().cuid('Invalid branch ID'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
