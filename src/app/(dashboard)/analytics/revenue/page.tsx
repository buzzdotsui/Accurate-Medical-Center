"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface FinancialPayment {
  id: string;
  receiptId: string;
  amount: string | number;
  method: string;
  createdAt: string;
  invoice: {
    invoiceId: string;
    patient: { firstName: string; lastName: string };
  };
}

function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function RevenueAnalytics() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics-revenue-mtd"],
    queryFn: async (): Promise<FinancialPayment[]> => {
      const res = await fetch("/api/v1/reporting/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FINANCIAL",
          startDate: startOfMonthISO(),
          endDate: todayISO(),
          format: "JSON",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load revenue data");
      }
      return json.data.data;
    },
  });

  const payments = data ?? [];
  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount);
    return acc;
  }, {});

  const recent = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground mt-1">Month-to-date collections, broken down by payment method.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading revenue data..." className="py-24" />
      ) : isError ? (
        <ErrorState
          description={error instanceof Error ? error.message : "Failed to load revenue data"}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-border/50 bg-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Total Collected (MTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{formatCurrency(total)}</div>
                <p className="text-xs opacity-80 mt-1">{payments.length} payment{payments.length === 1 ? "" : "s"} recorded</p>
              </CardContent>
            </Card>

            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(byMethod).length === 0 ? (
                <Card className="border-none shadow-sm ring-1 ring-border/50 col-span-full">
                  <CardContent className="text-center py-6 text-sm text-muted-foreground">
                    No payments recorded so far this month.
                  </CardContent>
                </Card>
              ) : (
                Object.entries(byMethod).map(([method, amount]) => (
                  <Card key={method} className="border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2 text-center"><CardTitle className="text-sm text-muted-foreground">{method}</CardTitle></CardHeader>
                    <CardContent className="text-center"><div className="text-xl font-bold">{formatCurrency(amount)}</div></CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <EmptyState
                  icon={<Activity className="w-full h-full" />}
                  title="No payments yet"
                  description="Payments recorded this month will appear here."
                />
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b bg-muted/50">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Receipt</th>
                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Method</th>
                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {recent.map((p) => (
                        <tr key={p.id} className="border-b transition-colors hover:bg-muted/30">
                          <td className="p-6 align-middle font-medium">{p.receiptId}</td>
                          <td className="p-6 align-middle">{p.invoice.patient.firstName} {p.invoice.patient.lastName}</td>
                          <td className="p-6 align-middle">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                              {p.method}
                            </span>
                          </td>
                          <td className="p-6 align-middle text-muted-foreground">{formatDateTime(p.createdAt)}</td>
                          <td className="p-6 align-middle text-right font-bold">{formatCurrency(Number(p.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
