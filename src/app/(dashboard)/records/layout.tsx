import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

/**
 * The /records directory holds universal profiles (Patient Profile, Staff Profile).
 * Accessible by ALL hospital staff, but completely blocked for patients.
 */
export default async function RecordsLayout({ children }: { children: ReactNode }) {
  // Prevent PATIENT from accessing this layout. They should only use their own portal.
  await requireRole([
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, 
    ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_SCIENTIST, 
    ROLES.RADIOGRAPHER, ROLES.ACCOUNTANT, ROLES.THEATRE_STAFF, 
    ROLES.MATERNAL_STAFF, ROLES.MENTAL_HEALTH
  ]);
  
  return <>{children}</>;
}
