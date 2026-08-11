"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function BillingQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async () => {
      // Mock data for frontend demo
      return [
        { id: "INV-001", patient: { name: "Mary Smith", id: "AMC-2026-0004" }, amount: 145.00, items: 3, status: "DRAFT", time: "11:45 AM" },
        { id: "INV-002", patient: { name: "John Doe", id: "AMC-2026-0001" }, amount: 1050.00, items: 5, status: "PARTIAL", time: "09:30 AM", balance: 550.00 },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Active Invoices</h1>
          <p className="text-muted-foreground mt-1">Process pending payments for consultations, pharmacy, and labs.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.length === 0 ? (
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
                  {data?.map((inv: any) => (
                    <tr key={inv.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium">{inv.time}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{inv.patient.name}</div>
                        <div className="text-xs text-muted-foreground">{inv.patient.id}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-lg">${inv.amount.toFixed(2)}</div>
                        {inv.balance && <div className="text-xs text-destructive">Balance: ${inv.balance.toFixed(2)}</div>}
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inv.status === 'PARTIAL' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
