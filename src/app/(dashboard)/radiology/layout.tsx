import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { ROLES } from "@/config/roles";
import { isDeferredModuleEnabled } from "@/lib/config/deferred-modules";
import { DeferredModuleNotice } from "@/components/deferred-module-notice";

export default async function RadiologySectionLayout({ children }: { children: ReactNode }) {
  await requireRole([ROLES.RADIOGRAPHER, ROLES.ADMIN, ROLES.DOCTOR]);
  // Radiology workflows are explicit future scope (invoice TTI/2026/HMS-P1-002).
  // Source (pages, service, APIs, schema) is preserved for a future phase;
  // the Phase 1 product shows a deferral notice instead of the work queue.
  if (!isDeferredModuleEnabled()) {
    return (
      <DeferredModuleNotice
        title="Radiology"
        subtitle="Deferred module"
        description="Radiology workflows are deferred to a future phase and are not part of the current product release. Imaging orders placed during consultation remain part of the patient's clinical record."
      />
    );
  }
  return <>{children}</>;
}
