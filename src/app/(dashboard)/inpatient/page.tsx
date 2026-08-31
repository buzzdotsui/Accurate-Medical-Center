"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Bed, Users, Activity, LogOut, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

interface Admission {
  id: string;
  admissionId: string;
  admittedAt: string;
  reason: string;
  status: string;
  patient: { firstName: string; lastName: string; patientId: string };
  doctor: { user: { name: string } };
  bed: {
    bedNumber: string;
    room: { roomNumber: string; ward: { name: string; type: string } };
  } | null;
}

interface WardBed {
  id: string;
  status: string;
}

interface WardRoom {
  id: string;
  beds: WardBed[];
}

interface Ward {
  id: string;
  name: string;
  type: string;
  rooms: WardRoom[];
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatWardType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function InpatientDashboard() {
  const {
    data: admissions = [],
    isLoading: loadingAdmissions,
    isError: isAdmissionsError,
    error: admissionsError,
    refetch: refetchAdmissions,
  } = useQuery<Admission[]>({
    queryKey: ["inpatient-admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/admissions");
      if (!res.ok) throw new Error(`Failed to load admissions: ${res.statusText}`);
      const json = await res.json();
      return json.data as Admission[];
    },
  });

  const {
    data: wards = [],
    isLoading: loadingWards,
    isError: isWardsError,
    error: wardsError,
    refetch: refetchWards,
  } = useQuery<Ward[]>({
    queryKey: ["inpatient-wards"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/wards");
      if (!res.ok) throw new Error(`Failed to load wards: ${res.statusText}`);
      const json = await res.json();
      return json.data as Ward[];
    },
  });

  const isLoading = loadingAdmissions || loadingWards;
  const admittedToday = admissions.filter((a) => isToday(a.admittedAt)).length;

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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Admissions</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{admissions.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Patients currently in wards</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admitted Today</CardTitle>
            <div className="p-2 bg-success/10 rounded-full">
              <Bed className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-success">{admittedToday}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">New admissions today</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wards Active</CardTitle>
            <div className="p-2 bg-info/10 rounded-full">
              <Activity className="w-4 h-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-12 mt-1" />
            ) : (
              <div className="text-3xl font-bold text-info">{wards.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Operational wards</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discharged Today</CardTitle>
            <div className="p-2 bg-muted rounded-full">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">—</div>
            <p className="text-xs text-muted-foreground mt-1">Not yet tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmissionsError ? (
              <ErrorState
                title="Failed to load admissions"
                description={(admissionsError as Error).message}
                onRetry={() => refetchAdmissions()}
              />
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : admissions.length === 0 ? (
              <EmptyState
                icon={<Bed className="w-full h-full" />}
                title="No active admissions"
                description="Admitted patients will appear here."
              />
            ) : (
              <div className="space-y-3">
                {admissions.slice(0, 5).map((admission) => (
                  <div key={admission.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full shrink-0">
                        <Bed className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {admission.patient.firstName} {admission.patient.lastName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {admission.patient.patientId}
                          {admission.bed ? ` • ${admission.bed.room.ward.name}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{admission.reason}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge variant="outline" className="text-xs text-primary border-primary/30">Admitted</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(admission.admittedAt)}</div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-2 text-primary" asChild>
                  <Link href="/inpatient/admissions">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ward Capacities */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Ward Capacities</CardTitle>
          </CardHeader>
          <CardContent>
            {isWardsError ? (
              <ErrorState
                title="Failed to load wards"
                description={(wardsError as Error).message}
                onRetry={() => refetchWards()}
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
            ) : wards.length === 0 ? (
              <EmptyState
                icon={<Activity className="w-full h-full" />}
                title="No wards found"
                description="Ward data will appear here once wards are configured."
              />
            ) : (
              <div className="space-y-5">
                {wards.map((ward) => {
                  const allBeds = ward.rooms.flatMap((r) => r.beds);
                  const total = allBeds.length;
                  const occupied = allBeds.filter((b) => b.status === "OCCUPIED").length;
                  const pct = total > 0 ? (occupied / total) * 100 : 0;
                  const isHigh = pct >= 80;
                  return (
                    <div key={ward.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{ward.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{formatWardType(ward.type)}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {total > 0 ? `${occupied} / ${total} Beds` : "No beds"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${isHigh ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Admissions Table */}
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-lg">All Active Admissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isAdmissionsError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to load admissions"
                description={(admissionsError as Error).message}
                onRetry={() => refetchAdmissions()}
              />
            </div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : admissions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Bed className="w-full h-full" />}
                title="No active admissions"
                description="Admitted patients will appear here."
              />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b transition-colors">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient ID</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Reason</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Doctor</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Ward</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Admitted At</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {admissions.map((admission) => (
                    <tr key={admission.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 align-middle font-semibold">
                        {admission.patient.firstName} {admission.patient.lastName}
                      </td>
                      <td className="px-6 py-4 align-middle text-xs text-muted-foreground">
                        {admission.patient.patientId}
                      </td>
                      <td className="px-6 py-4 align-middle max-w-[180px] truncate text-sm">
                        {admission.reason}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm">
                        {admission.doctor.user.name}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm">
                        {admission.bed ? (
                          admission.bed.room.ward.name
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-muted-foreground">
                        {formatDate(admission.admittedAt)}
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
