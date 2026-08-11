import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type LabResultStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"

interface LabResultBadgeProps {
  status: LabResultStatus
  className?: string
}

export function LabResultBadge({ status, className }: LabResultBadgeProps) {
  const getBadgeVariant = (status: LabResultStatus) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "PROCESSING":
        return "warning"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Badge variant={getBadgeVariant(status)} className={className}>
      {status}
    </Badge>
  )
}
