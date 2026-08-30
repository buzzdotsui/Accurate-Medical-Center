import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

/**
 * ADMIN may view this section (e.g. their own branch's audit trail), but
 * the underlying `PUT /api/v1/settings` mutation is SUPER_ADMIN-only at
 * the API layer — "configuration" is a SUPER_ADMIN responsibility.
 */
export default async function SettingsSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.ADMIN]);
  return <>{children}</>;
}
