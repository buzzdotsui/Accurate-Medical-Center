import { StatCard } from "@/components/ui/stat-card";
import { Users, CalendarCheck, Stethoscope, ClipboardList, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your patients, appointments, and pending tasks for today.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Consultation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Patients" value="—" icon={Users} />
        <StatCard title="Today's Appts" value="—" icon={CalendarCheck} />
        <StatCard title="Pending Lab Results" value="—" icon={ClipboardList} />
        <StatCard title="Consultations Done" value="—" icon={Stethoscope} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Today&apos;s Appointments</h2>
          <EmptyState
            icon={<CalendarCheck className="w-full h-full" />}
            title="No appointments today"
            description="Your scheduled appointments for today will appear here."
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">My Patients</h2>
          <EmptyState
            icon={<Users className="w-full h-full" />}
            title="No patients assigned"
            description="Patients assigned to you will appear here once they have been registered and linked to your profile."
          />
        </div>
      </div>
    </div>
  );
}
