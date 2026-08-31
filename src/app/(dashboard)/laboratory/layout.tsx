import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function LaboratorySectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.LAB_SCIENTIST, ROLES.ADMIN, ROLES.DOCTOR]);
  return <>{children}</>;
}
