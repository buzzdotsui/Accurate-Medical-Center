"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative w-full flex flex-col gap-1.5">
        <div className="relative w-full">
          {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 flex items-center justify-center">
            {icon}
          </div>
        )}
          <input
            type={currentType}
            className={cn(
              "flex h-12 w-full rounded-xl border border-transparent bg-black/[0.03] px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-primary/30 focus-visible:shadow-[0_0_0_4px_rgba(212,232,66,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-black/[0.05]",
              className,
              icon && "pl-11",
              isPassword && "pr-11",
              error && "border-destructive/30 focus-visible:border-destructive/50 focus-visible:shadow-[0_0_0_4px_rgba(220,38,38,0.1)] bg-destructive/[0.02]"
            )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
        </div>
        {helperText && (
          <p
            className={cn(
              "text-xs",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
