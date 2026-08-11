import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingDown, ArrowRight, PackageOpen, Boxes } from "lucide-react";
import Link from "next/link";

export default function InventoryDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory & Supply</h1>
          <p className="text-muted-foreground mt-1">Manage pharmacy stock, consumables, and supplier orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/inventory/items">
              <Boxes className="w-4 h-4 mr-2" />
              Manage Catalog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Package className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">845</div>
            <p className="text-xs text-muted-foreground mt-1">Active items in catalog</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <div className="p-2 bg-warning/10 rounded-full">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">14</div>
            <p className="text-xs text-muted-foreground mt-1">Below reorder threshold</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-full">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">8</div>
            <p className="text-xs text-muted-foreground mt-1">Expiring within 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <PackageOpen className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">3</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting delivery</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Critical Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "MED-104", name: "Paracetamol 500mg (Tablet)", stock: 5, reorder: 50 },
                { id: "CON-022", name: "Surgical Gloves (Box)", stock: 2, reorder: 10 },
                { id: "MED-305", name: "Insulin Regular (Vial)", stock: 0, reorder: 15 },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5 border-destructive/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-destructive/10 rounded-full">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">{item.stock}</div>
                    <div className="text-xs text-muted-foreground">Reorder: {item.reorder}</div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/inventory/items">View All Stock <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "1", item: "Amoxicillin 500mg", type: "OUT", qty: 20, time: "10 mins ago", by: "Dr. Adams" },
                { id: "2", item: "Syringes 5ml", type: "IN", qty: 500, time: "2 hours ago", by: "Supply Co." },
                { id: "3", item: "Ibuprofen 400mg", type: "EXPIRED", qty: 5, time: "1 day ago", by: "Admin" },
              ].map((move) => (
                <div key={move.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <h4 className="font-medium text-sm">{move.item}</h4>
                    <p className="text-xs text-muted-foreground">{move.time} by {move.by}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      move.type === 'IN' ? 'bg-success/10 text-success' : 
                      move.type === 'EXPIRED' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {move.type === 'IN' ? '+' : '-'}{move.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
