import { StatCard } from "@/components/ui/stat-card";
import { Pill, Package, Clock, AlertTriangle, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function PharmacyDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy</h1>
          <p className="text-sm text-muted-foreground mt-1">Dispensing counter — today&apos;s prescriptions and stock overview.</p>
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
        <StatCard title="Pending Rx" value="—" icon={Clock} />
        <StatCard title="Dispensed Today" value="—" icon={Pill} />
        <StatCard title="Low Stock Items" value="—" icon={AlertTriangle} />
        <StatCard title="Revenue (Today)" value="—" icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Pending Prescriptions</h2>
          <EmptyState
            icon={<Pill className="w-full h-full" />}
            title="No pending prescriptions"
            description="Prescriptions awaiting dispensing will appear here as doctors issue them."
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Stock Alerts</h2>
          <EmptyState
            icon={<AlertTriangle className="w-full h-full" />}
            title="No stock alerts"
            description="Medicines with low or critical stock levels will appear here. Add inventory to begin tracking."
            action={
              <Button variant="outline" size="sm" className="gap-2 bg-background">
                <Plus className="w-4 h-4" /> Receive Stock
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
