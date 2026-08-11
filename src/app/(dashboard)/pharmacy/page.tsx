import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, AlertCircle, CheckCircle, Package } from "lucide-react";
import Link from "next/link";

export default function PharmacyDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy Portal</h1>
          <p className="text-muted-foreground mt-1">Manage prescriptions, dispense medications, and monitor inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/pharmacy/prescriptions">
              <Pill className="w-4 h-4 mr-2" />
              Prescription Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Prescriptions</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <AlertCircle className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">14</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dispensed Today</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">86</div>
            <p className="text-xs text-muted-foreground mt-1">Prescriptions completed</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Package className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">5</div>
            <p className="text-xs text-muted-foreground mt-1">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Next in Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">RX</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">John Doe</h3>
              <p className="text-muted-foreground mt-1">RX-2026-0081 • 3 Medications</p>
              
              <Button size="lg" className="mt-6" asChild>
                <Link href="/pharmacy/prescriptions/DEMO-RX-ID">
                  Dispense Medication
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
