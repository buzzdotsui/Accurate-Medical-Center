"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Info, RefreshCw, FolderOpen, Stethoscope, Calendar, User, Shield, HeartPulse, FileHeart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/ui/greeting";
import type { User } from "better-auth";

interface PatientDashboardData {
  appointmentCount: number;
  labRequestCount: number;
  prescriptionCount: number;
  pendingInvoiceTotal: number;
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

interface MedicalRecordSummary {
  totalVisits: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  totalLabRequests: number;
}

const SUMMARY_STATS = [
  { key: "appointmentCount" as const, label: "Total Appointments", icon: Calendar },
  { key: "labRequestCount" as const, label: "Lab Tests Ordered", icon: Stethoscope },
  { key: "prescriptionCount" as const, label: "Prescriptions Issued", icon: FileText },
];

interface PatientRecordsPageProps {
  user?: User;
}

export default function MyRecordsPage({ user }: PatientRecordsPageProps) {
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
    appointmentsQuery.data?.appointments.filter((apt) => apt.status === "SCHEDULED" || apt.status === "CHECKED_IN" || apt.status === "ARRIVED") ?? [];

  function handleRefresh() {
    dashboardQuery.refetch();
    appointmentsQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        title="My Records"
        description="Access your medical and administrative records."
      >
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
      </DashboardHeader>

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

      {/* Records category tabs */}
      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="medical">
            <FileHeart className="h-4 h-4 mr-2" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="administrative">
            <FolderOpen className="w-4 h-4 mr-2" />
            Administrative Records
          </TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="medical" className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <HeartPulse className="h-5 w-5 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Medical Records</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Clinical information from your visits, diagnoses, and treatments.
              </p>
            </div>
          </div>

          {/* Activity summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {SUMMARY_STATS.map((stat) => (
              <Card key={stat.key}>
                <CardHeader className="pb-2 flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {dashboardQuery.data?.[stat.key] ?? 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Informational notice */}
          <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              For detailed clinical notes, diagnoses, and full medical records, please contact
              reception or speak with your doctor directly.
            </span>
          </div>

          {/* Completed visits list - Medical Records */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Clinical Visit History</h2>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : completedVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center px-4">
                <FileHeart className="h-5 w-5 text-green-700 dark:text-green-400" />
                <p className="text-base font-semibold">No completed visits yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your clinical visit history will appear here after your appointments are completed.
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
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {new Date(apt.date).toLocaleDateString("en-NG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
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
        </TabsContent>

        {/* Administrative Records Tab */}
        <TabsContent value="administrative" className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FolderOpen className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Administrative Records</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your account info, appointments, billing, and operational records.
              </p>
            </div>
          </div>

          {/* Account & Profile Info */}
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4 flex items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">
                    <Badge variant="secondary">{user?.role?.replace(/_/g, " ") || "Patient"}</Badge>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email Verified</p>
                  <p className="font-medium">{user?.emailVerified ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments - Administrative View */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Appointment Records</h2>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 && completedVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center px-4">
                <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-base font-semibold">No appointments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your appointment history will appear here once you book appointments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Upcoming</h3>
                    {upcomingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {new Date(apt.date).toLocaleDateString("en-NG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {apt.status?.toLowerCase().replace("_", " ") || "Scheduled"}
                            </Badge>
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

                {/* Past Appointments */}
                {completedVisits.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Completed</h3>
                    {completedVisits.slice(0, 10).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {new Date(apt.date).toLocaleDateString("en-NG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
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
            )}
          </div>

          {/* Data Access & Privacy */}
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4 flex items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Data Access & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your data is protected</p>
                  <p className="text-muted-foreground">All medical and administrative records are stored securely and accessed only by authorized staff.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Request your data</p>
                  <p className="text-muted-foreground">You can request a copy of your records at any time by contacting reception.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}