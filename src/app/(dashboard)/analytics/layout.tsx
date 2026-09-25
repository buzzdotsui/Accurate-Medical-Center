import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";
import { isDeferredModuleEnabled } from "@/lib/config/deferred-modules";
import { DeferredModuleNotice } from "@/components/deferred-module-notice";

export default async function AnalyticsSectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.ADMIN]);
  // Advanced reporting/analytics is future scope (invoice TTI/2026/HMS-P1-002).
  // Operational KPIs stay on the role dashboards; this section is preserved
  // in code but unavailable unless deferred modules are explicitly enabled.
  if (!isDeferredModuleEnabled()) {
    return (
      <DeferredModuleNotice
        title="Advanced Reporting & Analytics"
        subtitle="Deferred module"
        description="Advanced reporting and analytics are deferred to a future phase and are not part of the current product release. Operational dashboards, KPIs, and records remain available on your role dashboard."
      />
    );
  }
  return <>{children}</>;
}
