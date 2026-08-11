import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Stethoscope, Clock } from "lucide-react";
import Link from "next/link";

export default function DoctorDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Doctor Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your active clinical queue and patient encounters.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/doctor/queue">
              <Activity className="w-4 h-4 mr-2" />
              View Active Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patients Waiting</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">12</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in triage/queue</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">8</div>
            <p className="text-xs text-muted-foreground mt-1">Encounters closed</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Lab Results</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">3</div>
            <p className="text-xs text-muted-foreground mt-1">Requires review</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Consult Time</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18m</div>
            <p className="text-xs text-success mt-1">Efficient workflow</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Next Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">JD</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">John Doe</h3>
              <p className="text-muted-foreground mt-1">Wait time: 24 mins • Follow-up</p>
              
              <Button size="lg" className="mt-6" asChild>
                <Link href="/doctor/consultation/DEMO-VISIT-ID">
                  Start Consultation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>You have 3 unread lab reports to review.</p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="/doctor/labs">Review Lab Results</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
