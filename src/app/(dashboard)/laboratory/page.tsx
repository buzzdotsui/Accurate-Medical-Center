import { StatCard } from "@/components/ui/stat-card";
import { FlaskConical, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function LaboratoryDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Laboratory</h1>
          <p className="text-sm text-muted-foreground mt-1">Test requests, sample tracking, and result entry.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Enter Results
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Tests" value="—" icon={Clock} />
        <StatCard title="Processing" value="—" icon={FlaskConical} />
        <StatCard title="Completed Today" value="—" icon={CheckCircle} />
        <StatCard title="Critical Values" value="—" icon={AlertCircle} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">Pending Lab Requests</h2>
        <EmptyState
          icon={<FlaskConical className="w-full h-full" />}
          title="No pending lab requests"
          description="Lab requests sent by doctors will appear here for sample collection and processing."
        />
      </div>
    </div>
  );
}
