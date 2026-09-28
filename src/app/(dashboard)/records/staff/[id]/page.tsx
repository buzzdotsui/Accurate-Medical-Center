import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { User, Phone, Mail, Stethoscope, ShieldAlert, Building, MapPin, Hash, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { ROLES } from "@/config/roles";
import { removeStaff } from "../../actions";
import { Button } from "@/components/ui/button";
import { formatDOB, calculateAge } from "@/lib/utils/format-date";

export default async function UniversalStaffProfile({ params }: { params: Promise<{ id: string }> }) {
  const staffId = (await params).id;

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: { select: { name: true, email: true, role: true, image: true } },
      department: true,
      branch: true
    }
  });

  if (!staff) return notFound();

  await logAudit({
    action: "VIEWED",
    resource: "STAFF_RECORD",
    resourceId: staff.id,
    details: { reason: "Universal Record Search" }
  });

  const session = await auth.api.getSession({ headers: await headers() });
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;

  const initials = staff.user.name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards pb-12 max-w-3xl mx-auto">

      {/* Profile Hero Card */}
      <div className="bg-white border border-black/[0.04] rounded-2xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4">
            {staff.user.image ? (
              <img
                src={staff.user.image}
                alt={staff.user.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-muted"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {initials}
              </div>
            )}
            <div className="mb-1">
              <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                {staff.user.name}
                {!staff.isActive && (
                  <Badge variant="destructive" className="text-xs">Inactive</Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-sm">{staff.staffId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary bg-primary/10">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Access Audited
            </Badge>
            {isAdmin && staff.isActive && (
              <form action={async () => {
                "use server";
                await removeStaff(staff.id);
              }}>
                <Button variant="destructive" size="sm">Remove</Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Contact Info */}
        <div className="bg-white border border-black/[0.04] rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Contact
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{staff.user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{staff.phone || "Not recorded"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{staff.address || "Not recorded"}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                Born{" "}
                <span className="font-medium">
                  {formatDOB(staff.dateOfBirth)}
                </span>
                {staff.dateOfBirth && (
                  <span className="text-muted-foreground ml-1">({calculateAge(staff.dateOfBirth)})</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="bg-white border border-black/[0.04] rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Building className="w-3.5 h-3.5" /> Work Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Branch</span>
              <span className="font-medium">{staff.branch?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{staff.department?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Specialization</span>
              <span className="font-medium capitalize">{staff.specialization || "General"}</span>
            </div>
          </div>
        </div>

        {/* Credentials & Status */}
        <div className="bg-white border border-black/[0.04] rounded-2xl shadow-sm p-6 space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Credentials & Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/[0.02] rounded-xl p-4 flex flex-col gap-1 border border-black/[0.04]">
              <span className="text-xs text-muted-foreground">License No.</span>
              <span className="font-semibold font-mono">{staff.licenseNumber || "N/A"}</span>
            </div>
            <div className="bg-black/[0.02] rounded-xl p-4 flex flex-col gap-1 border border-black/[0.04]">
              <span className="text-xs text-muted-foreground">Role</span>
              <span className="font-semibold capitalize">{staff.user.role.replace(/_/g, " ")}</span>
            </div>
            <div className="bg-black/[0.02] rounded-xl p-4 flex items-center gap-3 border border-black/[0.04]">
              {staff.isActive ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <div>
                <span className="text-xs text-muted-foreground block">Status</span>
                <span className="font-semibold">{staff.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
