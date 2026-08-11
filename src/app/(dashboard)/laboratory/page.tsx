import { StatCard } from "@/components/ui/stat-card";
import { FlaskConical, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const pendingRequests = [
  { reqId: "LR-5041", patient: "Adaeze Nwosu", doctor: "Dr. Smith", test: "FBC + ESR", collected: "Yes", priority: "Routine", status: "Processing" },
  { reqId: "LR-5040", patient: "Emeka Obi", doctor: "Dr. Musa", test: "HbA1c + Glucose", collected: "Yes", priority: "Urgent", status: "Pending" },
  { reqId: "LR-5039", patient: "James Adeleke", doctor: "Dr. Iheaka", test: "Blood Culture", collected: "No", priority: "Urgent", status: "Awaiting Sample" },
  { reqId: "LR-5038", patient: "Grace Adeleke", doctor: "Dr. Chidi", test: "Malaria RDT", collected: "Yes", priority: "Routine", status: "Complete" },
];

export default function LaboratoryDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Laboratory</h1>
          <p className="text-sm text-muted-foreground mt-1">Test requests, sample tracking, and result entry.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Enter Results
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Tests" value="18" icon={Clock} trend={{ value: 2, isPositive: false }} />
        <StatCard title="Processing" value="6" icon={FlaskConical} />
        <StatCard title="Completed Today" value="44" icon={CheckCircle} trend={{ value: 9, isPositive: true }} />
        <StatCard title="Critical Values" value="2" icon={AlertCircle} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Pending Lab Requests</h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">2 Urgent</span>
        </div>
        <div className="border rounded-xl bg-card overflow-hidden">
          <DataTable
            columns={[
              { header: "Req ID", accessorKey: "reqId" },
              { header: "Patient", accessorKey: "patient" },
              { header: "Test", accessorKey: "test" },
              { header: "Doctor", accessorKey: "doctor" },
              {
                header: "Priority", accessorKey: "priority",
                cell: (row) => (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.priority === "Urgent" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }`}>{row.priority}</span>
                ),
              },
              {
                header: "Status", accessorKey: "status",
                cell: (row) => (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.status === "Complete" ? "bg-green-100 text-green-700" :
                    row.status === "Processing" ? "bg-blue-100 text-blue-700" :
                    row.status === "Awaiting Sample" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{row.status}</span>
                ),
              },
            ]}
            data={pendingRequests}
          />
        </div>
      </div>
    </div>
  );
}
