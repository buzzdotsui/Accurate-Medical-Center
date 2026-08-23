import { StatCard } from "@/components/ui/stat-card";
import { Scan, Clock, CheckCircle, FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function RadiologyDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Radiology</h1>
          <p className="text-sm text-muted-foreground mt-1">Scan requests, imaging, and reporting queue.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Scans" value="—" icon={Clock} />
        <StatCard title="In Progress" value="—" icon={Scan} />
        <StatCard title="Reports Done" value="—" icon={CheckCircle} />
        <StatCard title="Draft Reports" value="—" icon={FileText} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">Scan Requests</h2>
        <EmptyState
          icon={<Scan className="w-full h-full" />}
          title="No pending scan requests"
          description="Radiology requests sent by doctors will appear here for imaging and reporting."
        />
      </div>
    </div>
  );
}
