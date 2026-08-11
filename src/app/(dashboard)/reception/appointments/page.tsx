"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarPlus, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AppointmentsList() {
  const [dateFilter, setDateFilter] = React.useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', dateFilter],
    queryFn: async () => {
      const res = await fetch(`/api/v1/appointments?date=${dateFilter}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    }
  });

  const markArrivedMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARRIVED" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Patient marked as Arrived and added to Clinical Queue");
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage today's schedule and check-in patients.</p>
        </div>
        <Button asChild>
          <Link href="/reception/appointments/new">
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center max-w-sm">
            <label className="text-sm font-medium mr-4">Filter Date:</label>
            <Input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-muted/50 border-none"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No appointments</h3>
              <p className="text-muted-foreground mt-1">There are no appointments scheduled for this date.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Doctor</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.data?.map((appointment: any) => (
                    <tr key={appointment.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{appointment.timeSlot || 'Any Time'}</td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{appointment.patient.firstName} {appointment.patient.lastName}</div>
                        <div className="text-xs text-muted-foreground">{appointment.patient.patientId}</div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {appointment.staff ? `Dr. ${appointment.staff.user.name}` : 'Unassigned'}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          appointment.status === 'SCHEDULED' ? 'bg-info/10 text-info' :
                          appointment.status === 'ARRIVED' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        {appointment.status === 'SCHEDULED' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => markArrivedMutation.mutate(appointment.id)}
                            disabled={markArrivedMutation.isPending}
                          >
                            Mark Arrived
                          </Button>
                        )}
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
  );
}
