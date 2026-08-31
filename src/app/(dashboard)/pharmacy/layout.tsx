import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function PharmacySectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.PHARMACIST, ROLES.ADMIN]);
  return <>{children}</>;
}
