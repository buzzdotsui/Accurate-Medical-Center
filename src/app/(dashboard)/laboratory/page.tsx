"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface LabRequest {
  id: string;
  testName: string;
  status: "REQUESTED" | "SAMPLED" | "ANALYZING";
  priority: "ROUTINE" | "URGENT" | "STAT";
  createdAt: string;
  visit: {
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    };
  };
  doctor: {
    user: {
      name: string;
    };
  };
  category: {
    name: string;
  };
}

function priorityVariant(priority: string) {
  if (priority === "STAT") return "destructive" as const;
  if (priority === "URGENT") return "warning" as const;
  return "secondary" as const;
}

function statusVariant(status: string) {
  if (status === "ANALYZING") return "warning" as const;
  if (status === "SAMPLED") return "info" as const;
  return "outline" as const;
}

export default function LaboratoryDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<
    LabRequest[]
  >({
    queryKey: ["lab_dashboard_requests"],
    queryFn: async () => {
      const res = await fetch("/api/v1/laboratory/requests");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load lab requests");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const pending = data?.filter((r) => r.status === "REQUESTED").length ?? 0;
  const inProcess =
    data?.filter((r) => r.status === "SAMPLED" || r.status === "ANALYZING")
      .length ?? 0;
  const totalActive = data?.length ?? 0;
  const statUrgent =
    data?.filter((r) => r.priority === "STAT" || r.priority === "URGENT")
      .length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Laboratory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test requests, sample tracking, and result entry.
          </p>
        </div>
        <div className="flex gap-3">
          {error && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Retry
            </Button>
          )}
          <Button className="gap-2" asChild>
            <Link href="/laboratory/requests">
              <Plus className="w-4 h-4" /> Enter Results
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Pending" value={pending} icon={Clock} />
            <StatCard
              title="In Processing"
              value={inProcess}
              icon={FlaskConical}
            />
            <StatCard
              title="Total Active"
              value={totalActive}
              icon={CheckCircle}
            />
            <StatCard
              title="STAT / Urgent"
              value={statUrgent}
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">
          Pending Lab Requests
        </h2>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="w-10 h-10 text-destructive/50 mb-3" />
                <h3 className="text-base font-medium text-destructive">
                  Failed to load lab requests
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(error as Error).message}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : !data || data.length === 0 ? (
              <EmptyState
                icon={<FlaskConical className="w-full h-full" />}
                title="No pending lab requests"
                description="Lab requests sent by doctors will appear here for sample collection and processing."
              />
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-muted/50 [&_tr]:border-b">
                    <tr className="border-b transition-colors">
                      <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                        Patient
                      </th>
                      <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                        Test
                      </th>
                      <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                        Category
                      </th>
                      <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                        Priority
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
                    {data.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b transition-colors hover:bg-muted/30 group"
                      >
                        <td className="px-6 py-4 align-middle">
                          <p className="font-medium">
                            {req.visit.patient.firstName}{" "}
                            {req.visit.patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {req.visit.patient.patientId}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-middle font-medium">
                          {req.testName}
                        </td>
                        <td className="px-6 py-4 align-middle text-muted-foreground">
                          {req.category.name}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <Badge variant={priorityVariant(req.priority)}>
                            {req.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <Badge variant={statusVariant(req.status)}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                            asChild
                          >
                            <Link href={`/laboratory/requests/${req.id}`}>
                              View
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
    </div>
  );
}
