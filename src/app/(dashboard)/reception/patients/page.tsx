"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function PatientsList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Real-world integration using the API we built in Module 5
  const { data, isLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients?search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      return res.json();
    }
  });

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

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, ID, or phone..." 
              className="pl-9 bg-muted/50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.data?.patients?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Patient ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Gender</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.data?.patients.map((patient: any) => (
                    <tr key={patient.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium text-primary">{patient.patientId}</td>
                      <td className="p-4 align-middle">
                        {patient.firstName} {patient.lastName}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{patient.phone}</td>
                      <td className="p-4 align-middle">{patient.gender || '-'}</td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/reception/patients/${patient.id}`}>View Profile</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
