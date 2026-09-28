"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { StaffProfileSheet } from "@/components/admin/staff/staff-profile-sheet";

interface StaffMember {
  id: string;
  staffId: string;
  isActive: boolean;
  specialization: string | null;
  user: { name: string; email: string; role: string };
  department: { name: string; code: string } | null;
}

export default function StaffDirectory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/hr/staff/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to delete staff member");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Staff member deleted");
      queryClient.invalidateQueries({ queryKey: ["hr-staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((staff) => (
              <div 
                key={staff.id} 
                onClick={() => setSelectedStaffId(staff.id)}
                className="group relative flex flex-col bg-white border border-black/[0.04] p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 ring-1 ring-primary/20">
                      {staff.user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{staff.user.name}</h3>
                      <p className="text-xs text-muted-foreground">{staff.staffId}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-black/[0.02] border-transparent font-semibold text-foreground/70">
                    {ROLE_LABELS[staff.user.role as Role] ?? staff.user.role}
                  </Badge>
                </div>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-foreground">
                      {staff.department ? staff.department.name : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium text-foreground truncate max-w-[120px]" title={staff.user.email}>
                      {staff.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.04]">
                  <Badge
                    variant={staff.isActive ? "default" : "secondary"}
                    className={cn("text-[10px]", staff.isActive ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : "")}
                  >
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this staff member?")) {
                          deleteMutation.mutate(staff.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      aria-label="Delete staff member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StaffProfileSheet 
        staffId={selectedStaffId} 
        onClose={() => setSelectedStaffId(null)} 
      />
    </div>
  );
}
