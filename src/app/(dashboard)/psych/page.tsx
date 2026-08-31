import { StatCard } from "@/components/ui/stat-card";
import { Brain, Users, LineChart, Heart } from "lucide-react";

export default function PsychDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Mental Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Psychological therapy and addiction recovery management.
        </p>
      </div>

      {/* Welcome banner */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30 px-5 py-4">
        <h2 className="text-base font-semibold text-violet-900 dark:text-violet-200 mb-1">
          Welcome, Mental Health Specialist
        </h2>
        <p className="text-sm text-violet-800 dark:text-violet-300">
          You are logged in as a Mental Health Specialist. Your role covers psychological
          assessment recording, therapy session tracking, and patient recovery monitoring.
        </p>
      </div>

      {/* Info alert */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Coming soon:</strong> Psychological assessment recording, therapy session tracking,
        and recovery monitoring are planned for a future stage.
      </div>

      {/* Placeholder stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Assessments"
          value="—"
          description="Coming soon"
          icon={Brain}
        />
        <StatCard
          title="Therapy Sessions"
          value="—"
          description="Coming soon"
          icon={Users}
        />
        <StatCard
          title="Patient Referrals"
          value="—"
          description="Coming soon"
          icon={LineChart}
        />
        <StatCard
          title="Recovery Tracking"
          value="—"
          description="Coming soon"
          icon={Heart}
        />
      </div>

      {/* Contact Admin section */}
      <div className="rounded-lg border bg-card px-5 py-5 space-y-2">
        <h2 className="text-base font-heading font-semibold">Need Patient Records or Appointments?</h2>
        <p className="text-sm text-muted-foreground">
          If you need access to patient records, appointments, or other clinical data, please
          contact your branch administrator. They can assign the appropriate permissions or
          provide a workaround until the mental health module is fully deployed.
        </p>
        <p className="text-sm text-muted-foreground">
          Contact the administrator via the hospital&apos;s internal communication system or
          visit the administration office.
        </p>
      </div>
    </div>
  );
}
