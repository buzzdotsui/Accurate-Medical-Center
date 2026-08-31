"use client";

import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Baby, Heart, Activity, Bed } from "lucide-react";

interface Admission {
  id: string;
  admissionId: string;
  admittedAt: string;
  reason: string;
  status: string;
  patient: { firstName: string; lastName: string; patientId: string };
  doctor: { user: { name: string } };
  bed: { bedNumber: string; room: { roomNumber: string; ward: { name: string } } } | null;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function MaternalDashboard() {
  const {
    data: admissions,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<Admission[]>({
    queryKey: ["maternal_admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/admissions");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load admissions");
      }
      const json = await res.json();
      return json.data as Admission[];
    },
    staleTime: 60_000,
  });

  const admittedToday = admissions?.filter((a) => isToday(a.admittedAt)).length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Maternal Care
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Antenatal, delivery, and postnatal care management.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/30 px-4 py-3 text-sm text-pink-800 dark:text-pink-300">
        <strong>Note:</strong> Antenatal care (ANC), delivery records, and postnatal workflow are
        planned for a future stage. Active inpatient admissions are shown below.
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-3">
          <span>{(error as Error).message}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-destructive underline"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Active Admissions"
              value={admissions?.length ?? "—"}
              icon={Bed}
            />
            <StatCard
              title="Admitted Today"
              value={admittedToday}
              icon={Activity}
            />
            <StatCard
              title="ANC Visits"
              value="—"
              description="Coming soon"
              icon={Heart}
            />
            <StatCard
              title="Deliveries"
              value="—"
              description="Coming soon"
              icon={Baby}
            />
          </>
        )}
      </div>

      {/* Admissions table */}
      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">Active Admissions</h2>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !admissions || admissions.length === 0 ? (
          <EmptyState
            icon={<Bed className="w-full h-full" />}
            title="No active admissions"
            description="Active inpatient admissions will appear here."
          />
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ward</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Admitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admissions.map((admission) => (
                  <tr key={admission.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {admission.patient.firstName} {admission.patient.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {admission.patient.patientId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {admission.reason}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {admission.bed?.room?.ward?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(admission.admittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
