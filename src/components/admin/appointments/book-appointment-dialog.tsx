"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarPlus, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

// Client-side schema mirrors CreateAppointmentSchema (branchId supplied by server from session)
const ClientBookAppointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().optional().or(z.literal("")),
  type: z.enum(["IN_PERSON", "ONLINE"]),
  reason: z.string().optional().or(z.literal("")),
});

type ClientBookAppointmentInput = z.infer<typeof ClientBookAppointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface StaffMember {
  id: string;
  staffId: string;
  user: { name: string; role: string };
  department: { name: string } | null;
}

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BookAppointmentDialog({ open, onOpenChange, onSuccess }: BookAppointmentDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientBookAppointmentInput>({
    resolver: zodResolver(ClientBookAppointmentSchema),
    defaultValues: { type: "IN_PERSON" },
  });

  // Debounced patient search
  const searchPatients = useCallback((search: string) => {
    setLoadingPatients(true);
    const params = new URLSearchParams({ take: "20" });
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/v1/patients?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setPatients(data?.data?.patients ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, []);

  // Load initial patients and doctors when dialog opens
  useEffect(() => {
    if (!open) return;
    searchPatients("");
    setLoadingDoctors(true);
    fetch("/api/v1/hr/staff")
      .then((r) => r.json())
      .then((data) => {
        const staff: StaffMember[] = data?.data ?? [];
        // Only clinical staff that can be a doctor/care giver
        const clinical = staff.filter((s) =>
          ["DOCTOR", "NURSE", "MATERNAL_STAFF", "MENTAL_HEALTH"].includes(s.user.role)
        );
        setDoctors(clinical);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, [open, searchPatients]);

  // Debounce patient search input
  useEffect(() => {
    const timer = setTimeout(() => searchPatients(patientSearch), 400);
    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients]);

  async function onSubmit(values: ClientBookAppointmentInput) {
    try {
      // Build ISO datetime from date + timeSlot
      const dateTime = values.date
        ? new Date(values.date).toISOString()
        : "";

      const payload = {
        patientId: values.patientId,
        doctorId: values.doctorId || undefined,
        date: dateTime,
        timeSlot: values.timeSlot || undefined,
        type: values.type,
        reason: values.reason || undefined,
      };

      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to book appointment.";
        if (res.status === 403) {
          toast.error("Access Denied", { description: "You do not have permission to book appointments." });
        } else if (res.status === 409) {
          toast.error("Scheduling Conflict", { description: msg });
        } else {
          toast.error("Error", { description: msg });
        }
        return;
      }

      toast.success("Appointment booked!", {
        description: `Appointment scheduled for ${values.date}.`,
      });
      reset();
      setPatientSearch("");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset();
      setPatientSearch("");
    }
    onOpenChange(isOpen);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule an appointment for a registered patient. The patient and date are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Patient search */}
          <FormField label="Patient" htmlFor="appt-patientSearch" error={errors.patientId?.message} required>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="appt-patientSearch"
                  placeholder="Search by name, ID, or phone…"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-8"
                />
              </div>
              <Select
                id="appt-patientId"
                disabled={isSubmitting || loadingPatients}
                {...register("patientId")}
              >
                <option value="">
                  {loadingPatients ? "Loading patients…" : "— Select Patient —"}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientId})
                  </option>
                ))}
              </Select>
            </div>
          </FormField>

          {/* Doctor */}
          <FormField label="Doctor / Provider" htmlFor="appt-doctorId" error={errors.doctorId?.message}>
            <Select id="appt-doctorId" disabled={isSubmitting || loadingDoctors} {...register("doctorId")}>
              <option value="">
                {loadingDoctors ? "Loading staff…" : "— No preference —"}
              </option>
              {doctors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} · {s.department?.name ?? s.user.role}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" htmlFor="appt-date" error={errors.date?.message} required>
              <Input
                id="appt-date"
                type="date"
                min={today}
                disabled={isSubmitting}
                {...register("date")}
              />
            </FormField>
            <FormField label="Time Slot" htmlFor="appt-timeSlot" error={errors.timeSlot?.message}>
              <Input
                id="appt-timeSlot"
                type="time"
                disabled={isSubmitting}
                {...register("timeSlot")}
              />
            </FormField>
          </div>

          <FormField label="Appointment Type" htmlFor="appt-type" error={errors.type?.message} required>
            <Select id="appt-type" disabled={isSubmitting} {...register("type")}>
              <option value="IN_PERSON">In Person</option>
              <option value="ONLINE">Online / Telemedicine</option>
            </Select>
          </FormField>

          <FormField label="Reason for Visit" htmlFor="appt-reason" error={errors.reason?.message}>
            <Input
              id="appt-reason"
              placeholder="e.g. Routine check-up, follow-up"
              disabled={isSubmitting}
              {...register("reason")}
            />
          </FormField>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking…
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" />
                  Book Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


