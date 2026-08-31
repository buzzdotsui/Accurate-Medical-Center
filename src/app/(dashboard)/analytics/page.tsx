"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Activity, DownloadCloud, FileText, FlaskConical, BedDouble } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface DashboardMetrics {
  totalPatients: number;
  totalRevenue: number;
  activeAdmissions: number;
  pendingConsultations: number;
  bedOccupancyRate: number | null;
  occupiedBeds: number;
  totalBeds: number;
  lowStockCount: number;
  pendingLabRequests: number;
  pendingRadiologyRequests: number;
}

export default function AnalyticsDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reporting-dashboard"],
    queryFn: async (): Promise<DashboardMetrics> => {
      const res = await fetch("/api/v1/reporting/dashboard", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load dashboard metrics");
      }
      return json.data;
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Analytics & Reporting</h1>
          <p className="text-muted-foreground mt-1">Executive dashboard for hospital performance, revenue, and clinical metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/analytics/revenue">
              <TrendingUp className="w-4 h-4 mr-2" />
              Financials
            </Link>
          </Button>
          <Button asChild>
            <Link href="/analytics/reports">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading dashboard metrics..." className="py-24" />
      ) : isError || !data ? (
        <ErrorState
          description={error instanceof Error ? error.message : "Failed to load dashboard metrics"}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="p-2 bg-success/10 rounded-full">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(data.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">All completed payments</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{formatNumber(data.totalPatients)}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bed Occupancy</CardTitle>
                <div className="p-2 bg-warning/10 rounded-full">
                  <BedDouble className="w-4 h-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                {data.bedOccupancyRate === null ? (
                  <>
                    <div className="text-xl font-bold text-muted-foreground">No beds configured</div>
                    <p className="text-xs text-muted-foreground mt-1">Add wards/rooms/beds to track occupancy</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-foreground">{data.bedOccupancyRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">{data.occupiedBeds} of {data.totalBeds} beds occupied</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Lab Requests</CardTitle>
                <div className="p-2 bg-info/10 rounded-full">
                  <FlaskConical className="w-4 h-4 text-info" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{formatNumber(data.pendingLabRequests)}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting sample analysis or results</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Operational Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Active Admissions", value: data.activeAdmissions, icon: Activity },
                    { label: "Pending Consultations", value: data.pendingConsultations, icon: Users },
                    { label: "Pending Radiology Requests", value: data.pendingRadiologyRequests, icon: BarChart3 },
                    { label: "Low Stock Medicine Items", value: data.lowStockCount, icon: FlaskConical },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <row.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{row.label}</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{formatNumber(row.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/analytics/reports" className="p-6 border rounded-lg hover:border-primary transition-colors cursor-pointer text-center group">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-primary mb-3" />
                    <h4 className="font-medium text-sm">Report Generator</h4>
                    <p className="text-xs text-muted-foreground mt-1">CSV / JSON / PDF</p>
                  </Link>
                  <Link href="/analytics/revenue" className="p-6 border rounded-lg hover:border-success transition-colors cursor-pointer text-center group">
                    <DownloadCloud className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-success mb-3" />
                    <h4 className="font-medium text-sm">Financial Analytics</h4>
                    <p className="text-xs text-muted-foreground mt-1">Revenue & payment methods</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
