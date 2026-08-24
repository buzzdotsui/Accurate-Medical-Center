"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserCog, Loader2, Eye, EyeOff } from "lucide-react";

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
import { ROLES, ROLE_LABELS, STAFF_ROLES } from "@/config/roles";

// Client-side schema — mirrors the server-side CreateStaffSchema.
// branchId is omitted here because the server uses the admin's own branch.
const ClientCreateStaffSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE,
    ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_SCIENTIST,
    ROLES.RADIOGRAPHER, ROLES.ACCOUNTANT, ROLES.THEATRE_STAFF,
    ROLES.MATERNAL_STAFF, ROLES.MENTAL_HEALTH, ROLES.AMBULANCE,
  ]),
  departmentId: z.string().cuid("Invalid department ID").optional().or(z.literal("")),
  specialization: z.string().optional(),
});

type ClientCreateStaffInput = z.infer<typeof ClientCreateStaffSchema>;

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CreateStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateStaffDialog({ open, onOpenChange, onSuccess }: CreateStaffDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientCreateStaffInput>({
    resolver: zodResolver(ClientCreateStaffSchema),
    defaultValues: { role: ROLES.DOCTOR },
  });

  // Fetch departments when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoadingDepts(true);
    fetch("/api/v1/settings/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data?.data ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepts(false));
  }, [open]);

  async function onSubmit(values: ClientCreateStaffInput) {
    try {
      const res = await fetch("/api/v1/hr/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          departmentId: values.departmentId || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to create staff member.";
        if (res.status === 409) {
          toast.error("Duplicate Email", { description: "A user with this email already exists." });
        } else if (res.status === 403) {
          toast.error("Access Denied", { description: "You do not have permission to create staff." });
        } else {
          toast.error("Error", { description: msg });
        }
        return;
      }

      toast.success("Staff member created!", {
        description: `${values.firstName} ${values.lastName} has been added successfully.`,
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
            <UserCog className="w-5 h-5 text-primary" />
            Add Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new clinical or administrative team member. They will receive access to the system based on their assigned role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" htmlFor="staff-firstName" error={errors.firstName?.message} required>
              <Input
                id="staff-firstName"
                placeholder="e.g. Aminu"
                disabled={isSubmitting}
                {...register("firstName")}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="staff-lastName" error={errors.lastName?.message} required>
              <Input
                id="staff-lastName"
                placeholder="e.g. Okafor"
                disabled={isSubmitting}
                {...register("lastName")}
              />
            </FormField>
          </div>

          <FormField label="Email Address" htmlFor="staff-email" error={errors.email?.message} required>
            <Input
              id="staff-email"
              type="email"
              placeholder="staff@accuratemedical.com"
              disabled={isSubmitting}
              {...register("email")}
            />
          </FormField>

          <FormField label="Password" htmlFor="staff-password" error={errors.password?.message} required helperText="Minimum 8 characters. Staff can change this after first login.">
            <div className="relative">
              <Input
                id="staff-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                disabled={isSubmitting}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <FormField label="Role" htmlFor="staff-role" error={errors.role?.message} required>
            <Select id="staff-role" disabled={isSubmitting} {...register("role")}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Department" htmlFor="staff-department" error={errors.departmentId?.message}>
            <Select id="staff-department" disabled={isSubmitting || loadingDepts} {...register("departmentId")}>
              <option value="">— No Department —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Specialization" htmlFor="staff-specialization" error={errors.specialization?.message}>
            <Input
              id="staff-specialization"
              placeholder="e.g. Cardiology, Paediatrics"
              disabled={isSubmitting}
              {...register("specialization")}
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
                  Creating…
                </>
              ) : (
                <>
                  <UserCog className="w-4 h-4" />
                  Add Staff Member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

