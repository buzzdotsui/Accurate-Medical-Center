"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, TrendingUp, Bed, Activity, FlaskConical } from "lucide-react";
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

interface AdmissionRow {
  id: string;
  admissionId: string;
  admittedAt: string;
  reason: string;
  status: string;
  patient: { firstName: string; lastName: string; patientId: string };
  bed?: { room?: { ward?: { name?: string } } } | null;
}

interface StaffRow {
  id: string;
  staffId: string;
  isActive: boolean;
  department?: { name?: string } | null;
  user: { name: string; role: string; email?: string };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function RecentAdmissionsPanel() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<AdmissionRow[]>({
    queryKey: ["admin_recent_admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/admissions?take=8");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load admissions");
      }
      const json = await res.json();
      return json.data as AdmissionRow[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold">Recent Admissions</h2>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>
      {error ? (
        <ErrorState
          title="Failed to load admissions"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Bed className="w-full h-full" />}
          title="No recent admissions"
          description="Admitted patients will appear here as they are registered in the system."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Patient</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ward</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Admitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.slice(0, 6).map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">
                    {a.patient.firstName} {a.patient.lastName}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                    {a.patient.patientId}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {a.bed?.room?.ward?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {new Date(a.admittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StaffOnDutyPanel({ onAddStaff }: { onAddStaff: () => void }) {
  const { data, isLoading, error, refetch } = useQuery<StaffRow[]>({
    queryKey: ["admin_staff_on_duty"],
    queryFn: async () => {
      const res = await fetch("/api/v1/hr/staff");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load staff");
      }
      const json = await res.json();
      return json.data as StaffRow[];
    },
    staleTime: 60_000,
  });

  const activeStaff = (data ?? []).filter((s) => s.isActive);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold">Active Staff</h2>
        <Button size="sm" className="gap-2" onClick={onAddStaff}>
          <Users className="w-4 h-4" /> Add Staff
        </Button>
      </div>
      {error ? (
        <ErrorState
          title="Failed to load staff"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : activeStaff.length === 0 ? (
        <EmptyState
          icon={<Users className="w-full h-full" />}
          title="No active staff"
          description="Active staff members will appear here once they are added to the system."
          action={
            <Button size="sm" className="gap-2" onClick={onAddStaff}>
              <Users className="w-4 h-4" /> Add Staff Member
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {activeStaff.slice(0, 6).map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.department?.name ?? "No department"} · {s.user.role.replace(/_/g, " ")}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{s.staffId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
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
                  title="Low Stock Items"
                  value={metrics?.lowStockCount ?? 0}
                  icon={Activity}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentAdmissionsPanel />
            <StaffOnDutyPanel onAddStaff={() => setStaffDialogOpen(true)} />
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
