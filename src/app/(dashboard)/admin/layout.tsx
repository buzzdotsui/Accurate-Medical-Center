import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function AdminSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.ADMIN]);
  return <>{children}</>;
}
