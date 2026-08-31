"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, TrendingUp, Bed, Activity, FlaskConical, Radiation, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { CreateStaffDialog } from "@/components/admin/staff/create-staff-dialog";

interface DashboardMetrics {
  totalPatients: number;
  totalRevenue: number;
  activeAdmissions: number;
  pendingConsultations: number;
  bedOccupancyRate: number | null;
  occupiedBeds: number;
  totalBeds: number;
  lowStockCount: number;
  pendingLabRequests: number;
  pendingRadiologyRequests: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ["admin_dashboard_metrics"],
    queryFn: async () => {
      const res = await fetch("/api/v1/reporting/dashboard");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load dashboard metrics");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000, // 1 minute
  });

  const handleStaffSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin_dashboard_metrics"] });
    queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
  }, [queryClient]);

  const metrics = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Hospital Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time metrics for Accurate Medical Center.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 bg-background"
            onClick={() => router.push("/analytics/reports")}
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </Button>
          <Button className="gap-2" onClick={() => setStaffDialogOpen(true)}>
            <Users className="w-4 h-4" /> Add Staff
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState
          title="Failed to load dashboard metrics"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Primary KPI row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))
            ) : (
              <>
                <StatCard
                  title="Total Patients"
                  value={metrics?.totalPatients ?? 0}
                  icon={Users}
                />
                <StatCard
                  title="Scheduled Appts"
                  value={metrics?.pendingConsultations ?? 0}
                  icon={Calendar}
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(metrics?.totalRevenue ?? 0)}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Bed Occupancy"
                  value={
                    metrics?.bedOccupancyRate != null
                      ? `${metrics.bedOccupancyRate}%`
                      : metrics?.totalBeds === 0
                      ? "No beds"
                      : "0%"
                  }
                  icon={Bed}
                />
              </>
            )}
          </div>

          {/* Secondary operational row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))
            ) : (
              <>
                <StatCard
                  title="Active Admissions"
                  value={metrics?.activeAdmissions ?? 0}
                  icon={Bed}
                />
                <StatCard
                  title="Pending Lab"
                  value={metrics?.pendingLabRequests ?? 0}
                  icon={FlaskConical}
                />
                <StatCard
                  title="Pending Radiology"
                  value={metrics?.pendingRadiologyRequests ?? 0}
                  icon={Radiation}
                />
                <StatCard
                  title="Low Stock Items"
                  value={metrics?.lowStockCount ?? 0}
                  icon={Activity}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">Recent Admissions</h2>
              <EmptyState
                icon={<Bed className="w-full h-full" />}
                title="No recent admissions"
                description="Admitted patients will appear here as they are registered in the system."
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-heading font-semibold">Staff on Duty</h2>
              <EmptyState
                icon={<Users className="w-full h-full" />}
                title="No staff on duty"
                description="Staff shift assignments will appear here once staff members are added to the system."
                action={
                  <Button size="sm" className="gap-2" onClick={() => setStaffDialogOpen(true)}>
                    <Users className="w-4 h-4" /> Add Staff Member
                  </Button>
                }
              />
            </div>
          </div>
        </>
      )}

      {/* Staff creation dialog — wired to dashboard quick actions */}
      <CreateStaffDialog
        open={staffDialogOpen}
        onOpenChange={setStaffDialogOpen}
        onSuccess={handleStaffSuccess}
      />
    </div>
  );
}
