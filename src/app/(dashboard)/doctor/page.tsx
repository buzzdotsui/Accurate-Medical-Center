import { StatCard } from "@/components/ui/stat-card";
import { Users, CalendarCheck, Stethoscope, ClipboardList, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const myPatients = [
  { id: "P-10421", name: "Adaeze Nwosu", age: 34, diagnosis: "Hypertension", lastVisit: "Aug 10", status: "Follow-up" },
  { id: "P-10422", name: "Emeka Obi", age: 52, diagnosis: "Type 2 Diabetes", lastVisit: "Aug 8", status: "Admitted" },
  { id: "P-10319", name: "Grace Adeleke", age: 28, diagnosis: "Anaemia", lastVisit: "Aug 5", status: "Stable" },
  { id: "P-10301", name: "Ibrahim Sule", age: 61, diagnosis: "CHF", lastVisit: "Aug 3", status: "Admitted" },
];

const todayAppointments = [
  { time: "09:00 AM", patient: "Adaeze Nwosu", type: "Follow-up", room: "Room 3" },
  { time: "10:30 AM", patient: "Bassey Etim", type: "Consultation", room: "Room 3" },
  { time: "12:00 PM", patient: "Chisom Ike", type: "Review", room: "Room 3" },
  { time: "02:00 PM", patient: "David Okafor", type: "First Visit", room: "Room 3" },
];

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Good morning, Dr. Chidi. You have 8 appointments today.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Consultation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Patients" value="38" icon={Users} trend={{ value: 3, isPositive: true }} />
        <StatCard title="Today's Appts" value="8" icon={CalendarCheck} />
        <StatCard title="Pending Lab Results" value="5" icon={ClipboardList} />
        <StatCard title="Consultations Done" value="3" icon={Stethoscope} trend={{ value: 10, isPositive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Today's Appointments</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Time", accessorKey: "time" },
                { header: "Patient", accessorKey: "patient" },
                { header: "Type", accessorKey: "type" },
                { header: "Room", accessorKey: "room" },
              ]}
              data={todayAppointments}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">My Patients</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "ID", accessorKey: "id" },
                { header: "Name", accessorKey: "name" },
                { header: "Diagnosis", accessorKey: "diagnosis" },
                {
                  header: "Status", accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "Admitted" ? "bg-red-100 text-red-700" :
                      row.status === "Stable" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{row.status}</span>
                  ),
                },
              ]}
              data={myPatients}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
