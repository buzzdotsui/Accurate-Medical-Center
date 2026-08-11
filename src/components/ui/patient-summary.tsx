import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, FileText, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface PatientSummaryProps {
  allergies?: string[]
  chronicConditions?: string[]
  currentMedications?: string[]
  lastVisit?: {
    date: string
    doctor: string
    diagnosis?: string
  }
}

export function PatientSummary({
  allergies = [],
  chronicConditions = [],
  currentMedications = [],
  lastVisit,
}: PatientSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-sm font-medium text-destructive">Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((allergy, i) => (
                <Badge key={i} variant="destructive" className="font-normal text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None known</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-warning/5 border-warning/20 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Activity className="h-4 w-4 text-warning" />
          <CardTitle className="text-sm font-medium text-warning">Chronic Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          {chronicConditions.length > 0 ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {chronicConditions.map((condition, i) => (
                <li key={i}>{condition}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None recorded</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-info/5 border-info/20 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <FileText className="h-4 w-4 text-info" />
          <CardTitle className="text-sm font-medium text-info">Current Meds</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMedications.length > 0 ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {currentMedications.map((med, i) => (
                <li key={i}>{med}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None active</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
        </CardHeader>
        <CardContent>
          {lastVisit ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{lastVisit.date}</p>
              <p className="text-muted-foreground">Dr. {lastVisit.doctor}</p>
              {lastVisit.diagnosis && (
                <p className="text-xs border-t pt-1 mt-1 truncate" title={lastVisit.diagnosis}>
                  {lastVisit.diagnosis}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No previous visits</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
