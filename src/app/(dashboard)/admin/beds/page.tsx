"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BedDouble, Plus, Trash2, Edit2, UserPlus, UserMinus, CheckCircle,
  AlertCircle, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface Admission {
  id: string;
  admissionId: string;
  patient: Patient;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  admission: Admission | null;
}

interface Room {
  id: string;
  roomNumber: string;
  beds: Bed[];
}

interface Ward {
  id: string;
  name: string;
  type: string;
  rooms: Room[];
}

const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  OCCUPIED: { label: "Occupied", icon: UserPlus, color: "text-blue-600 bg-blue-50" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, color: "text-amber-600 bg-amber-50" },
};

export default function BedManagementPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editBed, setEditBed] = useState<Bed | null>(null);
  const [wardId, setWardId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editBedNumber, setEditBedNumber] = useState("");

  const { data: wards, isLoading } = useQuery<Ward[]>({
    queryKey: ["beds-overview"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inpatient/beds");
      if (!res.ok) throw new Error("Failed to fetch bed data");
      const json = await res.json();
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/inpatient/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardId, roomNumber, bedNumber }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to add bed");
      }
    },
    onSuccess: () => {
      toast.success("Bed added successfully");
      queryClient.invalidateQueries({ queryKey: ["beds-overview"] });
      setAddOpen(false);
      setWardId("");
      setRoomNumber("");
      setBedNumber("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editBed) return;
      const res = await fetch(`/api/v1/inpatient/beds/${editBed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedNumber: editBedNumber, status: editStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update bed");
      }
    },
    onSuccess: () => {
      toast.success("Bed updated");
      queryClient.invalidateQueries({ queryKey: ["beds-overview"] });
      setEditBed(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/inpatient/beds/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to remove bed");
      }
    },
    onSuccess: () => {
      toast.success("Bed removed");
      queryClient.invalidateQueries({ queryKey: ["beds-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalBeds = wards?.flatMap((w) => w.rooms.flatMap((r) => r.beds)).length ?? 0;
  const occupied = wards?.flatMap((w) => w.rooms.flatMap((r) => r.beds)).filter((b) => b.status === "OCCUPIED").length ?? 0;
  const available = totalBeds - occupied;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Bed Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage ward beds and patient assignments.</p>
        </div>
        <Button className="gap-2 self-start" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Bed
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Beds", value: totalBeds, color: "bg-foreground/5" },
          { label: "Occupied", value: occupied, color: "bg-blue-50" },
          { label: "Available", value: available, color: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-5 border border-black/[0.04]", s.color)}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-bold font-heading mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Wards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : !wards || wards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BedDouble className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold">No wards found</p>
          <p className="text-muted-foreground text-sm mt-1">Set up wards first, then add beds.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {wards.map((ward) => (
            <div key={ward.id} className="bg-white border border-black/[0.04] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-semibold text-foreground">{ward.name}</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{ward.type}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {ward.rooms.flatMap((r) => r.beds).length} beds
                </Badge>
              </div>

              {ward.rooms.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">No rooms in this ward yet.</p>
              ) : (
                <div className="p-6 space-y-6">
                  {ward.rooms.map((room) => (
                    <div key={room.id}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Room {room.roomNumber}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {room.beds.map((bed) => {
                          const cfg = STATUS_CONFIG[bed.status];
                          const Icon = cfg.icon;
                          return (
                            <div
                              key={bed.id}
                              className={cn(
                                "relative group rounded-xl border border-black/[0.04] p-3 flex flex-col gap-2 transition-all duration-200",
                                bed.status === "AVAILABLE" && "bg-green-50/50 hover:bg-green-50",
                                bed.status === "OCCUPIED" && "bg-blue-50/50 hover:bg-blue-50",
                                bed.status === "MAINTENANCE" && "bg-amber-50/50 hover:bg-amber-50",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Bed {bed.bedNumber}</span>
                                <Icon className={cn("w-3.5 h-3.5", cfg.color.split(" ")[0])} />
                              </div>

                              {bed.admission && (
                                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                  {bed.admission.patient.firstName} {bed.admission.patient.lastName}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditBed(bed);
                                    setEditBedNumber(bed.bedNumber);
                                    setEditStatus(bed.status);
                                  }}
                                  className="p-1 rounded-md hover:bg-black/10 transition-colors"
                                  title="Edit bed"
                                >
                                  <Edit2 className="w-3 h-3 text-foreground/60" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove Bed ${bed.bedNumber}?`)) deleteMutation.mutate(bed.id);
                                  }}
                                  className="p-1 rounded-md hover:bg-red-100 transition-colors"
                                  title="Remove bed"
                                  disabled={bed.status === "OCCUPIED"}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive/60" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Bed Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-black/[0.04]">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select value={wardId} onValueChange={setWardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {(wards ?? []).map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bed Number</Label>
              <Input
                placeholder="e.g. A1"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!wardId || !roomNumber || !bedNumber || addMutation.isPending}
            >
              {addMutation.isPending ? "Adding…" : "Add Bed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Dialog */}
      <Dialog open={!!editBed} onOpenChange={(open) => !open && setEditBed(null)}>
        <DialogContent className="sm:max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl border border-black/[0.04]">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bed Number</Label>
              <Input
                value={editBedNumber}
                onChange={(e) => setEditBedNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBed(null)}>Cancel</Button>
            <Button onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
