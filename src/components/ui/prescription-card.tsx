import * as React from "react"
import { Pill, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface PrescriptionCardProps {
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedBy?: string
  datePrescribed?: string
  status?: "ACTIVE" | "COMPLETED" | "DISCONTINUED"
}

export function PrescriptionCard({
  medicationName,
  dosage,
  frequency,
  duration,
  instructions,
  prescribedBy,
  datePrescribed,
  status = "ACTIVE",
}: PrescriptionCardProps) {
  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: status === "ACTIVE" ? "var(--color-info)" : status === "COMPLETED" ? "var(--color-success)" : "var(--color-muted)" }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-lg">{medicationName}</h4>
                <Badge variant={status === "ACTIVE" ? "info" : status === "COMPLETED" ? "success" : "secondary"} className="text-[10px] h-5">
                  {status}
                </Badge>
              </div>
              <p className="text-sm font-medium mt-1">
                {dosage} • {frequency} • {duration}
              </p>
            </div>
            
            {instructions && (
              <div className="bg-muted/50 p-2 rounded-md flex items-start gap-2 text-sm">
                <Pill className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{instructions}</span>
              </div>
            )}
            
            {(prescribedBy || datePrescribed) && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                {prescribedBy && <span>Dr. {prescribedBy}</span>}
                {prescribedBy && datePrescribed && <span>•</span>}
                {datePrescribed && <span>{datePrescribed}</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
