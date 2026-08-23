import { StatCard } from "@/components/ui/stat-card";
import { TrendingUp, Receipt, CreditCard, TrendingDown, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function BillingDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finance &amp; Billing</h1>
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
        <StatCard title="Revenue Today" value="—" icon={TrendingUp} />
        <StatCard title="Outstanding" value="—" icon={Receipt} />
        <StatCard title="Payments Today" value="—" icon={CreditCard} />
        <StatCard title="Expenses Today" value="—" icon={TrendingDown} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">Recent Invoices</h2>
        <EmptyState
          icon={<Receipt className="w-full h-full" />}
          title="No invoices generated yet"
          description="Invoices will appear here as they are created for patient services and admissions."
          action={
            <Button className="gap-2" size="sm">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          }
        />
      </div>
    </div>
  );
}
