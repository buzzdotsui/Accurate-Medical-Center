import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function PharmacyInventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pharmacy stock, track expiry dates, and set alerts.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Items" value="—" />
        <StatCard title="Low Stock Alerts" value="—" />
        <StatCard title="Out of Stock" value="—" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Stock List</h2>
        <EmptyState
          icon={<Package className="w-full h-full" />}
          title="Inventory is empty"
          description="Add items to the pharmacy inventory to begin tracking stock levels, expiry dates, and dispensing."
          action={
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add First Item
            </Button>
          }
        />
      </div>
    </div>
  );
}
