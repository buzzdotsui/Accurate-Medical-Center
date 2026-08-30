import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function PatientSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.PATIENT]);
  return <>{children}</>;
}
