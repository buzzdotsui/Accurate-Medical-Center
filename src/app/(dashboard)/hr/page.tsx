"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { Users, UserCheck, UserX, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

interface StaffMember {
  id: string;
  staffId: string;
  isActive: boolean;
  user: { name: string; email: string; role: string };
  department: { name: string; code: string } | null;
}

const DEPT_COLORS = [
  "bg-primary",
  "bg-info",
  "bg-warning",
  "bg-success",
  "bg-destructive",
  "bg-muted-foreground",
];

export default function HrDashboard() {
  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<StaffMember[]>({
    queryKey: ["hr-staff"],
    queryFn: async () => {
      const res = await fetch("/api/v1/hr/staff");
      if (!res.ok) throw new Error(`Failed to load staff: ${res.statusText}`);
      const json = await res.json();
      return json.data as StaffMember[];
    },
  });

  const activeCount = staff.filter((s) => s.isActive).length;
  const inactiveCount = staff.filter((s) => !s.isActive).length;

  const deptMap = staff.reduce<Record<string, number>>((acc, s) => {
    const name = s.department?.name ?? "No Department";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{staff.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">All registered staff</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <UserCheck className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-success">{activeCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Currently employed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Staff</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <UserX className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-muted-foreground">{inactiveCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Deactivated accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Staff by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {isError ? (
              <ErrorState
                title="Failed to load staff"
                description={(error as Error).message}
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : deptEntries.length === 0 ? (
              <EmptyState
                icon={<Users className="w-full h-full" />}
                title="No department data"
                description="Staff department information will appear here."
              />
            ) : (
              <div className="space-y-5">
                {deptEntries.map(([dept, count], idx) => (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept}</span>
                      <span className="text-muted-foreground">
                        {count} Staff ({staff.length > 0 ? ((count / staff.length) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${DEPT_COLORS[idx % DEPT_COLORS.length]}`}
                        style={{ width: `${staff.length > 0 ? (count / staff.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shift Scheduling — Coming Soon */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Shift Scheduling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/5 border-dashed">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Shift scheduling and roster management are under development and will be available shortly.
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/hr/schedule">View Roster</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Overview Table */}
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Staff Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to load staff"
                description={(error as Error).message}
                onRetry={() => refetch()}
              />
            </div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Users className="w-full h-full" />}
                title="No staff found"
                description="Staff members will appear here once they are created."
              />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b transition-colors">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Name / ID</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Department</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Contact</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-foreground">{member.user.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{member.staffId}</div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <Badge variant="outline" className="text-xs">
                          {ROLE_LABELS[member.user.role as Role] ?? member.user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 align-middle text-sm">
                        {member.department ? (
                          <span>
                            {member.department.name}
                            <span className="ml-1 text-xs text-muted-foreground">({member.department.code})</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-muted-foreground">
                        {member.user.email}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
