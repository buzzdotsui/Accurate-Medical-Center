import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Label } from "@radix-ui/react-label"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor?: string
  error?: string
  helperText?: string
  children: React.ReactNode
  required?: boolean
}

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  children,
  required,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}
