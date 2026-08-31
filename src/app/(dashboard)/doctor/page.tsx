"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CalendarCheck, Stethoscope, ClipboardList, Plus, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface DoctorStats {
  todayAppointments: number;
  myPatientsCount: number;
  consultationsDone: number;
}

interface LabRequest {
  id: string;
  status: string;
}

export default function DoctorDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<DoctorStats>({
    queryKey: ["doctor_dashboard_stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/appointments/stats");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load dashboard statistics");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const { data: labData, isLoading: labLoading } = useQuery<LabRequest[]>({
    queryKey: ["doctor_lab_requests_count"],
    queryFn: async () => {
      const res = await fetch("/api/v1/laboratory/requests?take=100");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load lab requests");
      }
      const json = await res.json();
      // The lab requests route returns ok(requests) — data is the array directly
      return Array.isArray(json.data) ? json.data : [];
    },
    staleTime: 60_000,
  });

  const pendingLabCount = labData
    ? labData.filter((r) => r.status !== "COMPLETED").length
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your patients, appointments, and pending tasks for today.
          </p>
        </div>
        <div className="flex gap-3">
          {error && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          )}
          <Button className="gap-2" asChild>
            <Link href="/doctor/queue">
              <Plus className="w-4 h-4" /> View Queue
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
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
              title="My Patients"
              value={data?.myPatientsCount ?? 0}
              icon={Users}
            />
            <StatCard
              title="Today&apos;s Appts"
              value={data?.todayAppointments ?? 0}
              icon={CalendarCheck}
            />
            {labLoading ? (
              <Skeleton className="h-28 w-full rounded-xl" />
            ) : (
              <StatCard
                title="Pending Lab Results"
                value={pendingLabCount ?? 0}
                icon={ClipboardList}
              />
            )}
            <StatCard
              title="Consultations Done"
              value={data?.consultationsDone ?? 0}
              icon={Stethoscope}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Today&apos;s Appointments</h2>
          <EmptyState
            icon={<CalendarCheck className="w-full h-full" />}
            title="No appointments today"
            description="Your scheduled appointments for today will appear here."
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">My Patients</h2>
          <EmptyState
            icon={<Users className="w-full h-full" />}
            title="No patients assigned"
            description="Patients assigned to you will appear here once they have been registered and linked to your profile."
          />
        </div>
      </div>
    </div>
  );
}
