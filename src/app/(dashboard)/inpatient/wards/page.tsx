"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bed, User, BedDouble } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface BedRecord {
  id: string;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | string;
  admission: { patient: Patient } | null;
}

interface RoomRecord {
  id: string;
  roomNumber: string;
  beds: BedRecord[];
}

interface WardRecord {
  id: string;
  name: string;
  type: string;
  rooms: RoomRecord[];
}

export default function WardOverview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inpatient_wards"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/wards");
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to load wards");
      }
      return res.json();
    },
  });

  const wards: WardRecord[] = data?.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Ward & Bed Overview</h1>
        <p className="text-muted-foreground mt-1">Live map of hospital bed availability and occupancy.</p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading wards…" />
      ) : error ? (
        <ErrorState
          title="Failed to load wards"
          description={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : wards.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="w-full h-full" />}
          title="No wards configured yet"
          description="No Ward, Room, or Bed records exist for your branch yet. There is currently no way to create them from within the app — an administrator will need to seed this data before patients can be admitted."
        />
      ) : (
        <>
          <div className="flex gap-4 p-4 border rounded-lg bg-muted/30 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Occupied</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning"></div> Maintenance</div>
          </div>

          <div className="space-y-8">
            {wards.map((ward) => {
              const allBeds = ward.rooms.flatMap((r) => r.beds);
              const occupied = allBeds.filter((b) => b.status === "OCCUPIED").length;
              return (
                <Card key={ward.id} className="border-none shadow-sm ring-1 ring-border/50">
                  <CardHeader className="border-b bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl">{ward.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{ward.type} • Capacity: {allBeds.length}</p>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {occupied} / {allBeds.length} Occupied
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {ward.rooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No rooms configured for this ward.</p>
                    ) : (
                      ward.rooms.map((room) => (
                        <div key={room.id}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Room {room.roomNumber}
                          </p>
                          {room.beds.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No beds in this room.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
                              {room.beds.map((bed) => (
                                <div
                                  key={bed.id}
                                  className={`relative p-3 rounded-lg border flex flex-col items-center text-center group transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                                    bed.status === "AVAILABLE"
                                      ? "bg-success/5 border-success/20 hover:border-success/50 hover:shadow-[0_4px_12px_rgba(34,197,94,0.1)]"
                                      : bed.status === "MAINTENANCE"
                                      ? "bg-warning/5 border-warning/20 hover:border-warning/50 hover:shadow-[0_4px_12px_rgba(245,158,11,0.1)]"
                                      : "bg-destructive/5 border-destructive/20 hover:border-destructive/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)]"
                                  }`}
                                >
                                  <Bed
                                    className={`w-6 h-6 mb-2 ${
                                      bed.status === "AVAILABLE"
                                        ? "text-success"
                                        : bed.status === "MAINTENANCE"
                                        ? "text-warning"
                                        : "text-destructive"
                                    }`}
                                  />
                                  <span className="font-bold text-sm">{bed.bedNumber}</span>

                                  {bed.status === "OCCUPIED" && bed.admission?.patient && (
                                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 z-10">
                                      <User className="w-4 h-4 text-foreground mb-1" />
                                      <span className="text-xs font-medium text-foreground truncate w-full">
                                        {bed.admission.patient.firstName} {bed.admission.patient.lastName}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground truncate w-full">
                                        {bed.admission.patient.patientId}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
