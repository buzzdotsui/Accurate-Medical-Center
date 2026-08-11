"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function ActiveAdmissions() {
  const { data, isLoading } = useQuery({
    queryKey: ['active-admissions'],
    queryFn: async () => {
      // Mock data for frontend demo
      return [
        { id: "ADM-001", patient: { name: "John Doe", id: "AMC-2026-0001" }, ward: "General Ward A", bed: "A-04", doctor: "Dr. Adams", time: "2 Days ago", reason: "Post-op Observation" },
        { id: "ADM-002", patient: { name: "Critical Patient", id: "AMC-2026-0010" }, ward: "ICU", bed: "ICU-02", doctor: "Dr. Lee", time: "12 Hours ago", reason: "Acute Respiratory Distress" },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Active Admissions</h1>
          <p className="text-muted-foreground mt-1">Manage currently admitted patients across all wards.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No active admissions</h3>
              <p className="text-muted-foreground mt-1">All beds are empty.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Admitted</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Location</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Admitting Physician</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Reason</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((adm: any) => (
                    <tr key={adm.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium text-muted-foreground">{adm.time}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{adm.patient.name}</div>
                        <div className="text-xs text-muted-foreground">{adm.patient.id}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-primary">{adm.ward}</div>
                        <div className="text-sm font-medium">Bed {adm.bed}</div>
                      </td>
                      <td className="p-6 align-middle font-medium">
                        {adm.doctor}
                      </td>
                      <td className="p-6 align-middle">
                        <span className="truncate max-w-[200px] inline-block">{adm.reason}</span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant="outline" size="sm" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link href={`/inpatient/admissions/${adm.id}/discharge`}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Discharge
                          </Link>
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
