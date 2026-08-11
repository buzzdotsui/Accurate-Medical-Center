import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

const patients = [
  { id: "P-10421", name: "Adaeze Nwosu", age: 34, gender: "F", phone: "0801 234 5678", lastVisit: "Aug 11", doctor: "Dr. Smith", status: "Active" },
  { id: "P-10422", name: "Emeka Obi", age: 52, gender: "M", phone: "0802 345 6789", lastVisit: "Aug 11", doctor: "Dr. Musa", status: "Admitted" },
  { id: "P-10419", name: "Fatima Aliyu", age: 28, gender: "F", phone: "0803 456 7890", lastVisit: "Aug 10", doctor: "Dr. Chidi", status: "Active" },
  { id: "P-10415", name: "James Adeleke", age: 61, gender: "M", phone: "0804 567 8901", lastVisit: "Aug 10", doctor: "Dr. Iheaka", status: "Admitted" },
  { id: "P-10312", name: "Ngozi Eze", age: 44, gender: "F", phone: "0805 678 9012", lastVisit: "Aug 8", doctor: "Dr. Smith", status: "Active" },
  { id: "P-10290", name: "Ibrahim Sule", age: 61, gender: "M", phone: "0806 789 0123", lastVisit: "Aug 5", doctor: "Dr. Musa", status: "Active" },
  { id: "P-10210", name: "Grace Adeleke", age: 22, gender: "F", phone: "0807 890 1234", lastVisit: "Aug 3", doctor: "Dr. Chidi", status: "Discharged" },
];

export default function AdminPatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse, search, and manage all registered patients.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Register Patient
        </Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or phone..." className="pl-9" />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <DataTable
          columns={[
            { header: "ID", accessorKey: "id" },
            { header: "Name", accessorKey: "name" },
            { header: "Age", accessorKey: "age" },
            { header: "Gender", accessorKey: "gender" },
            { header: "Phone", accessorKey: "phone" },
            { header: "Last Visit", accessorKey: "lastVisit" },
            { header: "Assigned Doctor", accessorKey: "doctor" },
            {
              header: "Status", accessorKey: "status",
              cell: (row) => (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.status === "Admitted" ? "bg-red-100 text-red-700" :
                  row.status === "Active" ? "bg-green-100 text-green-700" :
                  "bg-muted text-muted-foreground"
                }`}>{row.status}</span>
              ),
            },
          ]}
          data={patients}
          searchable
          searchPlaceholder="Filter patients..."
        />
      </div>
    </div>
  );
}
