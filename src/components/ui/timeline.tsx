import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Check, Clock } from "lucide-react"

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Timeline({ children, className, ...props }: TimelineProps) {
  return (
    <div className={cn("relative border-l ml-3 border-border space-y-6 pb-4", className)} {...props}>
      {children}
    </div>
  )
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  time?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  status?: "completed" | "current" | "upcoming" | "error"
}

export function TimelineItem({
  title,
  time,
  description,
  icon,
  status = "completed",
  className,
  ...props
}: TimelineItemProps) {
  return (
    <div className={cn("relative pl-6", className)} {...props}>
      <span
        className={cn(
          "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
          status === "completed" ? "bg-primary text-primary-foreground" :
          status === "current" ? "bg-blue-500 text-white" :
          status === "error" ? "bg-destructive text-destructive-foreground" :
          "bg-muted text-muted-foreground border-2 border-border"
        )}
      >
        {icon ? icon : (
          status === "completed" ? <Check className="h-3 w-3" /> :
          <Clock className="h-3 w-3" />
        )}
      </span>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h4 className={cn("font-medium leading-none text-sm", status === "upcoming" && "text-muted-foreground")}>
            {title}
          </h4>
          {time && (
            <time className="text-xs text-muted-foreground ml-auto pl-2">
              {time}
            </time>
          )}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground pt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}
