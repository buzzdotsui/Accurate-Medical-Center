"use client";

import React from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Pill, Package, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils/format";

interface PrescriptionSummary {
  id: string;
  status: string;
}

interface InventoryItem {
  id: string;
  stockQuantity: number;
  reorderLevel: number;
}

interface PharmacyStats {
  dispensedToday: number;
  pendingCount: number;
}

export default function PharmacyDashboard() {
  const { data: prescriptions } = useQuery({
    queryKey: ["prescriptions", "pending"],
    queryFn: async (): Promise<PrescriptionSummary[]> => {
      const res = await fetch("/api/v1/pharmacy/prescriptions", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Failed to load prescriptions");
      return json.data;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const res = await fetch("/api/v1/inventory/items", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Failed to load inventory");
      return json.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["pharmacy-stats"],
    queryFn: async (): Promise<PharmacyStats> => {
      const res = await fetch("/api/v1/pharmacy/stats", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Failed to load pharmacy stats");
      return json.data;
    },
    staleTime: 30_000,
  });

  const pendingRx = prescriptions?.length;
  const lowStockCount = items?.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy</h1>
          <p className="text-sm text-muted-foreground mt-1">Dispensing counter — today&apos;s prescriptions and stock overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-background" asChild>
            <Link href="/pharmacy/inventory">
              <Package className="w-4 h-4" /> Inventory
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/pharmacy/prescriptions">
              <Pill className="w-4 h-4" /> Prescription Queue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Pending Rx" value={pendingRx !== undefined ? formatNumber(pendingRx) : "—"} icon={Clock} />
            <StatCard title="Low Stock Items" value={lowStockCount !== undefined ? formatNumber(lowStockCount) : "—"} icon={AlertTriangle} />
            <StatCard
              title="Dispensed Today"
              value={stats?.dispensedToday !== undefined ? formatNumber(stats.dispensedToday) : "—"}
              icon={Pill}
            />
            <StatCard
              title="Revenue (Today)"
              value="—"
              description="Requires billing integration"
              icon={Package}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Pending Prescriptions</h2>
          {pendingRx === 0 ? (
            <EmptyState
              icon={<Pill className="w-full h-full" />}
              title="No pending prescriptions"
              description="Prescriptions awaiting dispensing will appear here as doctors issue them."
            />
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pharmacy/prescriptions">
                View {pendingRx !== undefined ? formatNumber(pendingRx) : ""} pending prescription{pendingRx === 1 ? "" : "s"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-heading font-semibold">Stock Alerts</h2>
          {lowStockCount === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-full h-full" />}
              title="No stock alerts"
              description="Medicines with low or critical stock levels will appear here."
            />
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pharmacy/inventory">
                View {lowStockCount !== undefined ? formatNumber(lowStockCount) : ""} low stock alert{lowStockCount === 1 ? "" : "s"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
