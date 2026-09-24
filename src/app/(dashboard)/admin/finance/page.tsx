"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Banknote, Receipt, TrendingUp, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

interface BillingStats {
  revenueToday?: number;
  outstanding?: number;
  paymentsTodayCount?: number;
  totalRevenue?: number;
  outstandingAmount?: number;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminFinancePage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<BillingStats>({
    queryKey: ["admin_finance_stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/stats");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load finance stats");
      }
      const json = await res.json();
      return json.data as BillingStats;
    },
    staleTime: 30_000,
  });

  const revenueToday = data?.revenueToday ?? 0;
  const outstanding = data?.outstanding ?? data?.outstandingAmount ?? 0;
  const paymentsToday = data?.paymentsTodayCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finance (Admin View)</h1>
          <p className="text-muted-foreground mt-1">Revenue, outstanding balances, and billing audit trails.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-background"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" className="gap-2 bg-background" asChild>
            <Link href="/billing/invoices">
              <Receipt className="w-4 h-4" /> Invoices
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState
          title="Failed to load finance stats"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : (
            <>
              <StatCard title="Revenue Today" value={formatNaira(revenueToday)} icon={TrendingUp} />
              <StatCard title="Outstanding" value={formatNaira(outstanding)} icon={Banknote} />
              <StatCard title="Payments Today" value={paymentsToday} icon={Receipt} />
              <StatCard title="Ledger scope" value="Branch" icon={Banknote} />
            </>
          )}
        </div>
      )}

      <div className="rounded-xl border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Payment gateway settlement</p>
          <p className="text-xs text-muted-foreground mt-1">
            Live gateway settlement and bank reconciliation require external payment-provider keys
            (Paystack/Flutterwave). Configure secrets in the environment — this view reports internal
            billing ledger totals only.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/billing">
            Open billing <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
