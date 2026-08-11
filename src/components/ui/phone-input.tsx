"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Input } from "@/components/ui/input"

export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCountryChange?: (countryCode: string) => void
  countryCode?: string
}

const defaultCountries = [
  { code: "+234", label: "NG (+234)" },
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
]

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, countryCode = "+234", onCountryChange, ...props }, ref) => {
    return (
      <div className={cn("flex w-full items-center gap-2", className)}>
        <div className="relative shrink-0">
          <select
            defaultValue={countryCode}
            onChange={(e) => onCountryChange?.(e.target.value)}
            className="h-10 appearance-none rounded-md border border-input bg-background px-2 pr-7 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {defaultCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Input type="tel" ref={ref} className="flex-1" {...props} />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
