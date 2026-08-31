"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { Users } from "lucide-react";

interface StaffMember {
  id: string;
  staffId: string;
  isActive: boolean;
  specialization: string | null;
  user: { name: string; email: string; role: string };
  department: { name: string; code: string } | null;
}

export default function StaffDirectory() {
  const { data, isLoading, isError, error, refetch } = useQuery<StaffMember[]>({
    queryKey: ["hr-staff"],
    queryFn: async () => {
      const res = await fetch("/api/v1/hr/staff");
      if (!res.ok) throw new Error(`Failed to fetch staff: ${res.statusText}`);
      const json = await res.json();
      return json.data as StaffMember[];
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Staff Directory</h1>
          <p className="text-muted-foreground mt-1">View hospital personnel records.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState
              title="Failed to load staff"
              description={(error as Error).message}
              onRetry={() => refetch()}
            />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="w-full h-full" />}
              title="No staff members found"
              description="Staff accounts will appear here once they are created."
            />
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Name / ID</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Department</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Contact</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.map((staff) => (
                  <tr key={staff.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 align-middle">
                      <div className="font-semibold text-foreground">{staff.user.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{staff.staffId}</div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABELS[staff.user.role as Role] ?? staff.user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 align-middle text-sm">
                      {staff.department ? (
                        <span>
                          {staff.department.name}
                          <span className="ml-1 text-xs text-muted-foreground">({staff.department.code})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle text-sm text-muted-foreground">
                      {staff.user.email}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <Badge
                        variant={staff.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {staff.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
