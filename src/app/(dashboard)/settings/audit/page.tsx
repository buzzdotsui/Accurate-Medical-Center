"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: unknown;
  ip?: string | null;
  branchId?: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: {
    data: AuditLogEntry[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: async (): Promise<AuditLogsResponse> => {
      const res = await fetch(`/api/v1/settings/audit?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const logs = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" /> Audit Logs
            </h1>
            <p className="text-muted-foreground mt-1">Immutable record of system activities.</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Failed to load audit logs. Please try again.
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No audit events recorded yet.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/6">Timestamp</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/4">Action</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/5">Actor</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/3">Details</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="p-6 align-middle font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-primary">{log.action}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {log.resource}
                          {log.resourceId ? ` • ${log.resourceId}` : ""}
                        </div>
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-medium text-foreground font-mono text-xs">{log.userId}</div>
                        <div className="text-xs text-muted-foreground mt-1">{log.userRole}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <pre className="text-xs bg-muted/50 p-2 rounded border font-mono overflow-x-auto max-w-sm whitespace-pre-wrap">
                          {log.details ? JSON.stringify(log.details, null, 2) : "—"}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} events)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
