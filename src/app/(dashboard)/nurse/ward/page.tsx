import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";

const wardPatients = [
  { id: "WP-101", patient: "Chinedu Eze", room: "Male Ward - Bed 3", diagnosis: "Malaria", admittedDate: "Aug 09", doctor: "Dr. Smith", status: "Stable" },
  { id: "WP-102", patient: "Amina Yusuf", room: "Female Ward - Bed 1", diagnosis: "Typhoid Fever", admittedDate: "Aug 10", doctor: "Dr. Musa", status: "Improving" },
  { id: "WP-103", patient: "David Ojo", room: "Pediatrics - Bed 4", diagnosis: "Asthma", admittedDate: "Aug 11", doctor: "Dr. Iheaka", status: "Critical" },
  { id: "WP-104", patient: "Grace Adeleke", room: "Maternity - Bed 2", diagnosis: "Post-partum", admittedDate: "Aug 11", doctor: "Dr. Chidi", status: "Stable" },
];

export default function NurseWardPage() {
  const columns = [
    { key: "id", header: "ID" },
    { key: "patient", header: "Patient Name" },
    { key: "room", header: "Room / Bed" },
    { key: "diagnosis", header: "Diagnosis" },
    { key: "admittedDate", header: "Admitted On" },
    { key: "doctor", header: "Attending Doctor" },
    { 
      key: "status", 
      header: "Status",
      cell: (row: any) => {
        const bg = row.status === 'Stable' ? 'bg-green-100 text-green-700' : 
                   row.status === 'Improving' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg}`}>{row.status}</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Ward Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all admitted patients and bed occupancy.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Beds" value="120" />
        <StatCard title="Occupied" value="84" description="70% capacity" />
        <StatCard title="Available" value="36" description="30% capacity" />
        <StatCard title="Critical Patients" value="4" description="Needs close monitoring" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Admitted Patients</h2>
        <DataTable columns={columns} data={wardPatients} searchable />
      </div>
    </div>
  );
}
