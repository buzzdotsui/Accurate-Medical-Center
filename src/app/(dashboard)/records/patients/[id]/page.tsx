import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Phone, Mail, Calendar, Activity, ShieldAlert, Droplets, MapPin, Hash, CheckCircle, XCircle, HeartPulse, Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { ROLES } from "@/config/roles";
import { removePatient } from "../../actions";
import { Button } from "@/components/ui/button";
import { formatDOB, calculateAge } from "@/lib/utils/format-date";

export default async function UniversalPatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const patientId = (await params).id;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { email: true, image: true } },
      branch: true,
      appointments: {
        orderBy: { date: 'desc' },
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

  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            {patient.firstName} {patient.lastName}
            {patient.deletedAt && (
              <Badge variant="destructive" className="ml-2 text-xs">Deleted</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Patient ID: {patient.patientId} • Branch: {patient.branch?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-primary bg-primary/10">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Access Audited
          </Badge>
          
          {isAdmin && !patient.deletedAt && (
            <form action={async () => {
              "use server";
              await removePatient(patient.id);
            }}>
              <Button variant="destructive" size="sm">Remove Patient</Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card className="shadow-sm border-none ring-1 ring-border/50 lg:col-span-3">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="capitalize">{patient.gender?.toLowerCase() || "Not recorded"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Born <span className="font-medium">{formatDOB(patient.dateOfBirth)}</span>{patient.dateOfBirth && <span className="text-muted-foreground ml-1">({calculateAge(patient.dateOfBirth)})</span>}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="capitalize">{patient.maritalStatus?.toLowerCase() || "Marital Status N/A"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{patient.phone || "No phone recorded"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{patient.email || patient.user?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{patient.address || "No address recorded"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {patient.occupation && (
          <Card className="shadow-sm border-none ring-1 ring-border/50 lg:col-span-3 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Occupation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
              {patient.occupation}
            </CardContent>
          </Card>
        )}

        {patient.emergencyContactName && (
          <Card className="shadow-sm border-none ring-1 ring-border/50">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-destructive" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{patient.emergencyContactName}</span>
              </div>
              {patient.emergencyContactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{patient.emergencyContactPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Medical Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Droplets className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Blood Group: {patient.bloodGroup || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Genotype: {patient.genotype || "Unknown"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 md:col-span-2 shadow-sm border-none ring-1 ring-border/50">
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
                {patient.appointments.map((apt: any) => (
                  <div key={apt.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{new Date(apt.date).toLocaleDateString('en-GB')}</span>
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
