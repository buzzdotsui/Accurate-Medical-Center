import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Wallet, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BillingDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Billing & Cashier</h1>
          <p className="text-muted-foreground mt-1">Manage patient invoices, process payments, and track revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/billing/invoices">
              <CreditCard className="w-4 h-4 mr-2" />
              Active Invoices
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$12,450</div>
            <p className="text-xs text-muted-foreground mt-1">+14% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Invoices</CardTitle>
            <div className="p-2 bg-warning/10 rounded-full">
              <FileText className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">34</div>
            <p className="text-xs text-muted-foreground mt-1">Pending collection</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Insurance Claims</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <Wallet className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">18</div>
            <p className="text-xs text-muted-foreground mt-1">Pending HMO approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Process Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Next in Queue: Mary Smith</h3>
              <p className="text-muted-foreground mt-1">Invoice: INV-2026-092 • Total: $145.00</p>
              
              <Button size="lg" className="mt-6" asChild>
                <Link href="/billing/invoices/DEMO-INV-ID">
                  Accept Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
