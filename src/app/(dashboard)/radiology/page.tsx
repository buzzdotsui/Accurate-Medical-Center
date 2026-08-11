import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Bone, Activity, Radiation, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function RadiologyDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Radiology Portal</h1>
          <p className="text-muted-foreground mt-1">Manage scan requests, upload DICOM images, and publish diagnostic reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/radiology/requests">
              <Radiation className="w-4 h-4 mr-2" />
              Active Imaging Queue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Scans</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">18</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting acquisition</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unreported Scans</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <ImageIcon className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">5</div>
            <p className="text-xs text-muted-foreground mt-1">Images acquired, needs report</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">STAT / Urgent</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Bone className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground mt-1">High priority requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Next Priority Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-destructive/5 border-destructive/20">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Radiation className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">CT Scan (Chest)</h3>
              <p className="text-destructive font-semibold mt-1">STAT Priority • Waiting 12 mins</p>
              <p className="text-sm text-muted-foreground mt-1">Patient: Mary Smith (AMC-2026-0004)</p>
              
              <Button size="lg" variant="destructive" className="mt-6" asChild>
                <Link href="/radiology/requests/DEMO-RAD-ID">
                  Begin Diagnostic Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
