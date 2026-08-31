import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function BillingSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.ACCOUNTANT, ROLES.ADMIN, ROLES.RECEPTIONIST]);
  return <>{children}</>;
}
