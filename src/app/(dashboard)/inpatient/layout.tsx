import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function InpatientSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.DOCTOR, ROLES.NURSE, ROLES.ADMIN, ROLES.THEATRE_STAFF, ROLES.MATERNAL_STAFF]);
  return <>{children}</>;
}
