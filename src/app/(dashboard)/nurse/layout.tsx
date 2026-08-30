import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";

export default async function NurseSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.NURSE]);
  return <>{children}</>;
}
