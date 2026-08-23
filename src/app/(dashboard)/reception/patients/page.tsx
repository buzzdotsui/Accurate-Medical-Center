"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function PatientsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients?search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      return res.json();
    }
  });

  const columns: Column<any>[] = [
    {
      accessorKey: "patientId",
      header: "Patient ID",
      cell: (row) => <span className="font-medium text-primary">{row.patientId}</span>
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (row) => `${row.firstName} ${row.lastName}`
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: (row) => <span className="text-muted-foreground">{row.phone || '-'}</span>
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: (row) => row.gender || '-'
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/reception/patients/${row.id}`}>View Profile</Link>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients Directory</h1>
          <p className="text-muted-foreground mt-1">Search and manage all registered patients.</p>
        </div>
        <Button asChild>
          <Link href="/reception/patients/new">
            <UserPlus className="w-4 h-4 mr-2" />
            Register New Patient
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        {isLoading ? (
          <LoadingState message="Loading patients database..." />
        ) : error ? (
          <ErrorState 
            title="Failed to load patients" 
            description={error.message} 
            onRetry={() => refetch()} 
          />
        ) : data?.data?.patients?.length === 0 && !searchTerm ? (
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
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <input 
                type="search"
                placeholder="Search by name, ID, or phone (Server-side)..." 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {data?.data?.patients?.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No patients match your search.
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={data?.data?.patients || []} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
