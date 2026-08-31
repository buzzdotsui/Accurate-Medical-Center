"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Activity } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/lib/utils/format";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface PrescriptionListItem {
  id: string;
  prescriptionId: string;
  status: string;
  createdAt: string;
  visit: {
    patient: { firstName: string; lastName: string; patientId: string };
  };
  doctor: { user: { name: string } };
  items: Array<{
    id: string;
    quantity: number;
    dispensedQty: number;
    medicine: { name: string; unit: string; stockQuantity: number; reorderLevel: number };
  }>;
}

export default function PrescriptionQueue() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["prescriptions", "pending"],
    queryFn: async (): Promise<PrescriptionListItem[]> => {
      const res = await fetch("/api/v1/pharmacy/prescriptions", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load prescription queue");
      }
      return json.data;
    },
  });

  const prescriptions = data ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Prescription Queue</h1>
          <p className="text-muted-foreground mt-1">Fulfill medication orders sent by clinicians.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Loading prescriptions..." className="py-12" />
          ) : isError ? (
            <ErrorState
              description={error instanceof Error ? error.message : "Failed to load prescription queue"}
              onRetry={() => refetch()}
              className="border-none bg-transparent"
            />
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No pending prescriptions</h3>
              <p className="text-muted-foreground mt-1">All orders have been fulfilled.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order Time</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Doctor</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Medications</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {prescriptions.map((rx) => {
                    const hasLowStockItem = rx.items.some((it) => it.medicine.stockQuantity <= it.medicine.reorderLevel);
                    return (
                      <tr key={rx.id} className="border-b transition-colors hover:bg-muted/30 group">
                        <td className="p-6 align-middle font-medium">{formatTime(rx.createdAt)}</td>
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base">{rx.visit.patient.firstName} {rx.visit.patient.lastName}</div>
                          <div className="text-xs text-muted-foreground">{rx.visit.patient.patientId}</div>
                        </td>
                        <td className="p-6 align-middle text-muted-foreground">
                          {rx.doctor.user.name}
                        </td>
                        <td className="p-6 align-middle">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {rx.items.map((it) => (
                              <span
                                key={it.id}
                                title={`${it.medicine.name} x${it.quantity}${it.medicine.stockQuantity <= it.medicine.reorderLevel ? ' (low stock)' : ''}`}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  it.medicine.stockQuantity <= it.medicine.reorderLevel ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'
                                }`}
                              >
                                {it.medicine.name} ×{it.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            rx.status === 'PARTIAL' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                          }`}>
                            {rx.status}
                          </span>
                          {hasLowStockItem && (
                            <div className="text-[10px] text-destructive mt-1 font-medium">Contains low-stock item</div>
                          )}
                        </td>
                        <td className="p-6 align-middle text-right">
                          <Button variant="default" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link href={`/pharmacy/prescriptions/${rx.id}`}>
                              <Pill className="w-4 h-4 mr-2" />
                              Dispense
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
