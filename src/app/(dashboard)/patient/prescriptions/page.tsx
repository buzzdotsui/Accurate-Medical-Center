"use client";

import { useQuery } from "@tanstack/react-query";
import { Pill } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";

interface PrescriptionRow {
  id: string;
  prescriptionId: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    dispensedQty: number;
    instructions?: string | null;
    medicine: { name: string; genericName?: string | null; unit: string };
  }>;
  visit?: {
    visitId: string;
    doctor?: { user?: { name?: string } } | null;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  PARTIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DISPENSED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

/**
 * My Prescriptions — patient portal, scoped to the signed-in patient only
 * via GET /api/v1/patient/prescriptions.
 */
export default function MyPrescriptionsPage() {
  const { data, isLoading, error, refetch } = useQuery<PrescriptionRow[]>({
    queryKey: ["patient_prescriptions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/patient/prescriptions");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load prescriptions");
      }
      const json = await res.json();
      return json.data as PrescriptionRow[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Prescriptions</h1>
        <p className="text-muted-foreground mt-1">
          Prescriptions issued by your doctor after consultations.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Failed to load prescriptions"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <LoadingState message="Loading prescriptions…" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Pill className="w-full h-full" />}
          title="No prescriptions yet"
          description="Your prescriptions will appear here after your consultation."
        />
      ) : (
        <div className="space-y-3">
          {data.map((rx) => (
            <article key={rx.id} className="rounded-xl border bg-card p-4 md:p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground font-mono text-sm">
                    {rx.prescriptionId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(rx.createdAt).toLocaleDateString()}
                    {rx.visit?.doctor?.user?.name
                      ? ` · Dr. ${rx.visit.doctor.user.name}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[rx.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {rx.status.replace("_", " ")}
                </span>
              </div>

              <ul className="divide-y rounded-lg border">
                {rx.items.map((item) => (
                  <li key={item.id} className="px-3 py-2.5 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {item.medicine.name}
                        {item.medicine.genericName
                          ? ` (${item.medicine.genericName})`
                          : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Qty {item.quantity} {item.medicine.unit}
                        {item.dispensedQty > 0 ? ` · dispensed ${item.dispensedQty}` : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.dosage} · {item.frequency} · {item.duration}
                      {item.instructions ? ` · ${item.instructions}` : ""}
                    </p>
                  </li>
                ))}
              </ul>

              {rx.notes && (
                <p className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">Note</Badge>
                  {rx.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
