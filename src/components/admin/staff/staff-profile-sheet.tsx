"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Phone, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDOB, calculateAge } from "@/lib/utils/format-date";

interface StaffProfileSheetProps {
  staffId: string | null;
  onClose: () => void;
}

export function StaffProfileSheet({ staffId, onClose }: StaffProfileSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-profile", staffId],
    queryFn: async () => {
      if (!staffId) return null;
      const res = await fetch(`/api/v1/hr/staff`);
      const json = await res.json();
      type StaffEntry = {
        id: string;
        staffId: string;
        phone?: string;
        address?: string;
        dateOfBirth?: string;
        specialization?: string;
        licenseNumber?: string;
        isActive?: boolean;
        department?: { name: string };
        user: { name: string; email: string; role: string; image?: string };
      };
      return (json.data as StaffEntry[]).find((s) => s.id === staffId) ?? null;
    },
    enabled: !!staffId,
  });

  return (
    <Sheet open={!!staffId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full bg-white/90 backdrop-blur-xl border-l border-black/4 p-0 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 space-y-6">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-full h-40" />
          </div>
        ) : data ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="bg-linear-to-br from-primary/20 to-primary/5 px-8 pt-8 pb-6 flex flex-col items-center text-center">
              {data.user.image ? (
                <Image
                  src={data.user.image}
                  alt={data.user.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-muted mb-4"
                  unoptimized
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-md bg-white flex items-center justify-center font-bold text-3xl text-primary mb-4">
                  {data.user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <SheetTitle className="text-xl font-bold font-heading">{data.user.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{data.staffId}</p>
              <Badge variant="outline" className="mt-3 bg-white/80 border-transparent shadow-sm text-xs">
                {data.user.role.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{data.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{data.phone || "Not recorded"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{data.address || "Not recorded"}</span>
                  </div>
                  {data.dateOfBirth && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Born</span>
                      <span className="font-medium">{formatDOB(data.dateOfBirth)}</span>
                      <span className="text-muted-foreground">({calculateAge(data.dateOfBirth)})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Details</h4>
                <div className="bg-black/2 rounded-xl border border-black/4 divide-y divide-black/4">
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{data.department?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Specialization</span>
                    <span className="font-medium capitalize">{data.specialization || "General"}</span>
                  </div>
                </div>
              </div>

              {/* Credentials & Status */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credentials & Status</h4>
                <div className="bg-black/2 rounded-xl border border-black/4 divide-y divide-black/4">
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">License No.</span>
                    <span className="font-medium font-mono">{data.licenseNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm">
                    {data.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-medium">{data.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 flex items-center justify-center h-full text-muted-foreground">
            Staff not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
