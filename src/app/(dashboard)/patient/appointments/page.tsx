"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";

interface Appointment {
  id: string;
  appointmentId: string;
  date: string;
  timeSlot: string | null;
  type: string;
  status: string;
  reason: string | null;
  staff: { user: { name: string } } | null;
}

interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

const STATUS_CLASSES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  ARRIVED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  NO_SHOW: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isOnline = type === "ONLINE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOnline
          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isOnline ? "Online" : "In Person"}
    </span>
  );
}

export default function MyAppointmentsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<AppointmentsResponse>({
    queryKey: ["patient_appointments"],
    queryFn: async () => {
      const res = await fetch("/api/v1/appointments?take=20");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load appointments");
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground mt-1">
            {data
              ? `${data.total} appointment${data.total !== 1 ? "s" : ""} on record`
              : "View all your scheduled and past appointments"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
          <Button
            variant="link"
            size="sm"
            className="ml-2 h-auto p-0 text-destructive underline"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : data?.appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center px-4">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No appointments yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Book your first appointment to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Time Slot</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Reason</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Doctor</th>
              </tr>
            </thead>
            <tbody>
              {data?.appointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(apt.date).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {apt.timeSlot ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={apt.type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                    {apt.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {apt.staff?.user?.name ?? "Any Doctor"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
