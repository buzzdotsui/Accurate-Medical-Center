import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, FlaskConical, Receipt } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Patient Portal</h1>
        <p className="text-muted-foreground mt-1">Welcome to Accurate Medical Center. View your records and appointments here.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Appointments", value: "0", icon: Calendar },
          { title: "Lab Results", value: "0", icon: FlaskConical },
          { title: "Prescriptions", value: "0", icon: FileText },
          { title: "Pending Bills", value: "₦0.00", icon: Receipt },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
