"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { UserCog, Search, Users, UserPlus, Edit2, Trash2 } from "lucide-react";
import { CreateStaffDialog } from "@/components/admin/staff/create-staff-dialog";
import { ROLE_LABELS, ROLES, type Role } from "@/config/roles";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  assignedDoctor: { id: string; user: { name: string }; staffId: string } | null;
}

export default function AdminStaffPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [assignDoctorDialogOpen, setAssignDoctorDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<Array<{ id: string; name: string; staffId: string }>>([]);

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
        const msg = json?.error?.message ?? `HTTP ${res.status}: Failed to load staff members`;
        console.error('[AdminStaffPage]', msg, { status: res.status, body: json });
        throw new Error(msg);
      }
      return res.json();
    },
  });

  // Fetch available doctors for assignment
  useEffect(() => {
    fetch("/api/v1/hr/doctors")
      .then((r) => r.json())
      .then((data) => setAvailableDoctors(data?.data ?? []))
      .catch((err) => {
        console.error('[AdminStaffPage:doctors]', err);
        setAvailableDoctors([]);
      });
  }, []);

  const staff: StaffMember[] = data?.data ?? [];

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

  const assignDoctorMutation = useMutation({
    mutationFn: async ({ staffId, assignedDoctorId }: { staffId: string; assignedDoctorId: string | null }) => {
      const res = await fetch(`/api/v1/hr/staff/${staffId}/assign-doctor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedDoctorId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to assign doctor");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Doctor assignment updated");
      queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
      setAssignDoctorDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/hr/staff/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to delete staff member");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Staff member deleted");
      queryClient.invalidateQueries({ queryKey: ["admin_staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openAssignDoctorDialog = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setAssignDoctorDialogOpen(true);
  };

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
      accessorKey: "assignedDoctor",
      header: "Assigned Doctor",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        if (s.user.role === ROLES.DOCTOR) {
          return <span className="text-muted-foreground text-sm italic">— (Doctor)</span>;
        }
        return s.assignedDoctor ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dr. {s.assignedDoctor.user.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{s.assignedDoctor.staffId}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); openAssignDoctorDialog(s); }}
              aria-label="Change assigned doctor"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Not assigned</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); openAssignDoctorDialog(s); }}
              aria-label="Assign doctor"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const s = row as unknown as StaffMember;
        return (
          <div className="flex items-center gap-2">
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={s.isActive}
                disabled={statusMutation.isPending}
                onCheckedChange={(checked) =>
                  statusMutation.mutate({ id: s.id, isActive: checked })
                }
                aria-label={s.isActive ? "Deactivate staff member" : "Activate staff member"}
              />
            </div>
            <Badge variant={s.isActive ? "success" : "destructive"} className="text-xs">
              {s.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this staff member?")) {
                  deleteMutation.mutate(s.id);
                }
              }}
              disabled={deleteMutation.isPending}
              aria-label="Delete staff member"
            >
              <Trash2 className="w-4 h-4" />
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
          onRowClick={(row) => {
            const s = row as unknown as StaffMember;
            router.push(`/records/staff/${s.id}`);
          }}
        />
      )}

      <CreateStaffDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />

      {/* Assign Doctor Dialog */}
      <Dialog open={assignDoctorDialogOpen} onOpenChange={setAssignDoctorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Doctor</DialogTitle>
            <DialogDescription>
              {selectedStaff
                ? `Assign a doctor to ${selectedStaff.user.name} (${selectedStaff.staffId})`
                : "Select a doctor to assign to this staff member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select
              value={selectedStaff?.assignedDoctor?.id ?? ""}
              onValueChange={(value) => {
                if (selectedStaff) {
                  assignDoctorMutation.mutate({ staffId: selectedStaff.id, assignedDoctorId: value || null });
                }
              }}
              disabled={assignDoctorMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Remove Assignment —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Remove Assignment —</SelectItem>
                {availableDoctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.staffId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDoctorDialogOpen(false)} disabled={assignDoctorMutation.isPending}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
