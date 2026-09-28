import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-transparent bg-black/[0.03] px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-primary/30 focus-visible:shadow-[0_0_0_4px_rgba(212,232,66,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-black/[0.05]",
          error && "border-destructive/30 focus-visible:border-destructive/50 focus-visible:shadow-[0_0_0_4px_rgba(220,38,38,0.1)] bg-destructive/[0.02]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
