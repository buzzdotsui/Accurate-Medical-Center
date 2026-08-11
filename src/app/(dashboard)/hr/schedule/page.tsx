"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignShiftSchema, type AssignShiftInput } from "@/lib/validations/hr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, Sun, Moon, Sunrise, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ShiftSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock staff data
  const { data: staffList } = useQuery({
    queryKey: ['hr-staff-min'],
    queryFn: async () => [
      { id: "EMP-001", name: "Dr. Sarah Adams", dept: "Cardiology" },
      { id: "EMP-002", name: "John Lee", dept: "ICU" },
    ]
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
      if (!res.ok) throw new Error("Failed to assign shift");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Shift assigned successfully.");
      form.reset({ ...form.getValues(), notes: "" });
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Shift Roster</h1>
          <p className="text-muted-foreground mt-1">Manage weekly staff allocations and departmental coverage.</p>
        </div>
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
                  <select {...form.register("staffId")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="">Select Staff...</option>
                    {staffList?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.dept})</option>)}
                  </select>
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
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Daily Coverage: {selectedDate}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Morning Shift */}
                <div className="border rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Sunrise className="w-5 h-5" />
                    <h3 className="font-bold">Morning</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm p-2 bg-background rounded border">
                      <p className="font-medium">Dr. Sarah Adams</p>
                      <p className="text-xs text-muted-foreground">Cardiology</p>
                    </div>
                  </div>
                </div>

                {/* Afternoon Shift */}
                <div className="border rounded-lg p-4 bg-warning/5">
                  <div className="flex items-center gap-2 mb-4 text-warning">
                    <Sun className="w-5 h-5" />
                    <h3 className="font-bold">Afternoon</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm p-2 bg-background rounded border text-muted-foreground text-center py-4">
                      No staff assigned
                    </div>
                  </div>
                </div>

                {/* Night Shift */}
                <div className="border rounded-lg p-4 bg-slate-900/5 dark:bg-slate-100/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="w-5 h-5" />
                    <h3 className="font-bold">Night</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm p-2 bg-background rounded border">
                      <p className="font-medium">John Lee</p>
                      <p className="text-xs text-muted-foreground">ICU</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
