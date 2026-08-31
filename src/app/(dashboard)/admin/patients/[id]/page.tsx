"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
  FileText,
  Download,
  Trash2,
  UploadCloud,
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
import { UploadDocumentDialog } from "@/components/admin/patients/upload-document-dialog";
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

interface PatientDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
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
export default function AdminPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<"overview" | "appointments" | "history" | "documents">("overview");
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmStatus, setConfirmStatus] = React.useState<"activate" | "deactivate" | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [deleteDocId, setDeleteDocId] = React.useState<string | null>(null);

  // ── Fetch patient ─────────────────────────────────────────────────────────
  const {
    data: patientData,
    isLoading: patientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useQuery({
    queryKey: ["admin_patient", id],
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
    queryKey: ["admin_patient_appointments", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/appointments?patientId=${id}&take=50`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!id && activeTab === "appointments",
  });

  const appointments: Appointment[] = apptsData?.data?.appointments ?? [];

  // ── Fetch timeline ────────────────────────────────────────────────────────
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["admin_patient_timeline", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients/${id}/timeline`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!id && activeTab === "history",
  });

  const timeline: TimelineEvent[] = timelineData?.data ?? [];

  // ── Fetch documents ───────────────────────────────────────────────────────
  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["admin_patient_documents", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients/${id}/documents`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to fetch documents");
      }
      return res.json();
    },
    enabled: !!id && activeTab === "documents",
  });

  const documents: PatientDocument[] = documentsData?.data ?? [];

  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await fetch(`/api/v1/patients/${id}/documents/${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to delete document");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document deleted");
      setDeleteDocId(null);
      queryClient.invalidateQueries({ queryKey: ["admin_patient_documents", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
      toast.success("Patient updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["admin_patient", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Status toggle (activate / deactivate) ─────────────────────────────────
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
      queryClient.invalidateQueries({ queryKey: ["admin_patient", id] });
      queryClient.invalidateQueries({ queryKey: ["admin_patients"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Loading / error states ─────────────────────────────────────────────────
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
        <span className="text-muted-foreground text-sm">
          {String(row.reason ?? "—")}
        </span>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/patients" aria-label="Back to patients list">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Patient record — administrative view
          </p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
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

      {/* Patient ID + status banner */}
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
      <div className="border-b flex gap-0 overflow-x-auto">
        {(["overview", "appointments", "history", "documents"] as const).map((tab) => (
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

      {/* ── Tab: Overview ──────────────────────────────────────────────────── */}
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
                    <FormField label="First Name" htmlFor="edit-firstName" error={form.formState.errors.firstName?.message} required>
                      <Input id="edit-firstName" {...form.register("firstName")} />
                    </FormField>
                    <FormField label="Last Name" htmlFor="edit-lastName" error={form.formState.errors.lastName?.message} required>
                      <Input id="edit-lastName" {...form.register("lastName")} />
                    </FormField>
                  </div>
                  <FormField label="Gender" htmlFor="edit-gender">
                    <Select id="edit-gender" {...form.register("gender")}>
                      <option value="">— Select —</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </FormField>
                  <FormField label="Date of Birth" htmlFor="edit-dob">
                    <Input id="edit-dob" type="date" {...form.register("dateOfBirth")} max={new Date().toISOString().split("T")[0]} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Blood Group" htmlFor="edit-bloodGroup">
                      <Select id="edit-bloodGroup" {...form.register("bloodGroup")}>
                        <option value="">— Unknown —</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label="Genotype" htmlFor="edit-genotype">
                      <Select id="edit-genotype" {...form.register("genotype")}>
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
                  <FormField label="Phone" htmlFor="edit-phone" error={form.formState.errors.phone?.message}>
                    <Input id="edit-phone" type="tel" {...form.register("phone")} />
                  </FormField>
                  <FormField label="Email" htmlFor="edit-email" error={form.formState.errors.email?.message}>
                    <Input id="edit-email" type="email" {...form.register("email")} />
                  </FormField>
                  <FormField label="Address" htmlFor="edit-address">
                    <Input id="edit-address" {...form.register("address")} />
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

      {/* ── Tab: Appointments ──────────────────────────────────────────────── */}
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

      {/* ── Tab: History ───────────────────────────────────────────────────── */}
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

      {/* ── Tab: Documents ──────────────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium text-sm text-foreground">Patient Documents</h3>
            <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
              <UploadCloud className="w-4 h-4" /> Upload Document
            </Button>
          </div>
          {documentsLoading ? (
            <div className="p-8">
              <LoadingState message="Loading documents…" />
            </div>
          ) : documentsError ? (
            <div className="p-8">
              <ErrorState
                title="Failed to load documents"
                description={(documentsError as Error).message}
                onRetry={() => refetchDocuments()}
              />
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FileText className="w-full h-full" />}
                title="No documents uploaded yet"
                description="Scanned reports, referral letters, and other files attached to this patient will appear here."
                action={
                  <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
                    <UploadCloud className="w-4 h-4" /> Upload Document
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.fileType} · Uploaded {format(new Date(doc.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                      onClick={() => setDeleteDocId(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Confirm deactivate/activate */}
      <ConfirmDialog
        open={confirmStatus !== null}
        onOpenChange={(open) => !open && setConfirmStatus(null)}
        title={confirmStatus === "deactivate" ? "Deactivate Patient?" : "Reactivate Patient?"}
        description={
          confirmStatus === "deactivate"
            ? "The patient record will be marked as inactive. They will no longer appear in active patient lists. This can be reversed."
            : "The patient record will be restored and made active again."
        }
        confirmText={confirmStatus === "deactivate" ? "Deactivate" : "Activate"}
        variant={confirmStatus === "deactivate" ? "destructive" : "default"}
        onConfirm={() => statusMutation.mutate(confirmStatus === "activate")}
        isLoading={statusMutation.isPending}
      />

      {/* Upload document dialog */}
      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        patientId={id}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin_patient_documents", id] })}
      />

      {/* Confirm delete document */}
      <ConfirmDialog
        open={deleteDocId !== null}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
        title="Delete Document?"
        description="This document will be permanently removed from the patient's record. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteDocId) deleteDocumentMutation.mutate(deleteDocId);
        }}
        isLoading={deleteDocumentMutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: read-only info row
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
