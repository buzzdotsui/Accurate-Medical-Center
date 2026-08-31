"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { RegisterPatientDialog } from "@/components/admin/patients/register-patient-dialog";
import { UserPlus, Search, Users, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminPatientsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8">
            <Link href={`/admin/patients/${String(row.id)}`}>
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>
          </Button>
        </div>
      ),
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
    </div>
  );
}
