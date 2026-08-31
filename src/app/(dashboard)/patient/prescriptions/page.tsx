"use client";

import { Pill } from "lucide-react";

/**
 * My Prescriptions — patient-facing informational page.
 *
 * The pharmacy prescriptions API (/api/v1/pharmacy/prescriptions) is restricted
 * to staff roles (PHARMACIST, DOCTOR, ADMIN, SUPER_ADMIN) and intentionally
 * excludes PATIENT to prevent cross-patient data leaks. Prescriptions are
 * issued to patients directly via the pharmacy after each consultation.
 */
export default function MyPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Prescriptions</h1>
        <p className="text-muted-foreground mt-1">
          Prescriptions issued by your doctor after consultations.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center px-4">
        <Pill className="mb-4 h-14 w-14 text-muted-foreground" />
        <p className="text-lg font-semibold">No prescriptions yet</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your prescriptions will appear here after your consultation. Please visit the pharmacy
          or contact your doctor for information about your current medications.
        </p>
      </div>
    </div>
  );
}
