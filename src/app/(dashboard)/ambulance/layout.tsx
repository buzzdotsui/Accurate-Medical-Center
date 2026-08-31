import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function AmbulanceSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.AMBULANCE]);
  return <>{children}</>;
}
