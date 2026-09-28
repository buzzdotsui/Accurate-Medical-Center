"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CalendarCheck, Stethoscope, ClipboardList, Plus, RefreshCw, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { GreetingWithAvatar } from "@/components/layout/greeting";

interface DoctorStats {
  todayAppointments: number;
  myPatientsCount: number;
  consultationsDone: number;
  pendingPrescriptions: number;
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; image?: string | null; role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(r => r.json())
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            {user && <GreetingWithAvatar user={user} />}
            <h1 className="text-3xl font-heading font-bold text-foreground mt-1">My Dashboard</h1>
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
            <StatCard
              title="Pending Prescriptions"
              value={data?.pendingPrescriptions ?? 0}
              icon={FileText}
            />
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
