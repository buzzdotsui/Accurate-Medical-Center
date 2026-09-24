"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignShiftSchema, type AssignShiftInput } from "@/lib/validations/hr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, CalendarDays, Sun, Moon, Sunrise, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface StaffOption {
  id: string;
  staffId: string;
  department?: { name?: string } | null;
  user: { name: string; role: string };
}

interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  department: string | null;
  shift: string;
  notes: string | null;
}

interface ShiftsResponse {
  date: string;
  assignments: ShiftAssignment[];
}

const SHIFT_BLOCKS = [
  { key: "MORNING", label: "Morning", icon: Sunrise, className: "text-primary bg-primary/5" },
  { key: "AFTERNOON", label: "Afternoon", icon: Sun, className: "text-warning bg-warning/5" },
  { key: "NIGHT", label: "Night", icon: Moon, className: "bg-slate-900/5 dark:bg-slate-100/5" },
] as const;

export default function ShiftSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  // Real staff directory (SUPER_ADMIN/ADMIN only — same RBAC as POST /hr/shifts)
  const { data: staffList, isLoading: staffLoading } = useQuery<StaffOption[]>({
    queryKey: ['hr-staff-min'],
    queryFn: async () => {
      const res = await fetch('/api/v1/hr/staff');
      if (!res.ok) throw new Error('Failed to load staff');
      const json = await res.json();
      return json.data as StaffOption[];
    },
    staleTime: 60_000,
  });

  // Real shift assignments for the selected date (from ASSIGN_SHIFT audit events)
  const { data: shifts, isLoading: shiftsLoading, error: shiftsError, refetch } = useQuery<ShiftsResponse>({
    queryKey: ['hr-shifts', selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/v1/hr/shifts?date=${encodeURIComponent(selectedDate)}`);
      if (!res.ok) throw new Error('Failed to load shift assignments');
      const json = await res.json();
      return json.data as ShiftsResponse;
    },
    staleTime: 30_000,
  });

  const form = useForm<AssignShiftInput>({
    resolver: zodResolver(AssignShiftSchema),
    defaultValues: {
      staffId: "",
      date: selectedDate,
      shift: "MORNING",
      notes: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: AssignShiftInput) => {
      const res = await fetch(`/api/v1/hr/shifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to assign shift");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Shift assigned successfully.");
      form.reset({ ...form.getValues(), notes: "" });
      queryClient.invalidateQueries({ queryKey: ["hr-shifts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const assignmentsByShift = {
    MORNING: shifts?.assignments.filter((a) => a.shift === "MORNING") ?? [],
    AFTERNOON: shifts?.assignments.filter((a) => a.shift === "AFTERNOON") ?? [],
    NIGHT: shifts?.assignments.filter((a) => a.shift === "NIGHT") ?? [],
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Shift Roster</h1>
          <p className="text-muted-foreground mt-1">Manage weekly staff allocations and departmental coverage.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44"
            aria-label="Roster date"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50 sticky top-6">
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Assign Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Staff Member</label>
                  <select
                    {...form.register("staffId")}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    disabled={staffLoading}
                  >
                    <option value="">{staffLoading ? "Loading staff…" : "Select Staff..."}</option>
                    {staffList?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.user.name} ({s.department?.name ?? "No dept"})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.staffId && (
                    <p className="text-xs text-destructive">{form.formState.errors.staffId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" {...form.register("date")} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Shift Type</label>
                  <select {...form.register("shift")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="MORNING">Morning (07:00 - 15:00)</option>
                    <option value="AFTERNOON">Afternoon (15:00 - 23:00)</option>
                    <option value="NIGHT">Night (23:00 - 07:00)</option>
                    <option value="OFF">Day Off</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Input {...form.register("notes")} placeholder="e.g. On-call coverage" />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Assignment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">Daily Coverage: {selectedDate}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={shiftsLoading}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {shiftsError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {(shiftsError as Error).message}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SHIFT_BLOCKS.map((block) => {
                    const Icon = block.icon;
                    const rows = assignmentsByShift[block.key];
                    return (
                      <div key={block.key} className={`border rounded-lg p-4 ${block.className}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className="w-5 h-5" />
                          <h3 className="font-bold">{block.label}</h3>
                          <span className="ml-auto text-xs text-muted-foreground bg-background/70 px-2 py-0.5 rounded-full">
                            {shiftsLoading ? "…" : rows.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {shiftsLoading ? (
                            <>
                              <Skeleton className="h-12 w-full rounded" />
                              <Skeleton className="h-12 w-full rounded" />
                            </>
                          ) : rows.length === 0 ? (
                            <div className="text-sm p-2 bg-background rounded border text-muted-foreground text-center py-4">
                              No staff assigned
                            </div>
                          ) : (
                            rows.map((a) => (
                              <div key={a.id} className="text-sm p-2 bg-background rounded border">
                                <p className="font-medium">{a.staffName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {a.department ?? "No department"}
                                  {a.notes ? ` · ${a.notes}` : ""}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
