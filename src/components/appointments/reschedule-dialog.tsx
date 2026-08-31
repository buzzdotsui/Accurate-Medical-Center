"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const RescheduleFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().optional().or(z.literal("")),
});

type RescheduleFormInput = z.infer<typeof RescheduleFormSchema>;

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  currentDate?: string;
  currentTimeSlot?: string | null;
  onSuccess: () => void;
}

/**
 * RescheduleDialog
 * Calls PATCH /api/v1/appointments/[id]/reschedule
 * which delegates to AppointmentService.reschedule (with audit + validation).
 */
export function RescheduleDialog({
  open,
  onOpenChange,
  appointmentId,
  currentDate,
  currentTimeSlot,
  onSuccess,
}: RescheduleDialogProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormInput>({
    resolver: zodResolver(RescheduleFormSchema),
    defaultValues: {
      date: currentDate ? new Date(currentDate).toISOString().split("T")[0] : today,
      timeSlot: currentTimeSlot ?? "",
    },
  });

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  }

  async function onSubmit(values: RescheduleFormInput) {
    try {
      // Convert local date to ISO datetime
      const isoDate = new Date(values.date).toISOString();

      const res = await fetch(`/api/v1/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: isoDate,
          timeSlot: values.timeSlot || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to reschedule appointment.";
        toast.error("Reschedule failed", { description: msg });
        return;
      }

      toast.success("Appointment rescheduled", {
        description: `New date: ${values.date}${values.timeSlot ? " at " + values.timeSlot : ""}`,
      });
      handleClose(false);
      onSuccess();
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Choose a new date and time for this appointment. The status will be reset to Scheduled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormField label="New Date" htmlFor="reschedule-date" error={errors.date?.message} required>
            <Input
              id="reschedule-date"
              type="date"
              min={today}
              disabled={isSubmitting}
              {...register("date")}
            />
          </FormField>

          <FormField label="Time Slot" htmlFor="reschedule-time" error={errors.timeSlot?.message}>
            <Input
              id="reschedule-time"
              type="time"
              disabled={isSubmitting}
              {...register("timeSlot")}
            />
          </FormField>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rescheduling…
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4" />
                  Reschedule
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
