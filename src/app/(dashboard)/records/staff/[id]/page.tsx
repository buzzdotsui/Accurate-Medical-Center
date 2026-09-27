import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Stethoscope, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function UniversalStaffProfile({ params }: { params: { id: string } }) {
  const staffId = params.id;

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: { select: { name: true, email: true, role: true, image: true } }
    }
  });

  if (!staff) return notFound();

  // Log this secure access for compliance
  await logAudit({
    action: "VIEWED",
    resource: "STAFF_RECORD",
    resourceId: staff.id,
    details: { reason: "Universal Record Search" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {staff.user.name}
          </h1>
          <p className="text-muted-foreground mt-1">Staff ID: {staff.staffId}</p>
        </div>
        <Badge variant="outline" className="text-primary bg-primary/10">
          <ShieldAlert className="w-3 h-3 mr-1" />
          Access Audited
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Staff Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{staff.phone || "No phone recorded"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{staff.user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{staff.specialization || staff.user.role.toLowerCase().replace("_", " ")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
