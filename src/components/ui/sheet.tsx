"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const Sheet = DialogPrimitive.Root

const SheetTrigger = DialogPrimitive.Trigger

const SheetClose = DialogPrimitive.Close

const SheetPortal = DialogPrimitive.Portal

/**
 * SheetOverlay — the dark backdrop behind the slide-in panel.
 *
 * FIX (Stage 3.5): The previous version used `tailwindcss-animate` utility
 * classes (animate-in, animate-out, fade-out-0, fade-in-0) that do not exist
 * in Tailwind v4 without the plugin.  Radix listens for `animationend` /
 * `transitionend` to know when to unmount the portal.  Because those events
 * never fired, the overlay remained mounted with `fixed inset-0 z-50
 * bg-black/80` permanently after closing — blocking all page interaction.
 *
 * The fix: use a plain CSS `transition` on `opacity`.  Tailwind v4 ships
 * `transition-opacity` and `opacity-0` natively.  Radix picks up the
 * `transitionend` event and correctly removes the portal.
 *
 * `data-[state=closed]:pointer-events-none` ensures no clicks are captured
 * during the fade-out even if Radix hasn't unmounted yet.
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      // Use native CSS transition so Radix receives transitionend and
      // unmounts the portal correctly.
      "transition-opacity duration-300",
      "data-[state=open]:opacity-100",
      "data-[state=closed]:opacity-0 data-[state=closed]:pointer-events-none",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "top" | "bottom" | "left" | "right";
}

const sideClasses: Record<NonNullable<SheetContentProps["side"]>, string> = {
  left:   "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 sm:max-w-sm",
  right:  "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:max-w-sm",
  top:    "inset-x-0 top-0 w-full border-b data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  bottom: "inset-x-0 bottom-0 w-full border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "left", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg",
        // Use CSS transform transitions — works in Tailwind v4 without plugins.
        "transition-transform duration-300 ease-in-out",
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
}
