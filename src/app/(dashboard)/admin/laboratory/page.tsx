"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FlaskConical, ClipboardList, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LabRequest {
  id: string;
  requestId: string;
  testName: string;
  status: string;
  priority: string;
  createdAt: string;
  visit?: { patient?: { firstName: string; lastName: string; patientId: string } };
}

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  SAMPLED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ANALYZING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export default function AdminLaboratoryPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<LabRequest[]>({
    queryKey: ["admin_lab_requests"],
    queryFn: async () => {
      const res = await fetch("/api/v1/laboratory/requests");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load lab requests");
      }
      const json = await res.json();
      return json.data as LabRequest[];
    },
    staleTime: 30_000,
  });

  const requests = data ?? [];
  const pending = requests.length;
  const urgent = requests.filter((r) => r.priority === "URGENT" || r.priority === "STAT").length;
  const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Laboratory (Admin View)</h1>
          <p className="text-muted-foreground mt-1">Lab request queue, workload, and result auditing.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-background" asChild>
          <Link href="/laboratory/requests">
            <ClipboardList className="w-4 h-4" /> Open lab queue
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Active Requests" value={pending} icon={FlaskConical} />
            <StatCard title="Requested" value={byStatus.REQUESTED ?? 0} icon={ClipboardList} />
            <StatCard title="Urgent / STAT" value={urgent} icon={AlertTriangle} />
            <StatCard title="In analysis" value={byStatus.ANALYZING ?? 0} icon={FlaskConical} />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState
              title="Failed to load laboratory requests"
              description={(error as Error).message}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FlaskConical className="w-full h-full" />}
              title="No lab requests"
              description="Ordered lab requests will appear here for audit and workload review."
            />
          </div>
        ) : (
          <>
            <div className="flex justify-end px-4 pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-2"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Request</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Test</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.slice(0, 15).map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.requestId}</td>
                    <td className="px-4 py-3">{r.testName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.visit?.patient
                        ? `${r.visit.patient.firstName} ${r.visit.patient.lastName}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{r.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-muted text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t flex justify-end">
              <Button variant="link" size="sm" className="gap-1 h-auto p-0" asChild>
                <Link href="/laboratory/requests">
                  View full queue <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
