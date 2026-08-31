"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitPatient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface QueueVisit {
  id: string;
  visitId: string;
  startedAt: string;
  appointment?: { timeSlot?: string | null; reason?: string | null } | null;
  patient: VisitPatient;
}

function waitTime(startedAt: string): string {
  const diffMs = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

export default function ClinicalQueue() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ total: number; visits: QueueVisit[] }>({
    queryKey: ["doctor_clinical_queue"],
    queryFn: async () => {
      // IN_PROGRESS visits WITH vitals recorded = ready for doctor consultation
      const res = await fetch("/api/v1/clinical/visits?status=IN_PROGRESS&hasVitals=true&take=50");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load clinical queue");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Auto-refresh every minute
  });

  const queue = data?.visits ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Clinical Queue</h1>
          <p className="text-muted-foreground mt-1">
            Patients checked in by reception awaiting consultation.
            {data && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                {data.total} in queue
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-5 border-b flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Activity className="w-12 h-12 text-destructive/40 mb-2" />
              <p className="text-destructive font-medium">{(error as Error).message}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </div>
          ) : queue.length === 0 ? (
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
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Time Checked In
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Reason
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Wait Time
                    </th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {queue.map((visit, idx) => {
                    const wait = waitTime(visit.startedAt);
                    const waitMinutes = Math.floor(
                      (Date.now() - new Date(visit.startedAt).getTime()) / 60_000
                    );
                    return (
                      <tr
                        key={visit.id}
                        className="border-b transition-colors hover:bg-muted/30 group"
                      >
                        <td className="p-6 align-middle font-medium text-sm text-muted-foreground">
                          {visit.appointment?.timeSlot ??
                            new Date(visit.startedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </td>
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base">
                            {visit.patient.firstName} {visit.patient.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {visit.patient.patientId}
                          </div>
                        </td>
                        <td className="p-6 align-middle text-muted-foreground text-sm">
                          {visit.appointment?.reason ?? "General Consultation"}
                        </td>
                        <td className="p-6 align-middle">
                          <span
                            className={`font-semibold ${
                              idx === 0 || waitMinutes > 45
                                ? "text-destructive"
                                : "text-warning"
                            }`}
                          >
                            {wait}
                          </span>
                        </td>
                        <td className="p-6 align-middle text-right">
                          <Button
                            variant="default"
                            asChild
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          >
                            <Link href={`/doctor/consultation/${visit.id}`}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Consult
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
