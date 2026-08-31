"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  UserCheck,
  XCircle,
  CalendarClock,
  AlertTriangle,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RescheduleDialog } from "@/components/appointments/reschedule-dialog";

// Status transition map mirrors AppointmentService.VALID_TRANSITIONS
const VALID_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ["ARRIVED", "CANCELLED", "NO_SHOW", "CHECKED_IN"],
  CHECKED_IN: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

// Statuses that admin/reception can reschedule
const RESCHEDULABLE = ["SCHEDULED", "CHECKED_IN"];

interface Appointment {
  id: string;
  status: string;
  date: string;
  timeSlot?: string | null;
  appointmentId?: string;
}

interface AppointmentActionsProps {
  appointment: Appointment;
  onRefresh: () => void;
  /** If true, show a compact row of icon buttons (for tables). Default: false = labeled buttons. */
  compact?: boolean;
}

/**
 * AppointmentActions
 *
 * Renders contextual action buttons for an appointment based on its current
 * status and the valid state-machine transitions. All status changes go through:
 *   PATCH /api/v1/appointments/[id]/status
 * which delegates to AppointmentService.updateStatus (audit + validation).
 *
 * Reschedule goes through:
 *   PATCH /api/v1/appointments/[id]/reschedule
 * which delegates to AppointmentService.reschedule.
 */
export function AppointmentActions({ appointment, onRefresh, compact = false }: AppointmentActionsProps) {
  const [pending, setPending] = React.useState<string | null>(null);
  const [showCancel, setShowCancel] = React.useState(false);
  const [showNoShow, setShowNoShow] = React.useState(false);
  const [showReschedule, setShowReschedule] = React.useState(false);

  const valid = VALID_TRANSITIONS[appointment.status] ?? [];
  const canCheckIn = valid.includes("CHECKED_IN");
  const canArrive = valid.includes("ARRIVED");
  const canCancel = valid.includes("CANCELLED");
  const canNoShow = valid.includes("NO_SHOW");
  const canReschedule = RESCHEDULABLE.includes(appointment.status);

  async function updateStatus(status: string) {
    setPending(status);
    try {
      const res = await fetch(`/api/v1/appointments/${appointment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Action failed", { description: json?.error?.message ?? "Could not update appointment." });
        return;
      }
      const labels: Record<string, string> = {
        CHECKED_IN: "Patient checked in",
        ARRIVED: "Patient marked as arrived — added to clinical queue",
        CANCELLED: "Appointment cancelled",
        NO_SHOW: "Marked as no-show",
        COMPLETED: "Appointment completed",
      };
      toast.success(labels[status] ?? `Status updated to ${status}`);
      onRefresh();
    } catch {
      toast.error("Network error", { description: "Could not reach the server." });
    } finally {
      setPending(null);
    }
  }

  if (valid.length === 0 && !canReschedule) {
    return <span className="text-xs text-muted-foreground italic">{appointment.status}</span>;
  }

  const isLoading = (s: string) => pending === s;

  if (compact) {
    return (
      <>
        <div className="flex items-center justify-end gap-1">
          {canCheckIn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Check In"
              disabled={pending !== null}
              onClick={() => updateStatus("CHECKED_IN")}
            >
              {isLoading("CHECKED_IN") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            </Button>
          )}
          {canArrive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Mark Arrived"
              disabled={pending !== null}
              onClick={() => updateStatus("ARRIVED")}
            >
              {isLoading("ARRIVED") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
            </Button>
          )}
          {canReschedule && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              title="Reschedule"
              disabled={pending !== null}
              onClick={() => setShowReschedule(true)}
            >
              <CalendarClock className="w-3.5 h-3.5" />
            </Button>
          )}
          {canNoShow && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              title="No-Show"
              disabled={pending !== null}
              onClick={() => setShowNoShow(true)}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Cancel"
              disabled={pending !== null}
              onClick={() => setShowCancel(true)}
            >
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={showCancel}
          onOpenChange={setShowCancel}
          title="Cancel Appointment?"
          description="This appointment will be marked as Cancelled. This action cannot be undone."
          confirmText="Cancel Appointment"
          variant="destructive"
          onConfirm={() => { setShowCancel(false); updateStatus("CANCELLED"); }}
        />
        <ConfirmDialog
          open={showNoShow}
          onOpenChange={setShowNoShow}
          title="Mark as No-Show?"
          description="The patient did not attend. Mark this appointment as No-Show?"
          confirmText="Mark No-Show"
          variant="warning"
          onConfirm={() => { setShowNoShow(false); updateStatus("NO_SHOW"); }}
        />
        <RescheduleDialog
          open={showReschedule}
          onOpenChange={setShowReschedule}
          appointmentId={appointment.id}
          currentDate={appointment.date}
          currentTimeSlot={appointment.timeSlot}
          onSuccess={onRefresh}
        />
      </>
    );
  }

  // Non-compact: labeled buttons
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canCheckIn && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            disabled={pending !== null}
            onClick={() => updateStatus("CHECKED_IN")}
          >
            {isLoading("CHECKED_IN") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Check In
          </Button>
        )}
        {canArrive && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
            disabled={pending !== null}
            onClick={() => updateStatus("ARRIVED")}
          >
            {isLoading("ARRIVED") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
            Mark Arrived
          </Button>
        )}
        {canReschedule && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
            disabled={pending !== null}
            onClick={() => setShowReschedule(true)}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Reschedule
          </Button>
        )}
        {canNoShow && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-orange-700 border-orange-300 hover:bg-orange-50"
            disabled={pending !== null}
            onClick={() => setShowNoShow(true)}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            No-Show
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={pending !== null}
            onClick={() => setShowCancel(true)}
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Appointment?"
        description="This appointment will be marked as Cancelled. This action cannot be undone."
        confirmText="Cancel Appointment"
        variant="destructive"
        onConfirm={() => { setShowCancel(false); updateStatus("CANCELLED"); }}
      />
      <ConfirmDialog
        open={showNoShow}
        onOpenChange={setShowNoShow}
        title="Mark as No-Show?"
        description="The patient did not attend. Mark this appointment as No-Show?"
        confirmText="Mark No-Show"
        variant="warning"
        onConfirm={() => { setShowNoShow(false); updateStatus("NO_SHOW"); }}
      />
      <RescheduleDialog
        open={showReschedule}
        onOpenChange={setShowReschedule}
        appointmentId={appointment.id}
        currentDate={appointment.date}
        currentTimeSlot={appointment.timeSlot}
        onSuccess={onRefresh}
      />
    </>
  );
}
