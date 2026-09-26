"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/ui/greeting";
import type { User } from "better-auth";

interface PatientDashboardData {
  appointmentCount: number;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface PatientDashboardProps {
  user?: User;
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const { data, isLoading, error, refetch, isFetching } = useQuery<PatientDashboardData>({
    queryKey: ["patient_self_dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/v1/patients/self/dashboard");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load your dashboard data");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
  });

  const stats = [
    {
      title: "Appointments",
      value: isLoading ? null : (data?.appointmentCount ?? 0).toString(),
      icon: Calendar,
    },
    {
      title: "Medical Records",
      value: isLoading ? null : "—",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        title="My Patient Portal"
        description="Welcome to Accurate Medical Center. View your records and appointments here."
      >
        {error && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </Button>
        )}
      </DashboardHeader>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <Skeleton className="h-8 w-20 rounded" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
