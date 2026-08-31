"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Receipt, RefreshCw } from "lucide-react";

interface Invoice {
  id: string;
  invoiceId: string;
  createdAt: string;
  totalAmount: number | string;
  amountPaid: number | string;
  status: string;
}

function formatNaira(value: number | string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

const STATUS_CLASSES: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  PARTIAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  VOID: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  // Legacy statuses from BillingService (createInvoice sets ISSUED; DRAFT is a possible state)
  ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DRAFT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

/** Statuses that contribute to the outstanding balance. */
const PENDING_STATUSES = new Set(["UNPAID", "PARTIAL", "DRAFT", "ISSUED"]);

export default function MyBillingPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<Invoice[]>({
    queryKey: ["patient_invoices"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/invoices");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load billing information");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
  });

  const pendingBalance = (data ?? [])
    .filter((inv) => PENDING_STATUSES.has(inv.status))
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Billing</h1>
          <p className="text-muted-foreground mt-1">
            View and track your invoices and payment history.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
          <Button
            variant="link"
            size="sm"
            className="ml-2 h-auto p-0 text-destructive underline"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Pending balance summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Outstanding Balance
          </CardTitle>
          <Receipt className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-36 rounded" />
          ) : (
            <div
              className={`text-2xl font-bold ${
                pendingBalance > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"
              }`}
            >
              {formatNaira(pendingBalance)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center px-4">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your billing history will appear here once invoices are generated for your visits.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Invoice ID</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Date</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Total</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Paid</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Balance</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((invoice) => {
                const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid);
                return (
                  <tr
                    key={invoice.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{invoice.invoiceId}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(invoice.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatNaira(invoice.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                      {formatNaira(invoice.amountPaid)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      {formatNaira(balance)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
