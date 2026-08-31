"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Bed, Bell, Plus, CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface AppointmentStats {
  todayTotal: number;
  todayCheckedIn: number;
  inQueue: number;
  arrivedCount: number;
  noShowCount: number;
}

interface VitalsQueueResponse {
  total: number;
  visits: unknown[];
}

interface Admission {
  id: string;
  admittedAt: string;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
  };
  bed: {
    room: {
      ward: {
        name: string;
      };
    };
  } | null;
}

export default function NurseDashboard() {
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery<AppointmentStats>({
    queryKey: ["nurse_dashboard_stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/appointments/stats");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load stats");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const { data: vitalsData, isLoading: vitalsLoading } =
    useQuery<VitalsQueueResponse>({
      queryKey: ["nurse_vitals_due"],
      queryFn: async () => {
        const res = await fetch(
          "/api/v1/clinical/visits?status=IN_PROGRESS&hasVitals=false&take=1"
        );
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error?.message ?? "Failed to load vitals data");
        }
        const json = await res.json();
        return json.data;
      },
      staleTime: 60_000,
    });

  const {
    data: admissionsData,
    isLoading: admissionsLoading,
    error: admissionsError,
    refetch: refetchAdmissions,
  } = useQuery<Admission[]>({
    queryKey: ["nurse_ward_admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/admissions");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load admissions");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const isLoading = statsLoading || vitalsLoading || admissionsLoading;
  const error = statsError ?? admissionsError;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Nursing Station
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Triage queue, ward patients, and pending tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background" asChild>
            <Link href="/nurse/vitals">
              <Activity className="w-4 h-4" /> Record Vitals
            </Link>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/nurse/queue">
              <Plus className="w-4 h-4" /> New Triage
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-3">
          <span>{(error as Error).message}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-destructive underline"
            disabled={statsFetching}
            onClick={() => {
              refetchStats();
              refetchAdmissions();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Triage Queue"
              value={statsData?.inQueue ?? "—"}
              icon={Users}
            />
            <StatCard
              title="Vitals Due"
              value={vitalsData?.total ?? "—"}
              icon={Activity}
            />
            <StatCard
              title="Ward Patients"
              value={admissionsData?.length ?? "—"}
              icon={Bed}
            />
            <StatCard
              title="Checked In Today"
              value={statsData?.todayCheckedIn ?? "—"}
              icon={CheckCircle}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Triage Queue section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold">Triage Queue</h2>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/nurse/queue">
                <Users className="w-4 h-4" /> View Full Queue
              </Link>
            </Button>
          </div>

          {statsLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : (statsData?.inQueue ?? 0) === 0 ? (
            <EmptyState
              icon={<Users className="w-full h-full" />}
              title="Triage queue is empty"
              description="Patients waiting for triage assessment will appear here."
              action={
                <Button className="gap-2" size="sm" asChild>
                  <Link href="/nurse/queue">
                    <Plus className="w-4 h-4" /> New Triage
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="rounded-lg border bg-card p-5 space-y-3">
              <p className="font-semibold text-foreground text-base">
                {statsData?.inQueue} patient
                {(statsData?.inQueue ?? 0) !== 1 ? "s" : ""} awaiting
                assessment
              </p>
              <p className="text-sm text-muted-foreground">
                Go to the triage queue to record vitals and assess patients.
              </p>
              <Button size="sm" className="gap-2" asChild>
                <Link href="/nurse/queue">
                  <CheckCircle className="w-4 h-4" /> Go to Queue
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Ward Patients section */}
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Ward Patients</h2>

          {admissionsLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : !admissionsData || admissionsData.length === 0 ? (
            <EmptyState
              icon={<Bed className="w-full h-full" />}
              title="No ward patients"
              description="Admitted patients assigned to your ward will appear here."
            />
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {admissionsData.slice(0, 5).map((admission) => (
                <div
                  key={admission.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {admission.patient.firstName} {admission.patient.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {admission.patient.patientId}
                      {admission.bed?.room?.ward?.name
                        ? ` · ${admission.bed.room.ward.name}`
                        : ""}
                    </p>
                  </div>
                  <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
