"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Search, Plus, Boxes } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function InventoryCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      // Mock data for UI
      return [
        { id: "MED-104", name: "Paracetamol 500mg", category: "TABLET", stock: 5, reorder: 50, unit: "Pack", price: 2.50 },
        { id: "MED-305", name: "Insulin Regular", category: "INJECTION", stock: 0, reorder: 15, unit: "Vial", price: 45.00 },
        { id: "CON-022", name: "Surgical Gloves", category: "CONSUMABLE", stock: 150, reorder: 50, unit: "Box", price: 12.00 },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage all hospital stock, prices, and categories.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add New SKU
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Boxes className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No items found</h3>
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
                  {data?.map((item: any) => {
                    const isLow = item.stock <= item.reorder;
                    return (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/30 group">
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base flex items-center gap-2">
                            {item.name}
                            {isLow && <span className="w-2 h-2 rounded-full bg-destructive" title="Low Stock"></span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.id}</div>
                        </td>
                        <td className="p-6 align-middle">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-6 align-middle">
                          <div className={`font-bold text-lg ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                            {item.stock} <span className="text-xs font-normal text-muted-foreground">{item.unit}s</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Reorder: {item.reorder}</div>
                        </td>
                        <td className="p-6 align-middle font-medium">
                          ${item.price.toFixed(2)}
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
