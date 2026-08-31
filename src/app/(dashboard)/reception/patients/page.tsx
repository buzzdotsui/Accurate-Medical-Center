"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Eye } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";

export default function ReceptionPatientsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 300 ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reception_patients", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ take: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/v1/patients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  const patients: Record<string, unknown>[] = data?.data?.patients ?? [];
  const total: number = data?.data?.total ?? 0;

  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "patientId",
      header: "Patient ID",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary/8 rounded px-1.5 py-0.5 whitespace-nowrap">
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
      accessorKey: "phone",
      header: "Phone",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{String(row.phone ?? "—")}</span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: (row) =>
        row.gender ? (
          <Badge variant="outline" className="text-xs capitalize">
            {String(row.gender).toLowerCase()}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: (row) =>
        row.createdAt ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(String(row.createdAt)), "dd MMM yyyy")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8">
            <Link href={`/reception/patients/${String(row.id)}`}>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients Directory</h1>
          <p className="text-muted-foreground mt-1">
            {total > 0
              ? `${total.toLocaleString()} patient${total !== 1 ? "s" : ""} registered`
              : "Search and manage all registered patients."}
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0" id="register-patient-btn">
          <Link href="/reception/patients/new">
            <UserPlus className="w-4 h-4" />
            Register New Patient
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="patient-search"
          type="search"
          placeholder="Search by name, ID, or phone…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <LoadingState message="Loading patients database…" />
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
              icon={<UserPlus className="w-full h-full" />}
              title="No patients found"
              description="The patient database is currently empty. Register your first patient to begin."
              action={
                <Button asChild>
                  <Link href="/reception/patients/new">
                    <UserPlus className="w-4 h-4 mr-2" /> Register First Patient
                  </Link>
                </Button>
              }
            />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No patients match &ldquo;{debouncedSearch}&rdquo;
          </div>
        ) : (
          <DataTable columns={columns} data={patients} pageSize={20} />
        )}
      </div>
    </div>
  );
}
