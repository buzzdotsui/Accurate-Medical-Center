import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        type="date"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
