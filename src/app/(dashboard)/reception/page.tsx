"use client";

import { useState } from "react";
import { format } from "date-fns";
import { UserPlus, CalendarPlus, Users, CheckCircle, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";

// Mock data for the reception dashboard
const mockAppointments = [
  { id: "1", patientName: "Adebayo Johnson", time: "09:00 AM", doctor: "Dr. Sarah Smith", type: "Follow-up", status: "Checked In" },
  { id: "2", patientName: "Ngozi Eze", time: "09:30 AM", doctor: "Dr. Ahmed Musa", type: "Consultation", status: "Scheduled" },
  { id: "3", patientName: "Michael Okoye", time: "10:00 AM", doctor: "Dr. Sarah Smith", type: "Check-up", status: "Scheduled" },
];

const mockWaitingQueue = [
  { id: "1", patientName: "Adebayo Johnson", token: "A-01", waitTime: "15 mins", destination: "Room 3 (Dr. Smith)" },
  { id: "2", patientName: "Chioma Chukwu", token: "B-12", waitTime: "5 mins", destination: "Triage" },
];

export default function ReceptionDashboard() {
  const [userName] = useState("Sarah");
  const today = new Date();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Good morning, {userName}.
          </h1>
          <p className="text-muted-foreground mt-1">
            Today is {format(today, "EEEE, MMM d, yyyy")}. You have 42 appointments scheduled.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Register Patient
          </Button>
          <Button variant="outline" className="gap-2 bg-background">
            <CalendarPlus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appts"
          value="42"
          icon={Users}
        />
        <StatCard
          title="Checked In"
          value="18"
          icon={CheckCircle}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Waiting Queue"
          value="8"
          icon={Clock}
        />
        <StatCard
          title="Avg Wait Time"
          value="12m"
          icon={Timer}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Waiting Queue */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center justify-between">
            Live Waiting Queue
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">Updated just now</span>
          </h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable 
              columns={[
                { header: "Token", accessorKey: "token" },
                { header: "Patient", accessorKey: "patientName" },
                { header: "Wait Time", accessorKey: "waitTime" },
                { header: "Destination", accessorKey: "destination" },
              ]}
              data={mockWaitingQueue}
            />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Upcoming Appointments
          </h2>
          <div className="border rounded-xl bg-card overflow-hidden">
            <DataTable 
              columns={[
                { header: "Time", accessorKey: "time" },
                { header: "Patient", accessorKey: "patientName" },
                { header: "Doctor", accessorKey: "doctor" },
                { 
                  header: "Status", 
                  accessorKey: "status",
                  cell: (row) => (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Checked In' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {row.status}
                    </span>
                  )
                },
              ]}
              data={mockAppointments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
