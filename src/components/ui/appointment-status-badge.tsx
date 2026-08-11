import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type AppointmentStatus = "SCHEDULED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const getBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "secondary"
      case "CHECKED_IN":
        return "info"
      case "IN_PROGRESS":
        return "warning"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
      case "NO_SHOW":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Badge variant={getBadgeVariant(status)} className={className}>
      {status.replace("_", " ")}
    </Badge>
  )
}
