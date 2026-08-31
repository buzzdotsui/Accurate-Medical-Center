"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInYears } from "date-fns";
import {
  ArrowLeft,
  UserCheck,
  UserX,
  Pencil,
  Save,
  X,
  CalendarDays,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { DataTable, Column } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UpdatePatientSchema, type UpdatePatientInput } from "@/lib/validations/patient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  bloodGroup: string | null;
  genotype: string | null;
  branchId: string;
  deletedAt: string | null;
  createdAt: string;
}

interface Appointment {
  id: string;
  date: string;
  timeSlot: string | null;
  type: string;
  status: string;
  reason: string | null;
}

interface TimelineEvent {
  id: string;
  type: "VISIT" | "APPOINTMENT" | "INVOICE" | "DIAGNOSIS";
  date: string;
  title: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  NO_SHOW: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

const TIMELINE_COLORS: Record<string, string> = {
  VISIT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40",
  APPOINTMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40",
  INVOICE: "bg-green-100 text-green-700 dark:bg-green-900/40",
  DIAGNOSIS: "bg-red-100 text-red-700 dark:bg-red-900/40",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReceptionPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<"overview" | "appointments" | "history">("overview");
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmStatus, setConfirmStatus] = React.useState<"activate" | "deactivate" | null>(null);

