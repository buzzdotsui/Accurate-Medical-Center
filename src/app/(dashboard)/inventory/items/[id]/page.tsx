"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdjustStockSchema, type AdjustStockInput } from "@/lib/validations/inventory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PackagePlus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function AdjustStock() {
  const router = useRouter();
  const params = useParams();
  
  // Mock data mapping to the selected SKU
  const item = {
    id: params.id as string,
    name: "Paracetamol 500mg",
    category: "TABLET",
    stock: 5,
    reorder: 50,
    unit: "Pack",
    supplier: "PharmaCorp Ltd"
  };

  const form = useForm<AdjustStockInput>({
    resolver: zodResolver(AdjustStockSchema),
    defaultValues: {
      type: "IN",
      quantity: 100,
      reference: "",
      notes: ""
    }
  });

  const type = form.watch("type");

  const mutation = useMutation({
    mutationFn: async (data: AdjustStockInput) => {
      const res = await fetch(`/api/v1/inventory/items/${item.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to adjust stock");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Stock adjustment logged successfully.");
      router.push("/inventory/items");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/items"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Adjust Stock</h1>
          <p className="text-muted-foreground mt-1">SKU: {item.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
                <p className="font-bold text-lg">{item.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y py-4 my-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Current Stock</label>
                  <p className={`font-bold text-2xl ${item.stock <= item.reorder ? 'text-destructive' : 'text-foreground'}`}>
                    {item.stock} <span className="text-sm font-normal text-muted-foreground">{item.unit}s</span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Reorder Lvl</label>
                  <p className="font-bold text-2xl text-muted-foreground">{item.reorder}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Supplier</label>
                <p className="font-medium text-foreground">{item.supplier}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Record Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Movement Type</label>
                    <select 
                      {...form.register("type")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="IN">Stock IN (Receive)</option>
                      <option value="OUT">Stock OUT (Dispense)</option>
                      <option value="ADJUSTMENT">Adjustment (Loss/Damage)</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Quantity ({item.unit}s)</label>
                    <Input 
                      type="number"
                      {...form.register("quantity", { valueAsNumber: true })} 
                      className="font-bold text-lg"
                    />
                    {form.formState.errors.quantity && <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>}
                  </div>
                </div>

                {type === "OUT" && (
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-md flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning-foreground font-medium">
                      Ensure you verify the prescription or department requisition number before dispensing stock out of the main inventory.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reference Number (Optional)</label>
                  <Input {...form.register("reference")} placeholder="e.g. Invoice Number, PO Number..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                  <textarea 
                    {...form.register("notes")} 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/inventory/items">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                    Confirm Adjustment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
