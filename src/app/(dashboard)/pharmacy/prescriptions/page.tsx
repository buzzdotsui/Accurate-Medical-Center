"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Activity } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function PrescriptionQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', 'pending'],
    queryFn: async () => {
      // In a real environment, this queries the GET /api/v1/pharmacy/prescriptions endpoint.
      return [
        { id: "RX-001", patient: { name: "John Doe", id: "AMC-2026-0001" }, doctor: "Dr. Adams", time: "11:45 AM", itemsCount: 3, status: "PENDING" },
        { id: "RX-002", patient: { name: "Jane Smith", id: "AMC-2026-0009" }, doctor: "Dr. Lee", time: "12:10 PM", itemsCount: 1, status: "PENDING" },
      ];
    }
  });

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
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.length === 0 ? (
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
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Items</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((rx: any) => (
                    <tr key={rx.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium">{rx.time}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{rx.patient.name}</div>
                        <div className="text-xs text-muted-foreground">{rx.patient.id}</div>
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {rx.doctor}
                      </td>
                      <td className="p-6 align-middle">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-info/10 text-info">
                          {rx.itemsCount} meds
                        </span>
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
