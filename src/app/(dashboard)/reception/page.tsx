import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CalendarCheck, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function ReceptionDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reception Portal</h1>
          <p className="text-muted-foreground mt-1">Manage patient registrations and today's appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/reception/patients/new">
              <UserPlus className="w-4 h-4 mr-2" />
              Register Patient
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">12 arrived, 30 waiting</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Registrations</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Patients registered today</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Wait Time</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14m</div>
            <p className="text-xs text-success mt-1">↓ 2m from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mb-4 opacity-20" />
              <p>Appointments will stream here dynamically.</p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="/reception/appointments">View All Appointments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Patient Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p>Quickly search or manage patient records.</p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="/reception/patients">Browse Patients</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
