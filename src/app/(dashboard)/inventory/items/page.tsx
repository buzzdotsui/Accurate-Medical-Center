"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: string | number;
  stockQuantity: number;
  reorderLevel: number;
}

export default function InventoryCatalog() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const res = await fetch("/api/v1/inventory/items", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load inventory items");
      }
      return json.data;
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage all hospital stock, prices, and categories.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Loading inventory..." className="py-12" />
          ) : isError ? (
            <ErrorState
              description={error instanceof Error ? error.message : "Failed to load inventory items"}
              onRetry={() => refetch()}
              className="border-none bg-transparent"
            />
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Boxes className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No items found</h3>
              <p className="text-muted-foreground mt-1">Medicine and consumable items will appear here once added.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Item Name</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Category</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Stock Level</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Unit Price</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((item) => {
                    const isLow = item.stockQuantity <= item.reorderLevel;
                    return (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/30 group">
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base flex items-center gap-2">
                            {item.name}
                            {isLow && <span className="w-2 h-2 rounded-full bg-destructive" title="Low Stock"></span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.code}</div>
                        </td>
                        <td className="p-6 align-middle">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-6 align-middle">
                          <div className={`font-bold text-lg ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                            {item.stockQuantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}(s)</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Reorder: {item.reorderLevel}</div>
                        </td>
                        <td className="p-6 align-middle font-medium">
                          {formatCurrency(Number(item.price))}
                        </td>
                        <td className="p-6 align-middle text-right">
                          <Button variant="outline" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link href={`/inventory/items/${item.id}`}>
                              Adjust Stock
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
