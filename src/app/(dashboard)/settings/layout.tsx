import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES, type Role } from "@/config/roles";

/**
 * All authenticated users can access settings, but the admin section
 * is restricted to ADMIN/SUPER_ADMIN roles.
 */
export default async function SettingsSectionLayout({ children }: { children: ReactNode }) {
  const session = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT,
  ]);
  
  // Pass the role to the client layout via a data attribute or context
  return (
    <div data-user-role={session.user.role as Role}>
      {children}
    </div>
  );
}
