"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Play } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function ClinicalQueue() {
  // Simulating fetching active queue from API
  const { data: queue, isLoading } = useQuery({
    queryKey: ['clinical-queue'],
    queryFn: async () => {
      // MOCK DATA for frontend wiring before backend routes are fully extended for visits
      return [
        { id: "VISIT-001", patient: { name: "John Doe", id: "AMC-2026-0001" }, time: "09:15 AM", waitTime: "24m", type: "IN_PERSON", status: "WAITING" },
        { id: "VISIT-002", patient: { name: "Sarah Smith", id: "AMC-2026-0002" }, time: "09:30 AM", waitTime: "9m", type: "IN_PERSON", status: "WAITING" },
        { id: "VISIT-003", patient: { name: "Michael Johnson", id: "AMC-2026-0003" }, time: "09:45 AM", waitTime: "2m", type: "ONLINE", status: "WAITING" },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Clinical Queue</h1>
          <p className="text-muted-foreground mt-1">Patients checked in by reception awaiting consultation.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : queue?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Queue is empty</h3>
              <p className="text-muted-foreground mt-1">No patients are currently waiting.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Time Checked In</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Wait Time</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {queue?.map((visit: any, idx: number) => (
                    <tr key={visit.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium">{visit.time}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{visit.patient.name}</div>
                        <div className="text-xs text-muted-foreground">{visit.patient.id}</div>
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {visit.type}
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`font-semibold ${idx === 0 ? 'text-destructive' : 'text-warning'}`}>
                          {visit.waitTime}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant="default" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link href={`/doctor/consultation/${visit.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Consult
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
