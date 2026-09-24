"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Pill, Package, ClipboardList, ArrowRight, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

interface PharmacyStats {
  pendingCount?: number;
  dispensedToday?: number;
  pendingPrescriptions?: number;
}

export default function AdminPharmacyPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<PharmacyStats>({
    queryKey: ["admin_pharmacy_stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/pharmacy/stats");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load pharmacy stats");
      }
      const json = await res.json();
      return json.data as PharmacyStats;
    },
    staleTime: 30_000,
  });

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ["admin_inventory_low"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inventory/items");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as Array<{ id: string; name: string; stockQuantity: number; reorderLevel: number }> | null;
    },
    staleTime: 60_000,
  });

  const lowStock = (inventory ?? []).filter(
    (m) => m.stockQuantity <= m.reorderLevel
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy (Admin View)</h1>
          <p className="text-muted-foreground mt-1">Prescription workload, stock levels, and pharmacy audits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-background" asChild>
            <Link href="/pharmacy/prescriptions">
              <ClipboardList className="w-4 h-4" /> Prescriptions
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 bg-background" asChild>
            <Link href="/pharmacy/inventory">
              <Package className="w-4 h-4" /> Inventory
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading || invLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : error ? (
          <div className="lg:col-span-4">
            <ErrorState
              title="Failed to load pharmacy stats"
              description={(error as Error).message}
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <>
            <StatCard title="Pending Rx" value={data?.pendingCount ?? data?.pendingPrescriptions ?? 0} icon={Pill} />
            <StatCard title="Dispensed Today" value={data?.dispensedToday ?? 0} icon={Package} />
            <StatCard title="Low Stock" value={lowStock.length} icon={Package} />
            <StatCard
              title="Catalog"
              value={inventory?.length ?? "—"}
              icon={ClipboardList}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-heading font-semibold">Low-stock watchlist</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        {invLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : lowStock.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Package className="w-full h-full" />}
              title="No low-stock items in sample"
              description="Medicines at or below reorder level will appear here. Open Inventory for the full catalog."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {lowStock.slice(0, 8).map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {m.stockQuantity} / reorder {m.reorderLevel}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="px-4 py-3 border-t flex justify-end">
          <Button variant="link" size="sm" className="gap-1 h-auto p-0" asChild>
            <Link href="/pharmacy/inventory">
              Open inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
