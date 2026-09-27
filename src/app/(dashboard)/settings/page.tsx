"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import type { User } from "@/lib/auth/user";
import { ROLES } from "@/config/roles";

export default function SettingsRedirectPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const role = ((session.user as Record<string, unknown>)?.role as string) || ROLES.PATIENT;
      // Redirect to the first available section for the user's role
      if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role as any)) {
        router.push("/settings/admin");
      } else {
        router.push("/settings/profile");
      }
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}