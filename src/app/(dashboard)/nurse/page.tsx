import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, Bed, Bell, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NurseDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Nursing Station</h1>
          <p className="text-sm text-muted-foreground mt-1">Triage queue, ward patients, and pending tasks.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            <Activity className="w-4 h-4" /> Record Vitals
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Triage
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Ward Patients" value="—" icon={Bed} />
        <StatCard title="Triage Queue" value="—" icon={Users} />
        <StatCard title="Vitals Due" value="—" icon={Activity} />
        <StatCard title="Pending Meds" value="—" icon={Bell} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Triage Queue</h2>
          <EmptyState
            icon={<Users className="w-full h-full" />}
            title="Triage queue is empty"
            description="Patients waiting for triage assessment will appear here."
            action={
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" /> New Triage
              </Button>
            }
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Ward Patients</h2>
          <EmptyState
            icon={<Bed className="w-full h-full" />}
            title="No ward patients"
            description="Admitted patients assigned to your ward will appear here."
          />
        </div>
      </div>
    </div>
  );
}
