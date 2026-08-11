"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import * as Icons from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { siteConfig } from "@/config/site"
import { navConfig } from "@/config/nav"
import type { Role } from "@/config/roles"
import type { User } from "better-auth"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileNavProps {
  role: Role
  user?: User
}

export function MobileNav({ role, user }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const items = navConfig[role] || []
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-md focus:outline-none">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b font-heading font-bold text-lg text-primary shadow-sm bg-background">
          <Logo className="w-8 h-8 mr-3 text-primary" />
          <span className="leading-tight flex flex-col">
            <span>{siteConfig.shortName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium -mt-1">Medical Center</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2 font-semibold">
            Main Menu
          </div>
          
          {items.map((item, index) => {
            const Icon = (Icons as any)[item.icon.replace(/-./g, (x: string) => x[1].toUpperCase()).replace(/^./, (x: string) => x.toUpperCase())] || Icons.Circle
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* User Mini Profile */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || "User Name"}</span>
              <span className="text-xs text-muted-foreground truncate">{role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
