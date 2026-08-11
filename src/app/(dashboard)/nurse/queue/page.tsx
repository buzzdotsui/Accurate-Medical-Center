"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function NurseTriageQueue() {
  const { data: queue, isLoading } = useQuery({
    queryKey: ['triage-queue'],
    queryFn: async () => {
      // Mocking triage queue - in real world this queries Visits where vitals is null
      return [
        { id: "VISIT-001", patient: { name: "Mary Smith", id: "AMC-2026-0004" }, time: "10:15 AM", waitTime: "12m", priority: "ROUTINE" },
        { id: "VISIT-002", patient: { name: "James Brown", id: "AMC-2026-0005" }, time: "10:20 AM", waitTime: "7m", priority: "URGENT" },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Triage Queue</h1>
          <p className="text-muted-foreground mt-1">Patients awaiting vitals assessment.</p>
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
              <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Triage queue is empty</h3>
              <p className="text-muted-foreground mt-1">All checked-in patients have their vitals recorded.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Checked In</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Wait Time</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Priority</th>
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
                      <td className="p-6 align-middle font-semibold text-warning">
                        {visit.waitTime}
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          visit.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'
                        }`}>
                          {visit.priority}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant="default" asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link href={`/nurse/vitals/${visit.id}`}>
                            <HeartPulse className="w-4 h-4 mr-2" />
                            Record Vitals
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
