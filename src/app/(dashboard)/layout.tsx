import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/lib/auth/config";
import { type Role } from "@/config/roles";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fetch real user session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user.role as Role) || "PATIENT";

  return (
    <div className="flex h-screen bg-grey-50">
      {/* Sidebar */}
      <Sidebar role={userRole} user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar user={session.user} role={userRole} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
