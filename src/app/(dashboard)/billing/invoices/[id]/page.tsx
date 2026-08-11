"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProcessPaymentSchema, type ProcessPaymentInput } from "@/lib/validations/billing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CreditCard, DollarSign, Receipt, CheckCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function ProcessPayment() {
  const router = useRouter();
  const params = useParams();
  
  // Mock data mapping to the selected invoice
  const invoice = {
    id: params.id as string,
    invoiceNumber: "INV-2026-092",
    patient: { name: "Mary Smith", id: "AMC-2026-0004", phone: "+1 (555) 123-4567" },
    date: "2026-08-07",
    status: "DRAFT",
    items: [
      { id: 1, desc: "General Consultation (Dr. Adams)", qty: 1, unit: 50.00, total: 50.00 },
      { id: 2, desc: "Complete Blood Count (CBC)", qty: 1, unit: 35.00, total: 35.00 },
      { id: 3, desc: "Amoxicillin 500mg", qty: 2, unit: 30.00, total: 60.00 }
    ],
    subtotal: 145.00,
    tax: 0.00,
    discount: 0.00,
    total: 145.00,
    amountPaid: 0.00,
    balance: 145.00
  };

  const form = useForm<ProcessPaymentInput>({
    resolver: zodResolver(ProcessPaymentSchema),
    defaultValues: {
      amount: invoice.balance,
      method: "CASH",
      reference: ""
    }
  });

  const method = form.watch("method");

  const mutation = useMutation({
    mutationFn: async (data: ProcessPaymentInput) => {
      const res = await fetch(`/api/v1/billing/invoices/${invoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to process payment");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment processed successfully. Receipt generated.");
      router.push("/billing/invoices");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/billing/invoices"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Process Payment</h1>
          <p className="text-muted-foreground mt-1">Invoice: {invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <div className="text-sm font-medium text-muted-foreground">Generated: {invoice.date}</div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Bill To:</h3>
                  <p className="text-foreground font-medium">{invoice.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.patient.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-warning/10 text-warning">
                    UNPAID
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
                    {invoice.items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 align-middle font-medium">{item.desc}</td>
                        <td className="p-4 align-middle text-right">{item.qty}</td>
                        <td className="p-4 align-middle text-right">${item.unit.toFixed(2)}</td>
                        <td className="p-4 align-middle text-right font-bold">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>${invoice.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax:</span><span>${invoice.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span><span>-${invoice.discount.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg"><span className="text-foreground">Total:</span><span>${invoice.total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-success"><span className="text-muted-foreground">Amount Paid:</span><span>-${invoice.amountPaid.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2 font-bold text-xl text-destructive"><span className="text-foreground">Balance Due:</span><span>${invoice.balance.toFixed(2)}</span></div>
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
                  <label className="text-sm font-medium text-foreground">Amount to Pay ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      step="0.01"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
