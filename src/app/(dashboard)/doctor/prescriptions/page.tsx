"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, RefreshCw } from "lucide-react";

interface PrescriptionItem {
  medicineId: string;
  quantity: number;
  dosage: string;
}

interface Prescription {
  id: string;
  prescriptionId: string;
  createdAt: string;
  status: string;
  notes: string | null;
  visit: {
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    };
  };
  items: PrescriptionItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PARTIAL:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DISPENSED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DoctorPrescriptionsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<Prescription[]>({
    queryKey: ["doctor_prescriptions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/pharmacy/prescriptions?take=50");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load prescriptions");
      }
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    },
    staleTime: 60_000,
  });

  const prescriptions = data ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">
            Showing branch prescriptions.
            {data && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                {prescriptions.length} record{prescriptions.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-5 border-b flex items-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Pill className="w-12 h-12 text-destructive/40 mb-2" />
              <p className="text-destructive font-medium">{(error as Error).message}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Pill className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No prescriptions</h3>
              <p className="text-muted-foreground mt-1">
                Branch prescriptions will appear here once created.
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Prescription ID
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">
                      # Items
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {prescriptions.map((rx) => (
                    <tr
                      key={rx.id}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <td className="p-6 align-middle font-mono text-xs text-muted-foreground">
                        {rx.prescriptionId}
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">
                          {rx.visit.patient.firstName} {rx.visit.patient.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {rx.visit.patient.patientId}
                        </div>
                      </td>
                      <td className="p-6 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[rx.status] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {rx.status}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-muted-foreground text-sm">
                        {formatDate(rx.createdAt)}
                      </td>
                      <td className="p-6 align-middle text-right font-semibold">
                        {rx.items.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
