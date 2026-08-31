"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog";

interface Invoice {
  id: string;
  invoiceId: string;
  status: string;
  totalAmount: string | number;
  amountPaid: string | number;
  createdAt: string;
  patient: { firstName: string; lastName: string; patientId: string };
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function BillingQueue() {
  const [open, setOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<Invoice[]>({
    queryKey: ["billing-invoices"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/invoices");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load invoices");
      }
      return json.data;
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Active Invoices</h1>
          <p className="text-muted-foreground mt-1">Process pending payments for consultations, pharmacy, and labs.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState message="Loading invoices…" />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState title="Failed to load invoices" description={(error as Error).message} onRetry={() => refetch()} />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No pending invoices</h3>
              <p className="text-muted-foreground mt-1">All accounts are settled.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Generated</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Amount</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.map((inv) => {
                    const balance = Number(inv.totalAmount) - Number(inv.amountPaid);
                    return (
                      <tr key={inv.id} className="border-b transition-colors hover:bg-muted/30 group">
                        <td className="p-6 align-middle font-medium">
                          {new Date(inv.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base">{inv.patient.firstName} {inv.patient.lastName}</div>
                          <div className="text-xs text-muted-foreground">{inv.patient.patientId}</div>
                        </td>
                        <td className="p-6 align-middle">
                          <div className="font-bold text-lg">{formatNaira(Number(inv.totalAmount))}</div>
                          {balance > 0 && Number(inv.amountPaid) > 0 && (
                            <div className="text-xs text-destructive">Balance: {formatNaira(balance)}</div>
                          )}
                        </td>
                        <td className="p-6 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            inv.status === "PARTIAL" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-6 align-middle text-right">
                          <Button variant="default" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link href={`/billing/invoices/${inv.id}`}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Process Payment
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

      <CreateInvoiceDialog open={open} onOpenChange={setOpen} onSuccess={() => refetch()} />
    </div>
  );
}
