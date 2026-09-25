"use client";

import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, BedDouble, DoorOpen, AlertTriangle } from "lucide-react";

interface WardBed {
  id: string;
  bedNumber: string;
  status: string;
  admission: {
    id: string;
    admittedAt: string;
    reason: string;
    status: string;
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    };
  } | null;
}

interface WardRoom {
  id: string;
  roomNumber: string;
  beds: WardBed[];
}

interface Ward {
  id: string;
  name: string;
  rooms: WardRoom[];
}

function flattenBeds(wards: Ward[]): WardBed[] {
  return wards.flatMap((w) => w.rooms.flatMap((r) => r.beds));
}

export default function NurseWardPage() {
  const {
    data: wards,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Ward[]>({
    queryKey: ["nurse_wards_overview"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/wards");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load ward data");
      }
      const json = await res.json();
      return json.data as Ward[];
    },
    staleTime: 30_000,
  });

  const beds = wards ? flattenBeds(wards) : [];
  const totalBeds = beds.length;
  const occupied = beds.filter((b) => b.status === "OCCUPIED" || b.admission).length;
  const available = beds.filter((b) => b.status === "AVAILABLE" && !b.admission).length;
  const admittedPatients = beds
    .filter((b) => b.admission && b.admission.status === "ADMITTED")
    .map((b) => ({ bed: b, admission: b.admission! }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Ward Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all admitted patients and bed occupancy.</p>
        </div>
        <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isError && (
        <ErrorState
          title="Failed to load ward data"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard title="Total Beds" value={totalBeds} icon={Bed} />
            <StatCard title="Occupied" value={occupied} icon={BedDouble} />
            <StatCard title="Available" value={available} icon={DoorOpen} />
            <StatCard title="Admitted Patients" value={admittedPatients.length} icon={AlertTriangle} />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Admitted Patients</h2>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : admittedPatients.length === 0 ? (
          <EmptyState
            icon={<Bed className="w-full h-full" />}
            title="No admitted patients"
            description="Patients admitted to the ward will appear here with their bed assignments, diagnoses, and status."
          />
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bed</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Admitted</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admittedPatients.map(({ bed, admission }) => (
                  <tr key={admission.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {admission.patient.firstName} {admission.patient.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{admission.patient.patientId}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {bed.bedNumber}
                      {(() => {
                        const ward = wards?.find((w) => w.rooms.some((r) => r.beds.some((b) => b.id === bed.id)));
                        const room = ward?.rooms.find((r) => r.beds.some((b) => b.id === bed.id));
                        return room ? ` · ${room.roomNumber}${ward ? ` · ${ward.name}` : ""}` : "";
                      })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{admission.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(admission.admittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {admission.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {wards && wards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Wards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wards.map((ward) => {
              const wardBeds = ward.rooms.flatMap((r) => r.beds);
              const wardOccupied = wardBeds.filter((b) => b.status === "OCCUPIED" || b.admission).length;
              return (
                <div key={ward.id} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{ward.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {wardOccupied}/{wardBeds.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ward.rooms.length} room{ward.rooms.length !== 1 ? "s" : ""} ·{" "}
                    {wardBeds.length - wardOccupied} available
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
