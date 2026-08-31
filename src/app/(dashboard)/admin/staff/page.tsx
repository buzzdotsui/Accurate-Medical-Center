"use client";

import { useMemo, useState, useCallback } from "react";
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
import { UserCog, Search, Users } from "lucide-react";
import { CreateStaffDialog } from "@/components/admin/staff/create-staff-dialog";
import { ROLE_LABELS, type Role } from "@/config/roles";

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
}

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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
    </div>
  );
}
