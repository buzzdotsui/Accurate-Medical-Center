"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { User } from "better-auth";
import type { Role } from "@/config/roles";

interface TopbarProps {
  user?: User;
  role: Role;
}

export function Topbar({ user, role }: TopbarProps) {
  const pathname = usePathname();
  
  // Quick breadcrumb extraction
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPage = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') 
    : 'Dashboard';

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <MobileNav role={role} user={user} />
        <div className="hidden md:flex font-heading font-semibold text-lg text-foreground capitalize">
          {currentPage}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Global Search (CMD+K style) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients, doctors..."
            className="h-9 w-64 rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="absolute right-2 top-2.5 pointer-events-none inline-flex h-4 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 p-0.5 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
