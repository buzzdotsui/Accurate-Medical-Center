import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Users, Activity, LogOut, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function InpatientDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inpatient Management</h1>
          <p className="text-muted-foreground mt-1">Manage ward capacities, bed allocations, and patient admissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/inpatient/wards">
              <Home className="w-4 h-4 mr-2" />
              Ward Overview
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inpatient/admissions">
              <Bed className="w-4 h-4 mr-2" />
              Active Admissions
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admitted</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">42</div>
            <p className="text-xs text-muted-foreground mt-1">Patients currently in wards</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Beds</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <Bed className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">15</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for allocation</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ICU Occupancy</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-full">
              <Activity className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">90%</div>
            <p className="text-xs text-muted-foreground mt-1">9 of 10 beds occupied</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discharges Today</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">6</div>
            <p className="text-xs text-muted-foreground mt-1">Pending final clearance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bed className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">John Doe</h4>
                      <p className="text-xs text-muted-foreground mt-1">Ward A (General) • Bed 04</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-primary">Admitted</div>
                    <div className="text-xs text-muted-foreground mt-1">2h ago</div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2 text-primary" asChild>
                <Link href="/inpatient/admissions">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Ward Capacities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "General Ward A", occ: 18, cap: 20, color: "bg-primary" },
                { name: "ICU", occ: 9, cap: 10, color: "bg-destructive" },
                { name: "Maternity", occ: 12, cap: 15, color: "bg-info" },
                { name: "Pediatric", occ: 3, cap: 12, color: "bg-success" },
              ].map((ward) => (
                <div key={ward.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{ward.name}</span>
                    <span className="text-muted-foreground">{ward.occ} / {ward.cap} Beds</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${ward.color}`} style={{ width: `${(ward.occ / ward.cap) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
