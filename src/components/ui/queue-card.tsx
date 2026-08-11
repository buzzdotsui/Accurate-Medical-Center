import * as React from "react"
import { Clock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils/cn"

export interface QueueCardProps extends React.HTMLAttributes<HTMLDivElement> {
  patientName: string
  patientId: string
  status: string
  arrivalTime?: string
  priority?: "URGENT" | "HIGH" | "NORMAL" | "LOW"
  doctorName?: string
  department?: string
  actionSlot?: React.ReactNode
}

export function QueueCard({
  patientName,
  patientId,
  status,
  arrivalTime,
  priority = "NORMAL",
  doctorName,
  department,
  actionSlot,
  className,
  ...props
}: QueueCardProps) {
  const isUrgent = priority === "URGENT" || priority === "HIGH"

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isUrgent && "border-destructive/50 shadow-sm shadow-destructive/10",
        className
      )} 
      {...props}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{patientName}</h4>
              <Badge variant="outline" className="font-mono text-xs">
                {patientId}
              </Badge>
              {isUrgent && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {priority}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
              {arrivalTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{arrivalTime}</span>
                </div>
              )}
              
              {doctorName && (
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Dr. {doctorName}</span>
                </div>
              )}
              
              {department && (
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span>{department}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
            <StatusBadge status={status} />
            {actionSlot}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
