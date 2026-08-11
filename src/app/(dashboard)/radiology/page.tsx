import { StatCard } from "@/components/ui/stat-card";
import { Scan, Clock, CheckCircle, FileText, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const scanRequests = [
  { reqId: "RD-1041", patient: "Ibrahim Sule", doctor: "Dr. Musa", scan: "Chest X-Ray", urgency: "Urgent", status: "Scheduled" },
  { reqId: "RD-1040", patient: "Adaeze Nwosu", doctor: "Dr. Smith", scan: "Abdominal USS", urgency: "Routine", status: "In Progress" },
  { reqId: "RD-1039", patient: "Emeka Obi", doctor: "Dr. Chidi", scan: "Brain CT Scan", urgency: "Emergency", status: "Awaiting Patient" },
  { reqId: "RD-1038", patient: "Grace Adeleke", doctor: "Dr. Iheaka", scan: "Pelvic MRI", urgency: "Routine", status: "Report Ready" },
];

export default function RadiologyDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Radiology</h1>
          <p className="text-sm text-muted-foreground mt-1">Scan requests, imaging, and reporting queue.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Scans" value="9" icon={Clock} />
        <StatCard title="In Progress" value="2" icon={Scan} />
        <StatCard title="Reports Done" value="18" icon={CheckCircle} trend={{ value: 15, isPositive: true }} />
        <StatCard title="Draft Reports" value="4" icon={FileText} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Scan Requests</h2>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">1 Emergency</span>
        </div>
        <div className="border rounded-xl bg-card overflow-hidden">
          <DataTable
            columns={[
              { header: "Req ID", accessorKey: "reqId" },
              { header: "Patient", accessorKey: "patient" },
              { header: "Scan", accessorKey: "scan" },
              { header: "Referring Doctor", accessorKey: "doctor" },
              {
                header: "Urgency", accessorKey: "urgency",
                cell: (row) => (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.urgency === "Emergency" ? "bg-red-100 text-red-700" :
                    row.urgency === "Urgent" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{row.urgency}</span>
                ),
              },
              {
                header: "Status", accessorKey: "status",
                cell: (row) => (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.status === "Report Ready" ? "bg-green-100 text-green-700" :
                    row.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                    row.status === "Awaiting Patient" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{row.status}</span>
                ),
              },
            ]}
            data={scanRequests}
          />
        </div>
      </div>
    </div>
  );
}
