import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCog, Search } from "lucide-react";

const staff = [
  { id: "S-001", name: "Dr. Sarah Smith", role: "Doctor", dept: "General Medicine", phone: "0801 111 2222", status: "On Duty", since: "Jan 2021" },
  { id: "S-002", name: "Dr. Ahmed Musa", role: "Doctor", dept: "ICU", phone: "0802 222 3333", status: "On Duty", since: "Mar 2019" },
  { id: "S-003", name: "Dr. Chidi Nwokolo", role: "Doctor", dept: "Maternity", phone: "0803 333 4444", status: "Off Duty", since: "Jun 2020" },
  { id: "S-004", name: "Nurse Blessing Okoro", role: "Nurse", dept: "Ward B", phone: "0804 444 5555", status: "On Break", since: "Sep 2022" },
  { id: "S-005", name: "Mr. Tunde Badmus", role: "Pharmacist", dept: "Pharmacy", phone: "0805 555 6666", status: "On Duty", since: "Feb 2023" },
  { id: "S-006", name: "Mrs. Ify Okonkwo", role: "Lab Scientist", dept: "Laboratory", phone: "0806 666 7777", status: "On Duty", since: "Aug 2021" },
  { id: "S-007", name: "Mr. Emeka Osei", role: "Radiographer", dept: "Radiology", phone: "0807 777 8888", status: "On Duty", since: "Nov 2020" },
];

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all clinical and administrative staff members.</p>
        </div>
        <Button className="gap-2">
          <UserCog className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search staff by name, role, or dept..." className="pl-9" />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <DataTable
          columns={[
            { header: "ID", accessorKey: "id" },
            { header: "Name", accessorKey: "name" },
            { header: "Role", accessorKey: "role" },
            { header: "Department", accessorKey: "dept" },
            { header: "Phone", accessorKey: "phone" },
            { header: "Since", accessorKey: "since" },
            {
              header: "Status", accessorKey: "status",
              cell: (row) => (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.status === "On Duty" ? "bg-green-100 text-green-700" :
                  row.status === "On Break" ? "bg-yellow-100 text-yellow-700" :
                  "bg-muted text-muted-foreground"
                }`}>{row.status}</span>
              ),
            },
          ]}
          data={staff}
          searchable
          searchPlaceholder="Filter staff..."
        />
      </div>
    </div>
  );
}
