import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function PsychSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.MENTAL_HEALTH]);
  return <>{children}</>;
}
