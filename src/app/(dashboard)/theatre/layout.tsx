import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function TheatreSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.THEATRE_STAFF]);
  return <>{children}</>;
}
