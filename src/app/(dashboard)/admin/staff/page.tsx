"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTable, Column } from "@/components/ui/data-table";
import { UserCog, Search, Users, Edit, Loader2 } from "lucide-react";
import { CreateStaffDialog } from "@/components/admin/staff/create-staff-dialog";
import { ROLE_LABELS, type Role } from "@/config/roles";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateStaffSchema, type UpdateStaffInput } from "@/lib/validations/staff";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StaffMember {
  id: string;
  staffId: string;
  userId: string;
  isActive: boolean;
  specialization: string | null;
  licenseNumber: string | null;
  phone: string | null;
  address: string | null;
  user: { name: string; email: string; role: string };
  department: { name: string; code: string } | null;
  supervisingDoctor: { id: string; user: { name: string }; staffId: string } | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface DoctorOption {
  id: string;
  staffId: string;
  user: { name: string };
}

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin_staff"],
    queryFn: async () => {
      const res = await fetch("/api/v1/hr/staff");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load staff members");
      }
      return res.json();
    },
  });

  const staff: StaffMember[] = data?.data ?? [];

  // Fetch departments and doctors when edit dialog opens
  const loadEditData = useCallback(async () => {
    if (!editingStaff) return;
    setLoadingDepts(true);
    setLoadingDoctors(true);
    try {
      const [deptsRes, doctorsRes] = await Promise.all([
        fetch("/api/v1/settings/departments"),
        fetch("/api/v1/hr/staff?role=DOCTOR&isActive=true"),
      ]);
      const deptsJson = await deptsRes.json();
      const doctorsJson = await doctorsRes.json();
      setDepartments(deptsJson.data ?? []);
      setDoctors(doctorsJson.data ?? []);
    } catch (err) {
      console.error("Failed to load edit data:", err);
    } finally {
      setLoadingDepts(false);
      setLoadingDoctors(false);
    }
  }, [editingStaff]);

  // Load data when edit dialog opens
  useEffect(() => {
    if (editDialogOpen && editingStaff) {
      loadEditData();
    }
  }, [editDialogOpen, editingStaff, loadEditData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) => {
      const roleLabel = ROLE_LABELS[s.user.role as Role] ?? s.user.role;
      return (
        s.user.name.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        s.user.role.toLowerCase().includes(q) ||
        roleLabel.toLowerCase().includes(q) ||
        (s.department?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [staff, search]);

  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
  }, [queryClient]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/v1/hr/staff/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update staff status");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.isActive ? "Staff member activated" : "Staff member deactivated"
      );
      queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStaffInput }) => {
      const res = await fetch(`/api/v1/hr/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update staff member");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
      setEditDialogOpen(false);
      setEditingStaff(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openEditDialog(staff: StaffMember) {
    setEditingStaff(staff);
    setEditDialogOpen(true);
  }

  function closeEditDialog() {
    setEditDialogOpen(false);
    setEditingStaff(null);
    editForm.reset();
  }

  const editForm = useForm<UpdateStaffInput>({
    resolver: zodResolver(UpdateStaffSchema),
    defaultValues: {
      departmentId: "",
      specialization: "",
      licenseNumber: "",
      phone: "",
      address: "",
      supervisingDoctorId: "",
    },
  });

  useEffect(() => {
    if (editingStaff) {
      editForm.reset({
        departmentId: editingStaff.department?.id ?? "",
        specialization: editingStaff.specialization ?? "",
        licenseNumber: editingStaff.licenseNumber ?? "",
        phone: editingStaff.phone ?? "",
        address: editingStaff.address ?? "",
        supervisingDoctorId: editingStaff.supervisingDoctor?.id ?? "",
      });
    }
  }, [editingStaff, editForm]);

  async function onEditSubmit(values: UpdateStaffInput) {
    if (!editingStaff) return;
    await updateMutation.mutateAsync({
      id: editingStaff.id,
      data: {
        departmentId: values.departmentId || undefined,
        specialization: values.specialization || undefined,
        licenseNumber: values.licenseNumber || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        supervisingDoctorId: values.supervisingDoctorId || undefined,
      },
    });
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return (
          <div>
            <div className="font-medium text-foreground">{s.user.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{s.staffId}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (row) => (row as unknown as StaffMember).user.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return (
          <Badge variant="outline" className="text-xs">
            {ROLE_LABELS[s.user.role as Role] ?? s.user.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return s.department ? (
          <span>
            {s.department.name}{" "}
            <span className="text-xs text-muted-foreground">({s.department.code})</span>
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "supervisingDoctor",
      header: "Assigned Doctor",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        if (s.supervisingDoctor) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dr. {s.supervisingDoctor.user.name}</span>
              <span className="text-xs text-muted-foreground font-mono">({s.supervisingDoctor.staffId})</span>
            </div>
          );
        }
        return <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={s.isActive}
              disabled={statusMutation.isPending}
              onCheckedChange={(checked) =>
                statusMutation.mutate({ id: s.id, isActive: checked })
              }
              aria-label={s.isActive ? "Deactivate staff member" : "Activate staff member"}
            />
            <Badge variant={s.isActive ? "success" : "destructive"} className="text-xs">
              {s.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => openEditDialog(s)}
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all clinical and administrative staff members.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <UserCog className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, role, or dept..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load staff"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<Users className="w-full h-full" />}
          title="No staff members added yet"
          description="Staff accounts will appear here once they are created. Add clinical and administrative team members to get started."
          action={
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <UserCog className="w-4 h-4" /> Add Staff Member
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-full h-full" />}
          title="No matching staff members"
          description="Try a different search term."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          pageSize={15}
        />
      )}

      <CreateStaffDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Edit Staff Member
            </DialogTitle>
            <DialogDescription>
              Update staff details and assign a supervising doctor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <FormField label="Department" htmlFor="edit-department" error={editForm.formState.errors.departmentId?.message}>
              <Select
                id="edit-department"
                disabled={loadingDepts}
                {...editForm.register("departmentId")}
              >
                <option value="">— No Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Supervising Doctor" htmlFor="edit-doctor" error={editForm.formState.errors.supervisingDoctorId?.message}>
              <Select
                id="edit-doctor"
                disabled={loadingDoctors}
                {...editForm.register("supervisingDoctorId")}
              >
                <option value="">— No Doctor Assigned —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.user.name} ({d.staffId})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Specialization" htmlFor="edit-specialization" error={editForm.formState.errors.specialization?.message}>
              <Input
                id="edit-specialization"
                placeholder="e.g. Cardiology, Paediatrics"
                {...editForm.register("specialization")}
              />
            </FormField>

            <FormField label="License Number" htmlFor="edit-license" error={editForm.formState.errors.licenseNumber?.message}>
              <Input
                id="edit-license"
                placeholder="License number"
                {...editForm.register("licenseNumber")}
              />
            </FormField>

            <FormField label="Phone" htmlFor="edit-phone" error={editForm.formState.errors.phone?.message}>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+234 8XX XXX XXXX"
                {...editForm.register("phone")}
              />
            </FormField>

            <FormField label="Address" htmlFor="edit-address" error={editForm.formState.errors.address?.message}>
              <textarea
                id="edit-address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...editForm.register("address")}
              />
            </FormField>

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
                    <UserCog className="w-4 h-4" />
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
