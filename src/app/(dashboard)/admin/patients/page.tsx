"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { RegisterPatientDialog } from "@/components/admin/patients/register-patient-dialog";
import { UserPlus, Search, Users, Eye, Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdatePatientSchema, type UpdatePatientInput } from "@/lib/validations/patient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";

export default function AdminPatientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Record<string, unknown> | null>(null);

  // Debounce the search input (300 ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin_patients", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ take: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/v1/patients?${params}`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to fetch patients");
      }
      return res.json();
    },
  });

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const patients: Record<string, unknown>[] = data?.data?.patients ?? [];
  const total: number = data?.data?.total ?? 0;

  // Status mutations
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/patients/${id}/deactivate`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to deactivate patient");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Patient deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin_patients"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/patients/${id}/activate`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to activate patient");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Patient activated");
      queryClient.invalidateQueries({ queryKey: ["admin_patients"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Edit mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientInput }) => {
      const res = await fetch(`/api/v1/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update patient");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Patient updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin_patients"] });
      setEditDialogOpen(false);
      setEditingPatient(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editForm = useForm<UpdatePatientInput>({
    resolver: zodResolver(UpdatePatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      bloodGroup: "",
      genotype: "",
    },
  });

  useEffect(() => {
    if (editingPatient) {
      editForm.reset({
        firstName: String(editingPatient.firstName ?? ""),
        lastName: String(editingPatient.lastName ?? ""),
        email: String(editingPatient.email ?? ""),
        phone: String(editingPatient.phone ?? ""),
        gender: String(editingPatient.gender ?? ""),
        dateOfBirth: editingPatient.dateOfBirth ? String(editingPatient.dateOfBirth).split("T")[0] : "",
        address: String(editingPatient.address ?? ""),
        bloodGroup: String(editingPatient.bloodGroup ?? ""),
        genotype: String(editingPatient.genotype ?? ""),
      });
    }
  }, [editingPatient, editForm]);

  function openEditDialog(patient: Record<string, unknown>) {
    setEditingPatient(patient);
    setEditDialogOpen(true);
  }

  function closeEditDialog() {
    setEditDialogOpen(false);
    setEditingPatient(null);
    editForm.reset();
  }

  async function onEditSubmit(values: UpdatePatientInput) {
    if (!editingPatient) return;
    await updateMutation.mutateAsync({
      id: String(editingPatient.id),
      data: values,
    });
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "patientId",
      header: "Patient ID",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/8 rounded px-1.5 py-0.5">
          {String(row.patientId ?? "")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Full Name",
      cell: (row) => (
        <span className="font-medium text-foreground">
          {String(row.firstName ?? "")} {String(row.lastName ?? "")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {String(row.email ?? "—")}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {String(row.phone ?? "—")}
        </span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: (row) =>
        row.gender ? (
          <Badge variant="outline" className="capitalize text-xs">
            {String(row.gender).toLowerCase()}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "dateOfBirth",
      header: "Date of Birth",
      cell: (row) =>
        row.dateOfBirth ? (
          <span className="text-muted-foreground text-sm">
            {format(new Date(String(row.dateOfBirth)), "dd MMM yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: (row) => {
        const branch = row.branch as { name?: string; code?: string } | null | undefined;
        return branch?.name ? (
          <span className="text-muted-foreground text-sm">{branch.name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: (row) =>
        row.createdAt ? (
          <span className="text-muted-foreground text-sm">
            {format(new Date(String(row.createdAt)), "dd MMM yyyy")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => (
        <Badge
          variant={row.deletedAt ? "destructive" : "secondary"}
          className="text-xs"
        >
          {row.deletedAt ? "Inactive" : "Active"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: (row) => {
        const isInactive = !!row.deletedAt;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => openEditDialog(row)}
              disabled={updateMutation.isPending}
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
            {isInactive ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-success hover:text-success hover:bg-success/10"
                onClick={() => activateMutation.mutate(String(row.id))}
                disabled={activateMutation.isPending}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Restore
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deactivateMutation.mutate(String(row.id))}
                disabled={deactivateMutation.isPending}
              >
                <UserX className="w-3.5 h-3.5" />
                Disable
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8">
              <Link href={`/admin/patients/${String(row.id)}`}>
                <Eye className="w-3.5 h-3.5" />
                View
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total > 0
              ? `${total.toLocaleString()} patient${total !== 1 ? "s" : ""} registered`
              : "Browse, search, and manage all registered patients."}
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setOpen(true)} id="register-patient-btn">
          <UserPlus className="w-4 h-4" />
          Register Patient
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="patient-search"
          placeholder="Search by name, ID, or phone…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table / states */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <LoadingState message="Loading patients…" />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Failed to load patients"
              description={(error as Error).message}
              onRetry={() => refetch()}
            />
          </div>
        ) : patients.length === 0 && !debouncedSearch ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="w-full h-full" />}
              title="No patients registered yet"
              description="Patients will appear here once they are registered in the system."
              action={
                <Button className="gap-2" onClick={() => setOpen(true)}>
                  <UserPlus className="w-4 h-4" /> Register First Patient
                </Button>
              }
            />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No patients match &ldquo;{debouncedSearch}&rdquo;
          </div>
        ) : (
          <DataTable columns={columns} data={patients} pageSize={20} />
        )}
      </div>

      <RegisterPatientDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Edit Patient
            </DialogTitle>
            <DialogDescription>
              Update patient information. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="edit-firstName" error={editForm.formState.errors.firstName?.message} required>
                <Input id="edit-firstName" {...editForm.register("firstName")} />
              </FormField>
              <FormField label="Last Name" htmlFor="edit-lastName" error={editForm.formState.errors.lastName?.message} required>
                <Input id="edit-lastName" {...editForm.register("lastName")} />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="edit-email" error={editForm.formState.errors.email?.message}>
              <Input id="edit-email" type="email" {...editForm.register("email")} />
            </FormField>

            <FormField label="Phone" htmlFor="edit-phone" error={editForm.formState.errors.phone?.message}>
              <Input id="edit-phone" type="tel" placeholder="+234 8XX XXX XXXX" {...editForm.register("phone")} />
            </FormField>

            <FormField label="Gender" htmlFor="edit-gender" error={editForm.formState.errors.gender?.message}>
              <Select id="edit-gender" {...editForm.register("gender")}>
                <option value="">— Select Gender —</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>

            <FormField label="Date of Birth" htmlFor="edit-dob" error={editForm.formState.errors.dateOfBirth?.message}>
              <Input id="edit-dob" type="date" {...editForm.register("dateOfBirth")} />
            </FormField>

            <FormField label="Address" htmlFor="edit-address" error={editForm.formState.errors.address?.message}>
              <textarea
                id="edit-address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...editForm.register("address")}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Blood Group" htmlFor="edit-bloodGroup" error={editForm.formState.errors.bloodGroup?.message}>
                <Select id="edit-bloodGroup" {...editForm.register("bloodGroup")}>
                  <option value="">— Select —</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </FormField>
              <FormField label="Genotype" htmlFor="edit-genotype" error={editForm.formState.errors.genotype?.message}>
                <Select id="edit-genotype" {...editForm.register("genotype")}>
                  <option value="">— Select —</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="SS">SS</option>
                  <option value="AC">AC</option>
                  <option value="SC">SC</option>
                </Select>
              </FormField>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={updateMutation.isPending} onClick={closeEditDialog}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
