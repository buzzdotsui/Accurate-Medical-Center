"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarPlus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { BookAppointmentDialog } from "@/components/admin/appointments/book-appointment-dialog";
import { AppointmentActions } from "@/components/appointments/appointment-actions";

// ---------------------------------------------------------------------------
// Status badge colours
// ---------------------------------------------------------------------------
const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CHECKED_IN:  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ARRIVED:     "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  COMPLETED:   "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED:   "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  NO_SHOW:     "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "SCHEDULED",   label: "Scheduled" },
  { value: "CHECKED_IN",  label: "Checked In" },
  { value: "ARRIVED",     label: "Arrived" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
  { value: "CANCELLED",   label: "Cancelled" },
  { value: "NO_SHOW",     label: "No-Show" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [dateFilter, setDateFilter] = React.useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = React.useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin_appointments", dateFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ take: "100" });
      if (dateFilter)    params.set("date",   dateFilter);
      if (statusFilter)  params.set("status", statusFilter);
      const res = await fetch(`/api/v1/appointments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
  });

  const appointments: Record<string, unknown>[] = data?.data?.appointments ?? [];
  const total: number = data?.data?.total ?? 0;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["admin_appointments"] });
  }

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "appointmentId",
      header: "Appt ID",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary/8 rounded px-1.5 py-0.5 whitespace-nowrap">
          {String(row.appointmentId ?? "—")}
        </span>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: (row) => {
        const p = row.patient as Record<string, unknown> | null;
        if (!p) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div>
            <p className="font-medium text-foreground text-sm">
              {String(p.firstName ?? "")} {String(p.lastName ?? "")}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{String(p.patientId ?? "")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
      cell: (row) => {
        const s = row.staff as Record<string, unknown> | null;
        if (!s) return <span className="text-muted-foreground text-sm">Unassigned</span>;
        const u = s.user as Record<string, unknown>;
        return <span className="text-sm">Dr. {String(u?.name ?? "")}</span>;
      },
    },
    {
      accessorKey: "date",
      header: "Date / Time",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">
            {row.date ? format(new Date(String(row.date)), "dd MMM yyyy") : "—"}
          </p>
          <p className="text-xs text-muted-foreground">{String(row.timeSlot ?? "Any time")}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline" className="text-xs capitalize whitespace-nowrap">
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
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[s] ?? "bg-muted text-muted-foreground"}`}>
            {s.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: (row) => (
        <div className="flex justify-end">
          <AppointmentActions
            compact
            appointment={{
              id: String(row.id ?? ""),
              status: String(row.status ?? ""),
              date: String(row.date ?? ""),
              timeSlot: row.timeSlot != null ? String(row.timeSlot) : null,
              appointmentId: String(row.appointmentId ?? ""),
            }}
            onRefresh={handleRefresh}
          />
        </div>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total > 0
              ? `${total.toLocaleString()} appointment${total !== 1 ? "s" : ""} for selected filters`
              : "All scheduled, ongoing, and completed appointments."}
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setOpen(true)} id="book-appointment-btn">
          <CalendarPlus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Date:</label>
          <Input
            id="appt-date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</label>
          <Select
            id="appt-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => { setDateFilter(""); setStatusFilter(""); }}
        >
          Clear filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8"><LoadingState message="Loading appointments…" /></div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Failed to load appointments"
              description={(error as Error).message}
              onRetry={() => refetch()}
            />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Calendar className="w-full h-full" />}
              title="No appointments found"
              description={
                dateFilter || statusFilter
                  ? "No appointments match the selected filters."
                  : "Appointments will appear here once they are booked."
              }
              action={
                !dateFilter && !statusFilter ? (
                  <Button className="gap-2" onClick={() => setOpen(true)}>
                    <CalendarPlus className="w-4 h-4" /> Book Appointment
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <DataTable columns={columns} data={appointments} pageSize={25} />
        )}
      </div>

      <BookAppointmentDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
