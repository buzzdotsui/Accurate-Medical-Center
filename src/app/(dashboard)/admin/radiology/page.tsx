import { isDeferredModuleEnabled } from "@/lib/config/deferred-modules";
import { DeferredModuleNotice } from "@/components/deferred-module-notice";
import AdminRadiologyClient from "./admin-radiology-client";

/**
 * Admin radiology audit surface. Radiology workflows are explicit future
 * scope (invoice TTI/2026/HMS-P1-002): the Phase 1 product shows a
 * deferral notice on direct access while the full implementation is
 * preserved in admin-radiology-client.tsx for a future phase.
 */
export default function AdminRadiologyPage() {
  if (!isDeferredModuleEnabled()) {
    return (
      <DeferredModuleNotice
        title="Radiology (Admin View)"
        subtitle="Deferred module"
        description="Radiology workflows are deferred to a future phase and are not part of the current product release. Scan queues and report audits will become available when the module is purchased and enabled."
      />
    );
  }
  return <AdminRadiologyClient />;
}
