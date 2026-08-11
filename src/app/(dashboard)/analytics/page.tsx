import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Activity, ArrowRight, DownloadCloud, FileText } from "lucide-react";
import Link from "next/link";

export default function AnalyticsDashboard() {
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$142,500</div>
            <p className="text-xs text-success mt-1">+12.5% from last month</p>
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
            <div className="text-3xl font-bold text-foreground">3,240</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bed Occupancy</CardTitle>
            <div className="p-2 bg-warning/10 rounded-full">
              <Activity className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">78%</div>
            <p className="text-xs text-muted-foreground mt-1">Hospital-wide average</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Wait Time</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <BarChart3 className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">18 min</div>
            <p className="text-xs text-success mt-1">-4 min from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Department (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Pharmacy", val: 52000, total: 142500, color: "bg-primary" },
                { name: "Laboratory", val: 34000, total: 142500, color: "bg-info" },
                { name: "Consultations", val: 28000, total: 142500, color: "bg-warning" },
                { name: "Radiology", val: 18000, total: 142500, color: "bg-success" },
                { name: "Inpatient / Wards", val: 10500, total: 142500, color: "bg-muted-foreground" },
              ].map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">${dept.val.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${dept.color}`} style={{ width: `${(dept.val / dept.total) * 100}%` }} />
                  </div>
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
              <div className="p-6 border rounded-lg hover:border-primary transition-colors cursor-pointer text-center group">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-primary mb-3" />
                <h4 className="font-medium text-sm">Daily Flash Report</h4>
                <p className="text-xs text-muted-foreground mt-1">PDF Summary</p>
              </div>
              <div className="p-6 border rounded-lg hover:border-success transition-colors cursor-pointer text-center group">
                <DownloadCloud className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-success mb-3" />
                <h4 className="font-medium text-sm">Financial Export</h4>
                <p className="text-xs text-muted-foreground mt-1">CSV Raw Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
