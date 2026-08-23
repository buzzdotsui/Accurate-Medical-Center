"use client";

import { format } from "date-fns";
import { UserPlus, CalendarPlus, Users, CheckCircle, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTable, Column } from "@/components/ui/data-table";

export default function ReceptionDashboard() {
  const today = new Date();

  // Fetch Patients Count (assuming taking 1 item gets the total fast)
  const { data: patientsData } = useQuery({
    queryKey: ['dashboard_patients_count'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients?take=1`);
      if (!res.ok) return { data: { total: 0 } };
      return res.json();
    }
  });

  // Fetch Today's Appointments
  const { data: apptsData, isLoading: apptsLoading, error: apptsError, refetch: apptsRefetch } = useQuery({
    queryKey: ['dashboard_appointments_today'],
    queryFn: async () => {
      // In a real scenario we might pass ?date=YYYY-MM-DD
      const res = await fetch(`/api/v1/appointments?take=10`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    }
  });

  const totalPatients = patientsData?.data?.total ?? "—";
  const appointments = apptsData?.data?.appointments || [];
  const todayAppointmentsCount = apptsData?.data?.total ?? "—";
  
  // Mock logic for checkins/queue for now, as those depend on visits API
  const checkedInCount = "—";
  const queueCount = "—";

  const apptColumns: Column<any>[] = [
    { accessorKey: "timeSlot", header: "Time" },
    { accessorKey: "patientName", header: "Patient", cell: (row) => row.patient?.firstName ? `${row.patient.firstName} ${row.patient.lastName}` : 'Unknown' },
    { accessorKey: "doctorName", header: "Doctor", cell: (row) => row.doctor?.user?.name || 'Any Doctor' },
    { accessorKey: "status", header: "Status", cell: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
        row.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        row.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}.
          </h1>
          <p className="text-muted-foreground mt-1">
            Today is {format(today, "EEEE, MMM d, yyyy")}.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button className="gap-2" asChild>
            <Link href="/reception/patients/new">
              <UserPlus className="w-4 h-4" />
              Register Patient
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 bg-background">
            <CalendarPlus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={totalPatients} icon={Users} />
        <StatCard title="Today's Appts" value={todayAppointmentsCount} icon={CalendarPlus} />
        <StatCard title="Checked In" value={checkedInCount} icon={CheckCircle} />
        <StatCard title="Waiting Queue" value={queueCount} icon={Clock} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Waiting Queue */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center justify-between">
            Live Waiting Queue
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">Live</span>
          </h2>
          <EmptyState
            icon={<Clock className="w-full h-full" />}
            title="Waiting queue is empty"
            description="Patients checked in and waiting will appear here in real time."
          />
        </div>

        {/* Today's Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Recent Appointments
          </h2>
          
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm min-h-[300px]">
            {apptsLoading ? (
              <LoadingState message="Loading appointments..." />
            ) : apptsError ? (
              <ErrorState title="Failed to load" description={apptsError.message} onRetry={() => apptsRefetch()} />
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={<CalendarPlus className="w-full h-full" />}
                title="No appointments scheduled"
                description="Upcoming appointments will appear here. Book a new appointment to get started."
                action={
                  <Button className="gap-2" size="sm">
                    <CalendarPlus className="w-4 h-4" /> Book Appointment
                  </Button>
                }
              />
            ) : (
              <DataTable columns={apptColumns} data={appointments} pageSize={5} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
