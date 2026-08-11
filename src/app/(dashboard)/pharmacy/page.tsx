import { StatCard } from "@/components/ui/stat-card";
import { Pill, Package, Clock, AlertTriangle, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const pendingPrescriptions = [
  { rxId: "RX-2841", patient: "Adaeze Nwosu", doctor: "Dr. Smith", drug: "Amlodipine 5mg", qty: "30 tabs", issued: "09:15 AM", status: "Pending" },
  { rxId: "RX-2840", patient: "Emeka Obi", doctor: "Dr. Musa", drug: "Metformin 500mg", qty: "60 tabs", issued: "08:40 AM", status: "Pending" },
  { rxId: "RX-2839", patient: "Grace Adeleke", doctor: "Dr. Chidi", drug: "Folic Acid 5mg", qty: "90 tabs", issued: "08:00 AM", status: "Dispensed" },
];

const lowStockItems = [
  { drug: "Amoxicillin 500mg", brand: "GSK", stock: 24, reorderLevel: 50, status: "Low" },
  { drug: "Ciprofloxacin 500mg", brand: "Pfizer", stock: 8, reorderLevel: 30, status: "Critical" },
  { drug: "Paracetamol 500mg", brand: "Emzor", stock: 200, reorderLevel: 100, status: "OK" },
  { drug: "Diazepam 5mg", brand: "Roche", stock: 0, reorderLevel: 20, status: "Out of Stock" },
];

export default function PharmacyDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy</h1>
          <p className="text-sm text-muted-foreground mt-1">Dispensing counter — today's prescriptions and stock overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            <Package className="w-4 h-4" /> Stock Report
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Receive Stock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Rx" value="14" icon={Clock} trend={{ value: 3, isPositive: false }} />
        <StatCard title="Dispensed Today" value="82" icon={Pill} trend={{ value: 6, isPositive: true }} />
        <StatCard title="Low Stock Items" value="7" icon={AlertTriangle} />
        <StatCard title="Revenue (Today)" value="₦215,400" icon={Package} trend={{ value: 4, isPositive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold">Pending Prescriptions</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">14 pending</span>
          </div>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Rx ID", accessorKey: "rxId" },
                { header: "Patient", accessorKey: "patient" },
                { header: "Drug", accessorKey: "drug" },
                { header: "Qty", accessorKey: "qty" },
                {
                  header: "Status", accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                    }`}>{row.status}</span>
                  ),
                },
              ]}
              data={pendingPrescriptions}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Stock Alerts</h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable
              columns={[
                { header: "Drug", accessorKey: "drug" },
                { header: "Brand", accessorKey: "brand" },
                { header: "In Stock", accessorKey: "stock" },
                {
                  header: "Status", accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "Out of Stock" ? "bg-red-100 text-red-700" :
                      row.status === "Critical" ? "bg-orange-100 text-orange-700" :
                      row.status === "Low" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>{row.status}</span>
                  ),
                },
              ]}
              data={lowStockItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
