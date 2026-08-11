import { StatCard } from "@/components/ui/stat-card";
import { Users, Calendar, TrendingUp, Bed, Activity, Clock, ShieldAlert, BarChart3 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const recentAdmissions = [
  { id: "P-10421", name: "Adaeze Nwosu", ward: "General", admitDate: "Aug 11", doctor: "Dr. Smith", status: "Stable" },
  { id: "P-10422", name: "Emeka Obi", ward: "ICU", admitDate: "Aug 11", doctor: "Dr. Musa", status: "Critical" },
  { id: "P-10419", name: "Fatima Aliyu", ward: "Maternity", admitDate: "Aug 10", doctor: "Dr. Chidi", status: "Stable" },
  { id: "P-10415", name: "James Adeleke", ward: "Surgical", admitDate: "Aug 10", doctor: "Dr. Iheaka", status: "Post-Op" },
];

const staffOnDuty = [
  { name: "Dr. Sarah Smith", dept: "General Medicine", shift: "07:00 - 19:00", status: "On Duty" },
  { name: "Dr. Ahmed Musa", dept: "ICU", shift: "07:00 - 19:00", status: "On Duty" },
  { name: "Nurse Blessing Okoro", dept: "Ward B", shift: "07:00 - 15:00", status: "On Break" },
  { name: "Dr. Chidi Nwokolo", dept: "Maternity", shift: "19:00 - 07:00", status: "Off Duty" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Hospital Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time metrics for Accurate Medical Center — Mon, Aug 11</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            <BarChart3 className="w-4 h-4" /> Reports
          </Button>
          <Button className="gap-2">
            <Users className="w-4 h-4" /> Add Staff
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Patients Today" value="142" icon={Users} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Appointments" value="84" icon={Calendar} trend={{ value: 4, isPositive: false }} />
        <StatCard title="Revenue (Today)" value="₦840,500" icon={TrendingUp} trend={{ value: 8, isPositive: true }} />
        <StatCard title="Bed Occupancy" value="82%" icon={Bed} trend={{ value: 2, isPositive: true }} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="In-Patients" value="74" icon={Bed} />
        <StatCard title="Surgeries Today" value="6" icon={Activity} />
        <StatCard title="Avg Wait Time" value="22 min" icon={Clock} trend={{ value: 5, isPositive: false }} />
        <StatCard title="Active Alerts" value="3" icon={ShieldAlert} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Recent Admissions</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "ID", accessorKey: "id" },
                { header: "Patient", accessorKey: "name" },
                { header: "Ward", accessorKey: "ward" },
                { header: "Doctor", accessorKey: "doctor" },
                {
                  header: "Status", accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "Critical" ? "bg-red-100 text-red-700" :
                      row.status === "Stable" ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{row.status}</span>
                  ),
                },
              ]}
              data={recentAdmissions}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Staff on Duty</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Name", accessorKey: "name" },
                { header: "Department", accessorKey: "dept" },
                { header: "Shift", accessorKey: "shift" },
                {
                  header: "Status", accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "On Duty" ? "bg-green-100 text-green-700" :
                      row.status === "On Break" ? "bg-yellow-100 text-yellow-700" :
                      "bg-muted text-muted-foreground"
                    }`}>{row.status}</span>
                  ),
                },
              ]}
              data={staffOnDuty}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
