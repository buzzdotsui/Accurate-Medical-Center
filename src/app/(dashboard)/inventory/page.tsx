"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingDown, ArrowRight, Boxes, Wallet } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: string | number;
  stockQuantity: number;
  reorderLevel: number;
  inventoryTx: Array<{
    type: string;
    quantity: number;
    createdAt: string;
    supplier: { name: string } | null;
  }>;
}

export default function InventoryDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const res = await fetch("/api/v1/inventory/items", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load inventory data");
      }
      return json.data;
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading inventory data..." className="py-24" />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        description={error instanceof Error ? error.message : "Failed to load inventory data"}
        onRetry={() => refetch()}
      />
    );
  }

  const totalSkus = data.length;
  const lowStockItems = data.filter((i) => i.stockQuantity <= i.reorderLevel);
  const outOfStockCount = data.filter((i) => i.stockQuantity === 0).length;
  const totalStockValue = data.reduce((sum, i) => sum + i.stockQuantity * Number(i.price), 0);

  const criticalLowStock = [...lowStockItems]
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 5);

  const recentMovements = data
    .flatMap((i) => i.inventoryTx.map((tx) => ({ ...tx, itemName: i.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
            <div className="text-3xl font-bold text-foreground">{formatNumber(totalSkus)}</div>
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
            <div className="text-3xl font-bold text-warning">{formatNumber(lowStockItems.length)}</div>
            <p className="text-xs text-muted-foreground mt-1">Below reorder threshold</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-full">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatNumber(outOfStockCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Items with zero stock</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Value</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <Wallet className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{formatCurrency(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">At current unit prices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Critical Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {criticalLowStock.length === 0 ? (
              <EmptyState
                icon={<Package className="w-full h-full" />}
                title="No low stock items"
                description="All catalog items are above their reorder threshold."
              />
            ) : (
              <div className="space-y-4">
                {criticalLowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5 border-destructive/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-destructive/10 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-destructive">{item.stockQuantity}</div>
                      <div className="text-xs text-muted-foreground">Reorder: {item.reorderLevel}</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href="/inventory/items">View All Stock <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <EmptyState
                icon={<Package className="w-full h-full" />}
                title="No stock movements yet"
                description="Stock adjustments will appear here once recorded."
              />
            ) : (
              <div className="space-y-4">
                {recentMovements.map((move, idx) => (
                  <div key={`${move.itemName}-${idx}`} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div>
                      <h4 className="font-medium text-sm">{move.itemName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(move.createdAt)}{move.supplier ? ` by ${move.supplier.name}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        move.type === 'IN' ? 'bg-success/10 text-success' :
                        move.type === 'EXPIRED' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {move.type === 'IN' ? '+' : '-'}{move.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