  // ── Fetch patient ─────────────────────────────────────────────────────────
  const {
    data: patientData,
    isLoading: patientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useQuery({
    queryKey: ["reception_patient", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      return res.json();
    },
    enabled: !!id,
  });

  const patient: Patient | null = patientData?.data ?? null;

  // ── Fetch appointments ────────────────────────────────────────────────────
  const { data: apptsData, isLoading: apptsLoading } = useQuery({
    queryKey: ["reception_patient_appointments", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/appointments?patientId=${id}&take=50`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!id && activeTab === "appointments",
  });

  const appointments: Appointment[] = apptsData?.data?.appointments ?? [];

  // ── Fetch timeline (admin-filtered — no DIAGNOSIS events) ─────────────────
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["reception_patient_timeline", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients/${id}/timeline`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!id && activeTab === "history",
  });

  const timeline: TimelineEvent[] = timelineData?.data ?? [];

  // ── Update patient ────────────────────────────────────────────────────────
  const form = useForm<UpdatePatientInput>({
    resolver: zodResolver(UpdatePatientSchema),
  });

  React.useEffect(() => {
    if (patient) {
      form.reset({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        gender: (patient.gender as "MALE" | "FEMALE" | "OTHER") ?? undefined,
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: patient.address ?? "",
        bloodGroup: (patient.bloodGroup as UpdatePatientInput["bloodGroup"]) ?? undefined,
        genotype: (patient.genotype as UpdatePatientInput["genotype"]) ?? undefined,
      });
    }
  }, [patient, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePatientInput) => {
      const res = await fetch(`/api/v1/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message ?? "Failed to update patient");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Patient information updated");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["reception_patient", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Status toggle ─────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await fetch(`/api/v1/patients/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message ?? "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_data, isActive) => {
      toast.success(isActive ? "Patient reactivated" : "Patient deactivated");
      setConfirmStatus(null);
      queryClient.invalidateQueries({ queryKey: ["reception_patient", id] });
      queryClient.invalidateQueries({ queryKey: ["reception_patients"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Loading / error ───────────────────────────────────────────────────────
  if (patientLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingState message="Loading patient record…" />
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <ErrorState
        title="Patient not found"
        description="This patient could not be loaded. They may not exist or you may not have access."
        onRetry={() => refetchPatient()}
      />
    );
  }

  const isActive = !patient.deletedAt;
  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(patient.dateOfBirth))
    : null;

  // ── Appointment columns ───────────────────────────────────────────────────
  const apptColumns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: (row) =>
        row.date ? format(new Date(String(row.date)), "dd MMM yyyy") : "—",
    },
    {
      accessorKey: "timeSlot",
      header: "Time",
      cell: (row) => String(row.timeSlot ?? "—"),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline" className="text-xs capitalize">
          {String(row.type ?? "").toLowerCase().replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const s = String(row.status ?? "");
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[s] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{String(row.reason ?? "—")}</span>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reception/patients" aria-label="Back to patients">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Patient record — reception view</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => { setIsEditing(false); form.reset(); }}
                disabled={updateMutation.isPending}
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={form.handleSubmit((d) => updateMutation.mutate(d))}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsEditing(true)}
                id="edit-patient-btn"
              >
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              {isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => setConfirmStatus("deactivate")}
                  id="deactivate-patient-btn"
                >
                  <UserX className="w-4 h-4" /> Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-green-700 border-green-500/50 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                  onClick={() => setConfirmStatus("activate")}
                  id="activate-patient-btn"
                >
                  <UserCheck className="w-4 h-4" /> Activate
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patient ID + status pill */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 border">
        <span className="font-mono text-sm font-bold text-primary tracking-wider">
          {patient.patientId}
        </span>
        <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs">
          {isActive ? "Active" : "Inactive"}
        </Badge>
        {patient.gender && (
          <Badge variant="outline" className="text-xs capitalize">
            {GENDER_LABELS[patient.gender] ?? patient.gender}
          </Badge>
        )}
        {age !== null && (
          <span className="text-sm text-muted-foreground">{age} yrs old</span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          Registered {format(new Date(patient.createdAt), "dd MMM yyyy")}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-0">
        {(["overview", "appointments", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="First Name" htmlFor="rec-edit-firstName" error={form.formState.errors.firstName?.message} required>
                      <Input id="rec-edit-firstName" {...form.register("firstName")} />
                    </FormField>
                    <FormField label="Last Name" htmlFor="rec-edit-lastName" error={form.formState.errors.lastName?.message} required>
                      <Input id="rec-edit-lastName" {...form.register("lastName")} />
                    </FormField>
                  </div>
                  <FormField label="Gender" htmlFor="rec-edit-gender">
                    <Select id="rec-edit-gender" {...form.register("gender")}>
                      <option value="">— Select —</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </FormField>
                  <FormField label="Date of Birth" htmlFor="rec-edit-dob">
                    <Input id="rec-edit-dob" type="date" {...form.register("dateOfBirth")} max={new Date().toISOString().split("T")[0]} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Blood Group" htmlFor="rec-edit-bloodGroup">
                      <Select id="rec-edit-bloodGroup" {...form.register("bloodGroup")}>
                        <option value="">— Unknown —</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label="Genotype" htmlFor="rec-edit-genotype">
                      <Select id="rec-edit-genotype" {...form.register("genotype")}>
                        <option value="">— Unknown —</option>
                        {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </>
              ) : (
                <dl className="space-y-3 text-sm">
                  <InfoRow label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
                  <InfoRow label="Gender" value={patient.gender ? GENDER_LABELS[patient.gender] ?? patient.gender : null} />
                  <InfoRow
                    label="Date of Birth"
                    value={
                      patient.dateOfBirth
                        ? `${format(new Date(patient.dateOfBirth), "dd MMM yyyy")} (${age} yrs)`
                        : null
                    }
                  />
                  <InfoRow label="Blood Group" value={patient.bloodGroup} />
                  <InfoRow label="Genotype" value={patient.genotype} />
                </dl>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <FormField label="Phone" htmlFor="rec-edit-phone" error={form.formState.errors.phone?.message}>
                    <Input id="rec-edit-phone" type="tel" {...form.register("phone")} />
                  </FormField>
                  <FormField label="Email" htmlFor="rec-edit-email" error={form.formState.errors.email?.message}>
                    <Input id="rec-edit-email" type="email" {...form.register("email")} />
                  </FormField>
                  <FormField label="Address" htmlFor="rec-edit-address">
                    <Input id="rec-edit-address" {...form.register("address")} />
                  </FormField>
                </>
              ) : (
                <dl className="space-y-3 text-sm">
                  <InfoRow label="Phone" value={patient.phone} />
                  <InfoRow label="Email" value={patient.email} />
                  <InfoRow label="Address" value={patient.address} />
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Appointments ──────────────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {apptsLoading ? (
            <div className="p-8">
              <LoadingState message="Loading appointments…" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CalendarDays className="w-full h-full" />}
                title="No appointments yet"
                description="This patient has no recorded appointments."
              />
            </div>
          ) : (
            <DataTable
              columns={apptColumns}
              data={appointments as unknown as Record<string, unknown>[]}
              pageSize={15}
            />
          )}
        </div>
      )}

      {/* ── History ───────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div>
          {timelineLoading ? (
            <div className="h-40 flex items-center justify-center">
              <LoadingState message="Loading history…" />
            </div>
          ) : timeline.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-full h-full" />}
              title="No history yet"
              description="Patient activity (visits, appointments, invoices) will appear here."
            />
          ) : (
            <ol className="relative border-l border-border ml-3 space-y-6">
              {timeline.map((event) => (
                <li key={event.id} className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        TIMELINE_COLORS[event.type] ?? "bg-muted"
                      }`}
                    />
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        TIMELINE_COLORS[event.type] ?? "bg-muted"
                      }`}
                    >
                      {event.type}
                    </span>
                    <time className="text-xs text-muted-foreground sm:ml-2">
                      {format(new Date(event.date), "dd MMM yyyy")}
                    </time>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Confirm status change */}
      <ConfirmDialog
        open={confirmStatus !== null}
        onOpenChange={(open) => !open && setConfirmStatus(null)}
        title={confirmStatus === "deactivate" ? "Deactivate Patient?" : "Reactivate Patient?"}
        description={
          confirmStatus === "deactivate"
            ? "The patient will be marked inactive. This can be reversed by an administrator."
            : "The patient record will be restored to active status."
        }
        confirmText={confirmStatus === "deactivate" ? "Deactivate" : "Activate"}
        variant={confirmStatus === "deactivate" ? "destructive" : "default"}
        onConfirm={() => statusMutation.mutate(confirmStatus === "activate")}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// InfoRow sub-component
// ---------------------------------------------------------------------------
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">
        {value ?? <span className="text-muted-foreground font-normal italic">Not provided</span>}
      </dd>
    </div>
  );
}
