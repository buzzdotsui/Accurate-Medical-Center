import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-12 w-full appearance-none rounded-xl border border-transparent bg-black/[0.03] px-4 py-2 pr-11 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:bg-white focus-visible:border-primary/30 focus-visible:shadow-[0_0_0_4px_rgba(212,232,66,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-black/[0.05]",
            error && "border-destructive/30 focus-visible:border-destructive/50 focus-visible:shadow-[0_0_0_4px_rgba(220,38,38,0.1)] bg-destructive/[0.02]",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
