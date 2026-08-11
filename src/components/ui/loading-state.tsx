import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-muted-foreground",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : "min-h-[200px]",
        className
      )}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-sm font-medium animate-pulse">{message}</p>}
    </div>
  )
}
