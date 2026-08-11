"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radiation, Search } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function RadiologyQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ['radiology-requests'],
    queryFn: async () => {
      // Mock data for frontend demo
      return [
        { id: "RAD-001", patient: { name: "Mary Smith", id: "AMC-2026-0004" }, type: "CT Scan", region: "Chest", doctor: "Dr. Adams", priority: "STAT", time: "11:15 AM", status: "SCANNED" },
        { id: "RAD-002", patient: { name: "John Doe", id: "AMC-2026-0001" }, type: "XRAY", region: "Left Ankle", doctor: "Dr. Lee", priority: "ROUTINE", time: "11:30 AM", status: "REQUESTED" },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Imaging Queue</h1>
          <p className="text-muted-foreground mt-1">Manage active radiology and diagnostic imaging requests.</p>
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
              <Radiation className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No active imaging requests</h3>
              <p className="text-muted-foreground mt-1">All imaging queues are clear.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order Time</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Scan details</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Priority</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((req: any) => (
                    <tr key={req.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium">{req.time}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{req.patient.name}</div>
                        <div className="text-xs text-muted-foreground">{req.patient.id}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-medium">{req.type}</div>
                        <div className="text-xs text-muted-foreground">{req.region}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          req.priority === 'STAT' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-6 align-middle font-medium">
                         {req.status}
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant={req.priority === 'STAT' ? 'destructive' : 'default'} asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link href={`/radiology/requests/${req.id}`}>
                            {req.status === 'SCANNED' ? 'Write Report' : 'Upload Image'}
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
