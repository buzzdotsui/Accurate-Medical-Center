import React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error loading this data. Please try again.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-destructive/80 max-w-sm mx-auto">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
          Try again
        </Button>
      )}
    </div>
  )
}
