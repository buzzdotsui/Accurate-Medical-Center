"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Calendar, TrendingUp, Bed, Activity, Clock, ShieldAlert, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CreateStaffDialog } from "@/components/admin/staff/create-staff-dialog";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  const handleStaffSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Patients Today" value="—" icon={Users} />
        <StatCard title="Appointments" value="—" icon={Calendar} />
        <StatCard title="Revenue (Today)" value="—" icon={TrendingUp} />
        <StatCard title="Bed Occupancy" value="—" icon={Bed} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="In-Patients" value="—" icon={Bed} />
        <StatCard title="Surgeries Today" value="—" icon={Activity} />
        <StatCard title="Avg Wait Time" value="—" icon={Clock} />
        <StatCard title="Active Alerts" value="—" icon={ShieldAlert} />
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

      {/* Staff creation dialog — wired to the dashboard quick actions */}
      <CreateStaffDialog
        open={staffDialogOpen}
        onOpenChange={setStaffDialogOpen}
        onSuccess={handleStaffSuccess}
      />
    </div>
  );
}
