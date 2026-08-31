"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FlaskConical, Receipt, RefreshCw } from "lucide-react";

interface PatientDashboardData {
  appointmentCount: number;
  labRequestCount: number;
  prescriptionCount: number;
  pendingInvoiceTotal: number;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PatientDashboard() {
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
      title: "Lab Results",
      value: isLoading ? null : (data?.labRequestCount ?? 0).toString(),
      icon: FlaskConical,
    },
    {
      title: "Prescriptions",
      value: isLoading ? null : (data?.prescriptionCount ?? 0).toString(),
      icon: FileText,
    },
    {
      title: "Pending Bills",
      value: isLoading ? null : formatNaira(data?.pendingInvoiceTotal ?? 0),
      icon: Receipt,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Patient Portal</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to Accurate Medical Center. View your records and appointments here.
          </p>
        </div>
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
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
