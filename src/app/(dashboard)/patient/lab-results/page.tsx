"use client";

import { FlaskConical } from "lucide-react";

/**
 * My Lab Results — patient-facing informational page.
 *
 * The lab requests API (/api/v1/laboratory/requests) is restricted to staff
 * roles (LAB_SCIENTIST, DOCTOR, ADMIN, SUPER_ADMIN) and intentionally excludes
 * PATIENT to prevent cross-patient data leaks. Lab results are surfaced to
 * patients through their doctor during follow-up consultations.
 */
export default function MyLabResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Lab Results</h1>
        <p className="text-muted-foreground mt-1">
          Laboratory test results ordered by your doctor.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center px-4">
        <FlaskConical className="mb-4 h-14 w-14 text-muted-foreground" />
        <p className="text-lg font-semibold">No lab results available yet</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Lab results will appear here once your doctor has ordered tests and they have been
          completed. Please contact reception or your doctor for details on your current results.
        </p>
      </div>
    </div>
  );
}
