"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarPlus, Calendar } from "lucide-react";
import { BookAppointmentDialog } from "@/components/admin/appointments/book-appointment-dialog";

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">All scheduled, ongoing, and completed appointments.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <CalendarPlus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      <EmptyState
        icon={<Calendar className="w-full h-full" />}
        title="No appointments scheduled"
        description="Appointments will appear here once they are booked. Schedule a new appointment to get started."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <CalendarPlus className="w-4 h-4" /> Book Appointment
          </Button>
        }
      />

      <BookAppointmentDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
