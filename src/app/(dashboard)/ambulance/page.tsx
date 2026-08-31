import { StatCard } from "@/components/ui/stat-card";
import { Truck, Radio, MapPin, Activity } from "lucide-react";

export default function AmbulanceDashboard() {
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Ambulance Services
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency dispatch and medical transport management.
          </p>
        </div>
        {/* Date/time display */}
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          <p className="text-xs text-muted-foreground">{timeLabel}</p>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 px-5 py-4">
        <h2 className="text-base font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
          Welcome, Ambulance Personnel
        </h2>
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          You are logged in as Ambulance Personnel. Your role covers emergency dispatch,
          fleet management, and medical transport coordination.
        </p>
      </div>

      {/* Info alert */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Coming soon:</strong> Ambulance dispatch, fleet management, and GPS tracking
        are planned for a future stage.
      </div>

      {/* Placeholder stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Dispatches"
          value="—"
          description="Coming soon"
          icon={Truck}
        />
        <StatCard
          title="Fleet Status"
          value="—"
          description="Coming soon"
          icon={Radio}
        />
        <StatCard
          title="Emergency Calls"
          value="—"
          description="Coming soon"
          icon={MapPin}
        />
        <StatCard
          title="Average Response"
          value="—"
          description="Coming soon"
          icon={Activity}
        />
      </div>
    </div>
  );
}
