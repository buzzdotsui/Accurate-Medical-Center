"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BedDouble, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const AdmitPatientClientSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select the admitting doctor"),
  bedId: z.string().min(1, "Please select a bed"),
  reason: z.string().min(1, "Admission reason is required"),
});

type AdmitPatientClientInput = z.infer<typeof AdmitPatientClientSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface StaffMember {
  id: string;
  user: { name: string; role: string };
  department: { name: string } | null;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: string;
}

interface Room {
  id: string;
  roomNumber: string;
  beds: Bed[];
}

interface Ward {
  id: string;
  name: string;
  type: string;
  rooms: Room[];
}

interface AvailableBedOption {
  id: string;
  label: string;
}

interface AdmitPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdmitPatientDialog({ open, onOpenChange, onSuccess }: AdmitPatientDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [availableBeds, setAvailableBeds] = useState<AvailableBedOption[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdmitPatientClientInput>({
    resolver: zodResolver(AdmitPatientClientSchema),
  });

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

  // Load patients, doctors, and available beds when the dialog opens.
  useEffect(() => {
    if (!open) return;
    searchPatients("");

    setLoadingDoctors(true);
    fetch("/api/v1/hr/staff")
      .then((r) => r.json())
      .then((data) => {
        const staff: StaffMember[] = data?.data ?? [];
        setDoctors(staff.filter((s) => s.user.role === "DOCTOR"));
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));

    setLoadingBeds(true);
    fetch("/api/v1/inpatient/wards")
      .then((r) => r.json())
      .then((data) => {
        const wards: Ward[] = data?.data ?? [];
        const beds: AvailableBedOption[] = [];
        for (const ward of wards) {
          for (const room of ward.rooms ?? []) {
            for (const bed of room.beds ?? []) {
              if (bed.status === "AVAILABLE") {
                beds.push({
                  id: bed.id,
                  label: `${ward.name} · Room ${room.roomNumber} · Bed ${bed.bedNumber}`,
                });
              }
            }
          }
        }
        setAvailableBeds(beds);
      })
      .catch(() => setAvailableBeds([]))
      .finally(() => setLoadingBeds(false));
  }, [open, searchPatients]);

  // Debounce patient search input
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchPatients(patientSearch), 400);
    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients, open]);

  async function onSubmit(values: AdmitPatientClientInput) {
    try {
      const res = await fetch("/api/v1/inpatient/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to admit patient.";
        toast.error("Admission Failed", { description: msg });
        return;
      }

      toast.success("Patient admitted", {
        description: `Admission ${json?.data?.admissionId ?? ""} created successfully.`,
      });
      reset();
      setPatientSearch("");
      onSuccess();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-primary" />
            Admit Patient
          </DialogTitle>
          <DialogDescription>
            Allocate a bed and admit a patient under the care of a doctor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Patient search */}
          <FormField label="Patient" htmlFor="admit-patientSearch" error={errors.patientId?.message} required>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="admit-patientSearch"
                  placeholder="Search by name, ID, or phone…"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-8"
                />
              </div>
              <Select
                id="admit-patientId"
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
          <FormField label="Admitting Doctor" htmlFor="admit-doctorId" error={errors.doctorId?.message} required>
            <Select id="admit-doctorId" disabled={isSubmitting || loadingDoctors} {...register("doctorId")}>
              <option value="">
                {loadingDoctors
                  ? "Loading doctors…"
                  : doctors.length === 0
                  ? "No doctors available"
                  : "— Select Doctor —"}
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name} {d.department?.name ? `· ${d.department.name}` : ""}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Bed */}
          <FormField label="Bed" htmlFor="admit-bedId" error={errors.bedId?.message} required>
            <Select id="admit-bedId" disabled={isSubmitting || loadingBeds} {...register("bedId")}>
              <option value="">
                {loadingBeds
                  ? "Loading beds…"
                  : availableBeds.length === 0
                  ? "No available beds"
                  : "— Select Bed —"}
              </option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Reason for Admission" htmlFor="admit-reason" error={errors.reason?.message} required>
            <Textarea
              id="admit-reason"
              placeholder="e.g. Post-operative observation, acute respiratory distress…"
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
                  Admitting…
                </>
              ) : (
                <>
                  <BedDouble className="w-4 h-4" />
                  Admit Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
