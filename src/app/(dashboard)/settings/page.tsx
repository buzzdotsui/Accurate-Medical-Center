import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { ROLES, type Role } from "@/config/roles";

/**
 * /settings (index page)
 *
 * Server-side redirect — ADMIN/SUPER_ADMIN goes to the admin settings hub,
 * everyone else to their profile. No client-side spinner required.
 */
export default async function SettingsRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const role =
    ((session.user as Record<string, unknown>)?.role as Role) || ROLES.PATIENT;

  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) {
    redirect("/settings/admin");
  }

  redirect("/settings/profile");
}