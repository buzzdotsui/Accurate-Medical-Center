import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

const inventoryItems = [
  { id: "INV-001", name: "Paracetamol 500mg", category: "Analgesics", stock: 1500, minLevel: 200, unit: "Tablets", status: "In Stock" },
  { id: "INV-002", name: "Amoxicillin 250mg", category: "Antibiotics", stock: 45, minLevel: 100, unit: "Capsules", status: "Low Stock" },
  { id: "INV-003", name: "Ibuprofen 400mg", category: "Analgesics", stock: 800, minLevel: 150, unit: "Tablets", status: "In Stock" },
  { id: "INV-004", name: "Ceftriaxone 1g", category: "Antibiotics", stock: 0, minLevel: 50, unit: "Vials", status: "Out of Stock" },
  { id: "INV-005", name: "Saline Solution 500ml", category: "Fluids", stock: 120, minLevel: 50, unit: "Bags", status: "In Stock" },
];

export default function PharmacyInventoryPage() {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Item Name" },
    { key: "category", header: "Category" },
    { key: "stock", header: "Current Stock", cell: (row: any) => `${row.stock} ${row.unit}` },
    { key: "minLevel", header: "Min Level" },
    { 
      key: "status", 
      header: "Status",
      cell: (row: any) => {
        const bg = row.status === 'In Stock' ? 'bg-green-100 text-green-700' : 
                   row.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg}`}>{row.status}</span>;
      }
    }
  ];

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
        <StatCard title="Total Items" value="4,231" description="+12 this month" />
        <StatCard title="Low Stock Alerts" value="18" description="Needs attention" />
        <StatCard title="Out of Stock" value="3" description="Restock required" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Stock List</h2>
        <DataTable columns={columns} data={inventoryItems} searchable />
      </div>
    </div>
  );
}
