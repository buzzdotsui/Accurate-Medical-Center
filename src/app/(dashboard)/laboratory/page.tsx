import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, AlertTriangle, FileCheck, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function LaboratoryDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Laboratory Portal</h1>
          <p className="text-muted-foreground mt-1">Manage test requests, enter results, and flag abnormal findings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/laboratory/requests">
              <ClipboardList className="w-4 h-4 mr-2" />
              Active Lab Requests
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tests</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting analysis</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">STAT / Urgent</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate priority</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Results Published</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <FileCheck className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">142</div>
            <p className="text-xs text-muted-foreground mt-1">Completed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Next STAT Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-destructive/5 border-destructive/20">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <FlaskConical className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Complete Blood Count (CBC)</h3>
              <p className="text-destructive font-semibold mt-1">STAT Priority • Waiting 15 mins</p>
              <p className="text-sm text-muted-foreground mt-1">Patient: Mary Smith (AMC-2026-0004)</p>
              
              <Button size="lg" variant="destructive" className="mt-6" asChild>
                <Link href="/laboratory/requests/DEMO-LAB-ID">
                  Process Result
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
