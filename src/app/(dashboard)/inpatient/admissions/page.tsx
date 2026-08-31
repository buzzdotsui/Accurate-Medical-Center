"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, LogOut, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { AdmitPatientDialog } from "@/components/inpatient/admit-patient-dialog";
import { DischargeDialog } from "@/components/inpatient/discharge-dialog";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface Admission {
  id: string;
  admissionId: string;
  reason: string;
  admittedAt: string;
  patient: Patient;
  bed: { bedNumber: string; room: { roomNumber: string; ward: { name: string } } } | null;
  doctor: { user: { name: string } };
}

export default function ActiveAdmissions() {
  const queryClient = useQueryClient();
  const [admitOpen, setAdmitOpen] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<Admission | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inpatient_admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/admissions");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load admissions");
      }
      return res.json();
    },
  });

  const admissions: Admission[] = data?.data ?? [];

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["inpatient_admissions"] });
    queryClient.invalidateQueries({ queryKey: ["inpatient_wards"] });
  };

  const dischargeMutation = useMutation({
    mutationFn: async ({ id, dischargeNotes }: { id: string; dischargeNotes: string }) => {
      const res = await fetch(`/api/v1/inpatient/admissions/${id}/discharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dischargeNotes: dischargeNotes || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to discharge patient");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Patient discharged successfully");
      setDischargeTarget(null);
      refreshAll();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Active Admissions</h1>
          <p className="text-muted-foreground mt-1">Manage currently admitted patients across all wards.</p>
        </div>
        <Button className="gap-2" onClick={() => setAdmitOpen(true)}>
          <BedDouble className="w-4 h-4" /> Admit Patient
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingState message="Loading admissions…" />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState
                title="Failed to load admissions"
                description={(error as Error).message}
                onRetry={() => refetch()}
              />
            </div>
          ) : admissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No active admissions</h3>
              <p className="text-muted-foreground mt-1">All beds are currently empty.</p>
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
                  {admissions.map((adm) => (
                    <tr key={adm.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium text-muted-foreground whitespace-nowrap">
                        {format(new Date(adm.admittedAt), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">
                          {adm.patient.firstName} {adm.patient.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{adm.patient.patientId}</div>
                      </td>
                      <td className="p-6 align-middle">
                        {adm.bed ? (
                          <>
                            <div className="font-bold text-primary">{adm.bed.room.ward.name}</div>
                            <div className="text-sm font-medium">
                              Room {adm.bed.room.roomNumber} · Bed {adm.bed.bedNumber}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="p-6 align-middle font-medium">{adm.doctor.user.name}</td>
                      <td className="p-6 align-middle">
                        <span className="truncate max-w-[200px] inline-block">{adm.reason}</span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          onClick={() => setDischargeTarget(adm)}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Discharge
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

      <AdmitPatientDialog
        open={admitOpen}
        onOpenChange={setAdmitOpen}
        onSuccess={refreshAll}
      />

      <DischargeDialog
        open={dischargeTarget !== null}
        onOpenChange={(open) => !open && setDischargeTarget(null)}
        patientName={
          dischargeTarget
            ? `${dischargeTarget.patient.firstName} ${dischargeTarget.patient.lastName}`
            : undefined
        }
        isLoading={dischargeMutation.isPending}
        onConfirm={(notes) => {
          if (!dischargeTarget) return;
          dischargeMutation.mutate({ id: dischargeTarget.id, dischargeNotes: notes });
        }}
      />
    </div>
  );
}
