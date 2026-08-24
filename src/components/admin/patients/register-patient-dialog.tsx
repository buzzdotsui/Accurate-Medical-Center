"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

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

// Client-side schema mirrors CreatePatientSchema
const ClientRegisterPatientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional().or(z.literal("")),
});

type ClientRegisterPatientInput = z.infer<typeof ClientRegisterPatientSchema>;

interface RegisterPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RegisterPatientDialog({ open, onOpenChange, onSuccess }: RegisterPatientDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterPatientInput>({
    resolver: zodResolver(ClientRegisterPatientSchema),
  });

  async function onSubmit(values: ClientRegisterPatientInput) {
    try {
      const payload = {
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        bloodGroup: values.bloodGroup || undefined,
      };

      const res = await fetch("/api/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to register patient.";
        if (res.status === 403) {
          toast.error("Access Denied", { description: "You do not have permission to register patients." });
        } else if (res.status === 409) {
          toast.error("Conflict", { description: "A patient with this information already exists." });
        } else {
          toast.error("Error", { description: msg });
        }
        return;
      }

      toast.success("Patient registered!", {
        description: `${values.firstName} ${values.lastName} has been registered successfully.`,
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Register Patient
          </DialogTitle>
          <DialogDescription>
            Register a new patient in the system. At minimum, a first and last name are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" htmlFor="pat-firstName" error={errors.firstName?.message} required>
              <Input
                id="pat-firstName"
                placeholder="e.g. Chioma"
                disabled={isSubmitting}
                {...register("firstName")}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="pat-lastName" error={errors.lastName?.message} required>
              <Input
                id="pat-lastName"
                placeholder="e.g. Nwosu"
                disabled={isSubmitting}
                {...register("lastName")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" htmlFor="pat-phone" error={errors.phone?.message}>
              <Input
                id="pat-phone"
                type="tel"
                placeholder="e.g. 08012345678"
                disabled={isSubmitting}
                {...register("phone")}
              />
            </FormField>
            <FormField label="Email Address" htmlFor="pat-email" error={errors.email?.message}>
              <Input
                id="pat-email"
                type="email"
                placeholder="patient@email.com"
                disabled={isSubmitting}
                {...register("email")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of Birth" htmlFor="pat-dob" error={errors.dateOfBirth?.message}>
              <Input
                id="pat-dob"
                type="date"
                disabled={isSubmitting}
                max={new Date().toISOString().split("T")[0]}
                {...register("dateOfBirth")}
              />
            </FormField>
            <FormField label="Gender" htmlFor="pat-gender" error={errors.gender?.message}>
              <Select id="pat-gender" disabled={isSubmitting} {...register("gender")}>
                <option value="">— Select —</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Blood Group" htmlFor="pat-bloodGroup" error={errors.bloodGroup?.message}>
            <Select id="pat-bloodGroup" disabled={isSubmitting} {...register("bloodGroup")}>
              <option value="">— Unknown —</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
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
                  Registering…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
