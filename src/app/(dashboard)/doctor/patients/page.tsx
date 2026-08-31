"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, RefreshCw, ExternalLink } from "lucide-react";

interface Diagnosis {
  description: string;
  type: string;
}

interface Visit {
  id: string;
  visitId: string;
  startedAt: string;
  status: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
  };
  diagnoses: Diagnosis[];
}

interface VisitsResponse {
  visits: Visit[];
  total: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DoctorPatientsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<VisitsResponse>({
    queryKey: ["doctor_my_patients"],
    queryFn: async () => {
      const res = await fetch("/api/v1/clinical/visits?mine=true&status=COMPLETED&take=50");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load patient visits");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const visits = data?.visits ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Patients</h1>
          <p className="text-muted-foreground mt-1">
            Patients from your completed consultations.
            {data && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                {data.total} total
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
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-5 border-b flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Users className="w-12 h-12 text-destructive/40 mb-2" />
              <p className="text-destructive font-medium">{(error as Error).message}</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </div>
          ) : visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No patients yet</h3>
              <p className="text-muted-foreground mt-1">
                Patients from your completed consultations will appear here.
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Patient ID
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Visit Date
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Diagnosis
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {visits.map((visit) => {
                    const primaryDx = visit.diagnoses?.[0]?.description ?? "—";
                    return (
                      <tr
                        key={visit.id}
                        className="border-b transition-colors hover:bg-muted/30 group"
                      >
                        <td className="p-6 align-middle">
                          <div className="font-bold text-base">
                            {visit.patient.firstName} {visit.patient.lastName}
                          </div>
                        </td>
                        <td className="p-6 align-middle font-mono text-xs text-muted-foreground">
                          {visit.patient.patientId}
                        </td>
                        <td className="p-6 align-middle text-muted-foreground text-sm">
                          {formatDate(visit.startedAt)}
                        </td>
                        <td className="p-6 align-middle text-sm max-w-[200px] truncate">
                          {primaryDx}
                        </td>
                        <td className="p-6 align-middle">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {visit.status}
                          </span>
                        </td>
                        <td className="p-6 align-middle text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          >
                            <Link href={`/admin/patients/${visit.patient.id}`}>
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
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
