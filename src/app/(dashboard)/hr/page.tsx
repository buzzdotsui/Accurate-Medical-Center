import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, CalendarDays, Clock, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";

export default function HrDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">HR & Staffing</h1>
          <p className="text-muted-foreground mt-1">Manage personnel records, departments, and shift schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/hr/staff">
              <Users className="w-4 h-4 mr-2" />
              Staff Directory
            </Link>
          </Button>
          <Button asChild>
            <Link href="/hr/schedule">
              <CalendarDays className="w-4 h-4 mr-2" />
              Shift Roster
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">124</div>
            <p className="text-xs text-muted-foreground mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Shift</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <UserCheck className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">38</div>
            <p className="text-xs text-muted-foreground mt-1">Currently clocked in</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Night Shift Deficit</CardTitle>
            <div className="p-2 bg-warning/10 rounded-full">
              <Clock className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">2</div>
            <p className="text-xs text-muted-foreground mt-1">Nurses needed for tonight</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Hires</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <UserPlus className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">5</div>
            <p className="text-xs text-muted-foreground mt-1">Joining this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Staff Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Nursing", count: 52, total: 124, color: "bg-primary" },
                { name: "Physicians", count: 24, total: 124, color: "bg-info" },
                { name: "Laboratory", count: 12, total: 124, color: "bg-warning" },
                { name: "Administration", count: 18, total: 124, color: "bg-muted-foreground" },
                { name: "Pharmacy", count: 10, total: 124, color: "bg-success" },
              ].map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.count} Staff ({(dept.count/dept.total*100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${dept.color}`} style={{ width: `${(dept.count / dept.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Shifts Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-warning/5 border-warning/20">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Schedule Gap Detected</h3>
              <p className="text-warning-foreground font-medium mt-1">ICU Night Shift (Aug 08)</p>
              <p className="text-sm text-muted-foreground mt-1">Only 1 Registered Nurse assigned. Minimum required is 3.</p>
              
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/hr/schedule">
                  Resolve Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
