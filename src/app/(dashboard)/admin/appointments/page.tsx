import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

const appointments = [
  { id: "APT-5041", patient: "Adaeze Nwosu", doctor: "Dr. Smith", date: "Aug 11", time: "09:00 AM", type: "Follow-up", status: "Completed" },
  { id: "APT-5042", patient: "Emeka Obi", doctor: "Dr. Musa", date: "Aug 11", time: "09:30 AM", type: "Review", status: "In Progress" },
  { id: "APT-5043", patient: "James Adeleke", doctor: "Dr. Iheaka", date: "Aug 11", time: "10:00 AM", type: "Post-Op Check", status: "Scheduled" },
  { id: "APT-5044", patient: "Ngozi Eze", doctor: "Dr. Smith", date: "Aug 11", time: "10:30 AM", type: "Consultation", status: "Scheduled" },
  { id: "APT-5045", patient: "Ibrahim Sule", doctor: "Dr. Musa", date: "Aug 11", time: "11:00 AM", type: "First Visit", status: "Checked In" },
  { id: "APT-5046", patient: "Grace Adeleke", doctor: "Dr. Chidi", date: "Aug 12", time: "09:00 AM", type: "ANC Visit", status: "Scheduled" },
];

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">All scheduled, ongoing, and completed appointments.</p>
        </div>
        <Button className="gap-2">
          <CalendarPlus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <DataTable
          columns={[
            { header: "ID", accessorKey: "id" },
            { header: "Patient", accessorKey: "patient" },
            { header: "Doctor", accessorKey: "doctor" },
            { header: "Date", accessorKey: "date" },
            { header: "Time", accessorKey: "time" },
            { header: "Type", accessorKey: "type" },
            {
              header: "Status", accessorKey: "status",
              cell: (row) => (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.status === "Completed" ? "bg-green-100 text-green-700" :
                  row.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                  row.status === "Checked In" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>{row.status}</span>
              ),
            },
          ]}
          data={appointments}
          searchable
          searchPlaceholder="Filter appointments..."
        />
      </div>
    </div>
  );
}
