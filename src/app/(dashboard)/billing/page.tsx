import { StatCard } from "@/components/ui/stat-card";
import { TrendingUp, Receipt, CreditCard, TrendingDown, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const recentInvoices = [
  { invId: "INV-8041", patient: "Adaeze Nwosu", service: "Consultation + Labs", amount: "₦35,000", date: "Aug 11", status: "Paid" },
  { invId: "INV-8040", patient: "Emeka Obi", service: "Admission (3 days)", amount: "₦180,000", date: "Aug 10", status: "Pending" },
  { invId: "INV-8039", patient: "James Adeleke", service: "Surgery + Anaesthesia", amount: "₦450,000", date: "Aug 10", status: "Part-Paid" },
  { invId: "INV-8038", patient: "Grace Adeleke", service: "Pharmacy + Consultation", amount: "₦28,500", date: "Aug 9", status: "Paid" },
];

export default function BillingDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finance & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Invoices, payments, and financial overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background">
            <TrendingUp className="w-4 h-4" /> Financial Report
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue Today" value="₦840,500" icon={TrendingUp} trend={{ value: 8, isPositive: true }} />
        <StatCard title="Outstanding" value="₦1.2M" icon={Receipt} trend={{ value: 3, isPositive: false }} />
        <StatCard title="Payments Today" value="32" icon={CreditCard} trend={{ value: 5, isPositive: true }} />
        <StatCard title="Expenses Today" value="₦125,000" icon={TrendingDown} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Recent Invoices</h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">2 Pending</span>
        </div>
        <div className="border rounded-xl bg-card overflow-hidden">
          <DataTable
            columns={[
              { header: "Invoice ID", accessorKey: "invId" },
              { header: "Patient", accessorKey: "patient" },
              { header: "Service", accessorKey: "service" },
              { header: "Amount", accessorKey: "amount" },
              { header: "Date", accessorKey: "date" },
              {
                header: "Status", accessorKey: "status",
                cell: (row) => (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.status === "Paid" ? "bg-green-100 text-green-700" :
                    row.status === "Part-Paid" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{row.status}</span>
                ),
              },
            ]}
            data={recentInvoices}
          />
        </div>
      </div>
    </div>
  );
}
