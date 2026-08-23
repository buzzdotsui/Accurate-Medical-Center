import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Bed } from "lucide-react";

export default function NurseWardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Ward Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all admitted patients and bed occupancy.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Beds" value="—" />
        <StatCard title="Occupied" value="—" />
        <StatCard title="Available" value="—" />
        <StatCard title="Critical Patients" value="—" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Admitted Patients</h2>
        <EmptyState
          icon={<Bed className="w-full h-full" />}
          title="No admitted patients"
          description="Patients admitted to the ward will appear here with their bed assignments, diagnoses, and status."
        />
      </div>
    </div>
  );
}
