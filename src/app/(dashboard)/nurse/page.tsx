import { StatCard } from "@/components/ui/stat-card";
import { Users, Activity, Bed, Bell, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const triageQueue = [
  { token: "T-01", patient: "Mrs. Ngozi Eze", priority: "Emergency", bp: "180/110", pulse: "110", temp: "38.5°C", status: "Pending" },
  { token: "T-02", patient: "Mr. Yusuf Bello", priority: "Urgent", bp: "130/85", pulse: "88", temp: "37.2°C", status: "Pending" },
  { token: "T-03", patient: "Child Amaka Eze", priority: "Non-Urgent", bp: "90/60", pulse: "95", temp: "36.8°C", status: "Triaged" },
];

const myWardPatients = [
  { bed: "1A", name: "Emeka Obi", condition: "Diabetes", vitals: "Stable", nextMed: "09:00 AM" },
  { bed: "1B", name: "James Adeleke", condition: "Post-Op", vitals: "Monitor", nextMed: "10:00 AM" },
  { bed: "2A", name: "Fatima Aliyu", condition: "Maternity", vitals: "Stable", nextMed: "11:00 AM" },
  { bed: "2C", name: "Chukwuemeka Ike", condition: "Fever", vitals: "Improving", nextMed: "12:00 PM" },
];

export default function NurseDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Nursing Station</h1>
          <p className="text-sm text-muted-foreground mt-1">Ward B — Day Shift (07:00 – 19:00)</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            <Activity className="w-4 h-4" /> Record Vitals
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Triage
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Ward Patients" value="12" icon={Bed} />
        <StatCard title="Triage Queue" value="3" icon={Users} trend={{ value: 2, isPositive: false }} />
        <StatCard title="Vitals Due" value="6" icon={Activity} />
        <StatCard title="Pending Meds" value="9" icon={Bell} trend={{ value: 1, isPositive: false }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold">Triage Queue</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">1 Emergency</span>
          </div>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Token", accessorKey: "token" },
                { header: "Patient", accessorKey: "patient" },
                {
                  header: "Priority", accessorKey: "priority",
                  cell: (row) => (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.priority === "Emergency" ? "bg-red-100 text-red-700" :
                      row.priority === "Urgent" ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    }`}>{row.priority}</span>
                  ),
                },
                { header: "BP", accessorKey: "bp" },
                { header: "Temp", accessorKey: "temp" },
              ]}
              data={triageQueue}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Ward Patients</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Bed", accessorKey: "bed" },
                { header: "Patient", accessorKey: "name" },
                { header: "Condition", accessorKey: "condition" },
                {
                  header: "Vitals", accessorKey: "vitals",
                  cell: (row) => (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.vitals === "Monitor" ? "bg-orange-100 text-orange-700" :
                      row.vitals === "Stable" || row.vitals === "Improving" ? "bg-green-100 text-green-700" :
                      "bg-muted text-muted-foreground"
                    }`}>{row.vitals}</span>
                  ),
                },
                { header: "Next Med", accessorKey: "nextMed" },
              ]}
              data={myWardPatients}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
