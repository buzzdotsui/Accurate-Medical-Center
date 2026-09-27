import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Phone, Mail, Calendar, Activity, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function UniversalPatientProfile({ params }: { params: { id: string } }) {
  const patientId = params.id;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { email: true, image: true } },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 5
      }
    }
  });

  if (!patient) return notFound();

  // Log this secure access for HIPAA compliance
  await logAudit({
    action: "VIEWED",
    resource: "PATIENT_RECORD",
    resourceId: patient.id,
    details: { reason: "Universal Record Search" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">Patient ID: {patient.patientId}</p>
        </div>
        <Badge variant="outline" className="text-primary bg-primary/10">
          <ShieldAlert className="w-3 h-3 mr-1" />
          Access Audited
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{patient.phone || "No phone recorded"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{patient.email || patient.user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not recorded"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {patient.appointments.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No recent appointments found.</p>
            ) : (
              <div className="space-y-4">
                {patient.appointments.map((apt) => (
                  <div key={apt.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{new Date(apt.scheduledAt).toLocaleDateString()}</span>
                    <Badge variant={apt.status === "COMPLETED" ? "default" : "secondary"}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
