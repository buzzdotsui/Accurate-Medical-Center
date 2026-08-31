import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function MaternalSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.MATERNAL_STAFF]);
  return <>{children}</>;
}
