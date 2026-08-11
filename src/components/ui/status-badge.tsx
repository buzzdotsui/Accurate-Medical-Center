import React from "react";
import { Badge } from "@/components/ui/badge";

export type StatusVariant = 
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "default"
  | "secondary";

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ status, variant = "default", className, icon }: StatusBadgeProps) {
  // Map common medical statuses to colors if variant is not explicitly provided
  let computedVariant = variant;
  
  if (variant === "default") {
    const normalizedStatus = status.toLowerCase();
    
    // Success states
    if (["completed", "paid", "normal", "confirmed", "verified", "discharged"].includes(normalizedStatus)) {
      computedVariant = "success";
    }
    // Warning states
    else if (["waiting", "pending", "pending results", "unpaid", "low stock", "abnormal"].includes(normalizedStatus)) {
      computedVariant = "warning";
    }
    // Destructive/Danger states
    else if (["cancelled", "no-show", "urgent", "critical", "overdue", "out of stock"].includes(normalizedStatus)) {
      computedVariant = "destructive";
    }
    // Info states
    else if (["scheduled", "in progress", "consulting", "booked", "processing", "checked-in"].includes(normalizedStatus)) {
      computedVariant = "info";
    }
  }

  return (
    <Badge variant={computedVariant} className={className}>
      {icon && <span className="mr-1 -ml-1">{icon}</span>}
      {status}
    </Badge>
  );
}
