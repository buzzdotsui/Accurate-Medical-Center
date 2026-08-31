"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { TrendingUp, Receipt, CreditCard, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog";

interface BillingStats {
  revenueToday: number;
  outstanding: number;
  paymentsTodayCount: number;
}

interface Invoice {
  id: string;
  invoiceId: string;
  status: string;
  totalAmount: string | number;
  patient: { firstName: string; lastName: string; patientId: string };
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BillingDashboard() {
  const [open, setOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<BillingStats>({
    queryKey: ["billing_dashboard_stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/stats");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load billing statistics");
      }
      return json.data;
    },
    staleTime: 30_000,
  });

  const { data: invoices, isLoading: invoicesLoading, error: invoiceError, refetch: refetchInvoices } = useQuery<Invoice[]>({
    queryKey: ["billing-invoices"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/invoices");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? 'Failed to load invoices');
      }
      return json.data;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finance &amp; Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Invoices, payments, and financial overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>
      </div>

      {statsError ? (
        <ErrorState
          title="Failed to load billing statistics"
          description={(statsError as Error).message}
          onRetry={() => refetchStats()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : (
            <>
              <StatCard title="Revenue Today" value={formatNaira(stats?.revenueToday ?? 0)} icon={TrendingUp} />
              <StatCard title="Outstanding" value={formatNaira(stats?.outstanding ?? 0)} icon={Receipt} />
              <StatCard title="Payments Today" value={stats?.paymentsTodayCount ?? 0} icon={CreditCard} />
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Active Invoices</h2>
          <Link href="/billing/invoices" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {invoicesLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : invoiceError ? (
          <ErrorState
            title="Failed to load invoices"
            description={(invoiceError as Error).message}
            onRetry={() => refetchInvoices()}
          />
        ) : !invoices || invoices.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-full h-full" />}
            title="No invoices generated yet"
            description="Invoices will appear here as they are created for patient services and admissions."
            action={
              <Button className="gap-2" size="sm" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4" /> New Invoice
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm divide-y">
            {invoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                href={`/billing/invoices/${inv.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.patient.firstName} {inv.patient.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{inv.invoiceId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatNaira(Number(inv.totalAmount))}</p>
                  <p className="text-xs text-muted-foreground">{inv.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          refetchStats();
          refetchInvoices();
        }}
      />
    </div>
  );
}
