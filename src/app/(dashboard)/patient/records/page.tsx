"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Info, RefreshCw, Stethoscope, Calendar, ClipboardList, User, Shield } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PatientDashboardData {
  appointmentCount: number;
  visitCount: number;
  prescriptionCount: number;
}

interface Appointment {
  id: string;
  appointmentId: string;
  date: string;
  timeSlot: string | null;
  status: string;
  reason: string | null;
  staff: { user: { name: string } } | null;
}

interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

export default function MyRecordsPage() {
  const dashboardQuery = useQuery<PatientDashboardData>({
    queryKey: ["patient_self_dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/v1/patients/self/dashboard");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load records summary");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const appointmentsQuery = useQuery<AppointmentsResponse>({
    queryKey: ["patient_appointments_history"],
    queryFn: async () => {
      const res = await fetch("/api/v1/appointments?take=50");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load visit history");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const isLoading = dashboardQuery.isLoading || appointmentsQuery.isLoading;
  const isFetching = dashboardQuery.isFetching || appointmentsQuery.isFetching;
  const firstError = dashboardQuery.error ?? appointmentsQuery.error;

  const completedVisits =
    appointmentsQuery.data?.appointments.filter((apt) => apt.status === "COMPLETED") ?? [];
  const upcomingAppointments =
    appointmentsQuery.data?.appointments.filter((apt) => apt.status === "SCHEDULED" || apt.status === "CHECKED_IN") ?? [];

  function handleRefresh() {
    dashboardQuery.refetch();
    appointmentsQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Records</h1>
          <p className="text-muted-foreground mt-1">
            Access your medical and administrative records at Accurate Medical Center.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {firstError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(firstError as Error).message}
          <Button
            variant="link"
            size="sm"
            className="ml-2 h-auto p-0 text-destructive underline"
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tabs for Medical vs Administrative Records */}
      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="medical">
            <Stethoscope className="mr-2 h-4 w-4" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="administrative">
            <ClipboardList className="mr-2 h-4 w-4" />
            Administrative Records
          </TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="medical">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Completed Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{completedVisits.length}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{dashboardQuery.data?.prescriptionCount ?? 0}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informational notice */}
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                For detailed clinical notes, diagnoses, and full medical records, please contact
                reception or speak with your doctor directly.
              </span>
            </div>

            {/* Completed visits list */}
            <div>
              <h2 className="mb-3 text-lg font-semibold">Recent Clinical Visits</h2>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : completedVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center px-4">
                  <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-base font-semibold">No completed visits yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your visit history will appear here after your appointments are completed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedVisits.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Badge variant="outline" className="text-xs">COMPLETED</Badge>
                          {new Date(apt.date).toLocaleDateString("en-NG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {apt.reason && (
                          <div className="text-sm text-muted-foreground">Reason: {apt.reason}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Doctor: {apt.staff?.user?.name ?? "Not assigned"}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {apt.appointmentId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming appointments */}
            <div>
              <h2 className="mb-3 text-lg font-semibold">Upcoming Appointments</h2>

              {upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center px-4">
                  <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-base font-semibold">No upcoming appointments</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your scheduled appointments will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Badge variant="secondary" className="text-xs">{apt.status}</Badge>
                          {new Date(apt.date).toLocaleDateString("en-NG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {apt.reason && (
                          <div className="text-sm text-muted-foreground">Reason: {apt.reason}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Doctor: {apt.staff?.user?.name ?? "Not assigned"}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {apt.appointmentId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Administrative Records Tab */}
        <TabsContent value="administrative">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full gap-2">
                    <span>View Profile</span>
                    <User className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full gap-2">
                    <span>My Appointments</span>
                    <Calendar className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Consent Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <span>View Documents</span>
                    <Shield className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Administrative records include your registration details, appointment history,
                consent forms, and account information. Medical records (clinical notes, diagnoses)
                are in the Medical Records tab.
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
