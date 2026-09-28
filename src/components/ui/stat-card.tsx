import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

import { cn } from "@/lib/utils/cn"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col bg-white border border-black/4 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
      {...props}
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </h3>
        {Icon && (
          <div className="h-10 w-10 rounded-full bg-black/3 flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold font-heading tracking-tight text-foreground">{value}</div>
        {(description || trend) && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
                  trend.isPositive ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"
                )}
              >
                {trend.isPositive
                  ? <TrendingUp className="h-3 w-3" />
                  : <TrendingDown className="h-3 w-3" />
                }
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
            )}
            <span className="opacity-80">{description ?? (trend ? "from yesterday" : "")}</span>
          </p>
        )}
      </div>
    </div>
  )
}
