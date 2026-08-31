"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
}

export default function PharmacyInventoryPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const res = await fetch("/api/v1/inventory/items", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load pharmacy inventory");
      }
      return json.data;
    },
  });

  const items = data ?? [];
  const lowStockCount = items.filter((i) => i.stockQuantity <= i.reorderLevel).length;
  const outOfStockCount = items.filter((i) => i.stockQuantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pharmacy stock and reorder alerts.</p>
        </div>
        <Button asChild>
          <Link href="/inventory/items">
            <Package className="mr-2 h-4 w-4" /> Manage Catalog
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading pharmacy inventory..." className="py-12" />
      ) : isError ? (
        <ErrorState
          description={error instanceof Error ? error.message : "Failed to load pharmacy inventory"}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total Items" value={formatNumber(items.length)} />
            <StatCard title="Low Stock Alerts" value={formatNumber(lowStockCount)} />
            <StatCard title="Out of Stock" value={formatNumber(outOfStockCount)} />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Stock List</h2>
            {items.length === 0 ? (
              <EmptyState
                icon={<Package className="w-full h-full" />}
                title="Inventory is empty"
                description="Medicines added to the catalog will appear here with stock levels and reorder alerts."
              />
            ) : (
              <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardContent className="p-0">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b bg-muted/50">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Item</th>
                          <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Stock</th>
                          <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {items.map((item) => {
                          const isLow = item.stockQuantity <= item.reorderLevel;
                          return (
                            <tr key={item.id} className="border-b transition-colors hover:bg-muted/30">
                              <td className="p-6 align-middle">
                                <div className="font-bold text-base flex items-center gap-2">
                                  {item.name}
                                  {isLow && <span className="w-2 h-2 rounded-full bg-destructive" title="Low Stock"></span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{item.code}</div>
                              </td>
                              <td className="p-6 align-middle">
                                <span className={`font-bold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                                  {item.stockQuantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}(s)</span>
                                </span>
                              </td>
                              <td className="p-6 align-middle text-right">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/inventory/items/${item.id}`}>Adjust Stock</Link>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
