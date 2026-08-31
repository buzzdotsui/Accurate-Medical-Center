import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function RadiologySectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.RADIOGRAPHER, ROLES.ADMIN, ROLES.DOCTOR]);
  return <>{children}</>;
}
