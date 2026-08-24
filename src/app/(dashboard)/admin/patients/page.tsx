"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlus, Search, Users } from "lucide-react";
import { RegisterPatientDialog } from "@/components/admin/patients/register-patient-dialog";

export default function AdminPatientsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse, search, and manage all registered patients.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <UserPlus className="w-4 h-4" /> Register Patient
        </Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or phone..." className="pl-9" />
        </div>
      </div>

      <EmptyState
        icon={<Users className="w-full h-full" />}
        title="No patients registered yet"
        description="Patients will appear here once they are registered in the system. Use the button above to register your first patient."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <UserPlus className="w-4 h-4" /> Register Patient
          </Button>
        }
      />

      <RegisterPatientDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
