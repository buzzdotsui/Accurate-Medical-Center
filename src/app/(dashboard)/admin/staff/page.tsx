import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { UserCog, Search, Users } from "lucide-react";

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all clinical and administrative staff members.</p>
        </div>
        <Button className="gap-2">
          <UserCog className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search staff by name, role, or dept..." className="pl-9" />
        </div>
      </div>

      <EmptyState
        icon={<Users className="w-full h-full" />}
        title="No staff members added yet"
        description="Staff accounts will appear here once they are created. Add clinical and administrative team members to get started."
        action={
          <Button className="gap-2">
            <UserCog className="w-4 h-4" /> Add Staff Member
          </Button>
        }
      />
    </div>
  );
}
