import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, HeartPulse, Activity, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function NurseDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Nurse Portal</h1>
          <p className="text-muted-foreground mt-1">Manage triage queue, record vitals, and assist clinical flow.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/nurse/queue">
              <ClipboardList className="w-4 h-4 mr-2" />
              Triage Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patients in Triage</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">8</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting vitals</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vitals Recorded Today</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <HeartPulse className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">34</div>
            <p className="text-xs text-muted-foreground mt-1">Cleared for doctors</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stat Orders</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Next Patient in Triage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">MS</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Mary Smith</h3>
              <p className="text-muted-foreground mt-1">Checked in 12 mins ago</p>
              
              <Button size="lg" className="mt-6" asChild>
                <Link href="/nurse/vitals/DEMO-VISIT-ID">
                  Record Vitals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
