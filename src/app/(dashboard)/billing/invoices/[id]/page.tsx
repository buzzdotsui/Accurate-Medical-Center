"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProcessPaymentSchema, type ProcessPaymentInput } from "@/lib/validations/billing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, DollarSign, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface InvoiceDetail {
  id: string;
  invoiceId: string;
  status: string;
  createdAt: string;
  subTotal: string | number;
  discount: string | number;
  tax: string | number;
  totalAmount: string | number;
  amountPaid: string | number;
  patient: { firstName: string; lastName: string; patientId: string; phone: string | null };
  items: InvoiceItem[];
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ProcessPayment() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error, refetch } = useQuery<InvoiceDetail>({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/billing/invoices/${invoiceId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load invoice");
      }
      return json.data;
    },
  });

  const balance = invoice ? Number(invoice.totalAmount) - Number(invoice.amountPaid) : 0;

  const form = useForm<ProcessPaymentInput>({
    resolver: zodResolver(ProcessPaymentSchema),
    defaultValues: { amount: 0, method: "CASH", reference: "" },
  });

  // Once the real invoice loads, default the payment amount to the real
  // outstanding balance (never a hardcoded placeholder value).
  useEffect(() => {
    if (invoice) form.setValue("amount", balance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id]);

  const method = form.watch("method");

  const mutation = useMutation({
    mutationFn: async (data: ProcessPaymentInput) => {
      const res = await fetch(`/api/v1/billing/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to process payment");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Payment processed successfully. Receipt generated.");
      router.push("/billing/invoices");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <LoadingState message="Loading invoice…" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <ErrorState
          title="Failed to load invoice"
          description={(error as Error)?.message ?? "Invoice not found."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/billing/invoices"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Process Payment</h1>
          <p className="text-muted-foreground mt-1">Invoice: {invoice.invoiceId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <div className="text-sm font-medium text-muted-foreground">
                Generated: {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Bill To:</h3>
                  <p className="text-foreground font-medium">
                    {invoice.patient.firstName} {invoice.patient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{invoice.patient.patientId}</p>
                  {invoice.patient.phone && (
                    <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-warning/10 text-warning">
                    {invoice.status}
                  </span>
                </div>
              </div>

              <div className="relative w-full overflow-auto mb-6">
                <table className="w-full caption-bottom text-sm border-collapse">
                  <thead className="[&_tr]:border-b bg-muted/50">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium">Description</th>
                      <th className="h-10 px-4 text-right font-medium">Qty</th>
                      <th className="h-10 px-4 text-right font-medium">Unit Price</th>
                      <th className="h-10 px-4 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 align-middle font-medium">{item.description}</td>
                        <td className="p-4 align-middle text-right">{item.quantity}</td>
                        <td className="p-4 align-middle text-right">{formatNaira(Number(item.unitPrice))}</td>
                        <td className="p-4 align-middle text-right font-bold">{formatNaira(Number(item.totalPrice))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>{formatNaira(Number(invoice.subTotal))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax:</span><span>{formatNaira(Number(invoice.tax))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span><span>-{formatNaira(Number(invoice.discount))}</span></div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg"><span className="text-foreground">Total:</span><span>{formatNaira(Number(invoice.totalAmount))}</span></div>
                  <div className="flex justify-between text-success"><span className="text-muted-foreground">Amount Paid:</span><span>-{formatNaira(Number(invoice.amountPaid))}</span></div>
                  <div className="flex justify-between border-t pt-2 font-bold text-xl text-destructive"><span className="text-foreground">Balance Due:</span><span>{formatNaira(balance)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50 sticky top-6">
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Record Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {balance <= 0 ? (
                <p className="text-sm text-muted-foreground">This invoice is already fully paid.</p>
              ) : (
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Payment Method</label>
                    <select
                      {...form.register("method")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="TRANSFER">Bank Transfer</option>
                      <option value="INSURANCE">Insurance / HMO</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Amount to Pay (Balance: {formatNaira(balance)})</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        max={balance}
                        {...form.register("amount", { valueAsNumber: true })}
                        className="pl-9 font-bold text-lg"
                      />
                    </div>
                    {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
                  </div>

                  {(method === "CARD" || method === "TRANSFER" || method === "INSURANCE") && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      <label className="text-sm font-medium text-foreground">
                        {method === "INSURANCE" ? "Authorization Code / ID" : "Transaction Reference"}
                      </label>
                      <Input {...form.register("reference")} placeholder={`Enter ${method.toLowerCase()} reference...`} />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button type="submit" size="lg" className="w-full text-base h-12" disabled={mutation.isPending}>
                      {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Receipt className="mr-2 h-5 w-5" />}
                      Confirm Payment
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
