"use client";

import { useQuery } from "@tanstack/react-query";
import { FlaskConical, Download } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";

interface LabResultRow {
  id: string;
  requestId: string;
  testName: string;
  status: string;
  priority: string;
  createdAt: string;
  category?: { name?: string } | null;
  result?: {
    findings: string;
    conclusion?: string | null;
    isAbnormal: boolean;
    createdAt: string;
  } | null;
  visit?: {
    visitId: string;
    doctor?: { user?: { name?: string } } | null;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  SAMPLED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ANALYZING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

/**
 * My Lab Results — patient portal, scoped to the signed-in patient only
 * via GET /api/v1/patient/lab-results.
 */
export default function MyLabResultsPage() {
  const { data, isLoading, error, refetch } = useQuery<LabResultRow[]>({
    queryKey: ["patient_lab_results"],
    queryFn: async () => {
      const res = await fetch("/api/v1/patient/lab-results");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load lab results");
      }
      const json = await res.json();
      return json.data as LabResultRow[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Lab Results</h1>
        <p className="text-muted-foreground mt-1">
          Laboratory test results ordered by your doctor.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Failed to load lab results"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <LoadingState message="Loading lab results…" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-full h-full" />}
          title="No lab results available yet"
          description="Lab results will appear here once your doctor has ordered tests and they have been completed."
        />
      ) : (
        <div className="space-y-3">
          {data.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border bg-card p-4 md:p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{row.testName}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {row.requestId}
                    {row.category?.name ? ` · ${row.category.name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ordered {new Date(row.createdAt).toLocaleDateString()}
                    {row.visit?.doctor?.user?.name
                      ? ` by ${row.visit.doctor.user.name}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[row.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {row.status}
                </span>
              </div>

              {row.result ? (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Findings
                    </span>
                    {row.result.isAbnormal && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        Abnormal
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{row.result.findings}</p>
                  {row.result.conclusion && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Conclusion
                      </span>
                      <p className="text-sm mt-1">{row.result.conclusion}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Verified {new Date(row.result.createdAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Result pending — your doctor will share it during follow-up.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
