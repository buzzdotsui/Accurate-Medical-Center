import { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { auth } from "@/lib/auth/config";
import { type Role } from "@/config/roles";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fetch real user session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = ((session.user as Record<string, unknown>)?.role as Role) || "PATIENT";

  return (
    <div className="flex h-screen bg-[#f7f8f5] p-0 md:p-4 md:gap-4 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar role={userRole} user={session.user} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:rounded-2xl md:shadow-xl md:shadow-black/[0.02] md:border border-black/[0.04] overflow-hidden">
        {/* Topbar */}
        <Topbar user={session.user} role={userRole} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-10">
          <PageTransition>
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
