import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { ROLE_DASHBOARD_ROOTS } from "@/config/nav";
import { ROLES } from "@/config/roles";

export default async function DashboardIndexPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Find their dashboard root based on role
  const role = session.user.role || ROLES.PATIENT;
  const destination = ROLE_DASHBOARD_ROOTS[role as keyof typeof ROLE_DASHBOARD_ROOTS] || "/patient";

  redirect(destination);
}
