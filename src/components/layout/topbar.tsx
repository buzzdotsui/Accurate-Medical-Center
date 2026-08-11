"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { User } from "better-auth";
import type { Role } from "@/config/roles";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { ROLE_DASHBOARD_ROOTS } from "@/config/nav";

interface TopbarProps {
  user?: User;
  role: Role;
}

export function Topbar({ user, role }: TopbarProps) {
  const pathname = usePathname();
  
  // Extract breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";
  
  const dashboardRoot = ROLE_DASHBOARD_ROOTS[role] || "/dashboard";

  return (
    <header className="h-16 bg-background border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <MobileNav role={role} user={user} />
        
        <div className="hidden md:flex">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={dashboardRoot} className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {pathSegments.map((segment, index) => {
                // Skip the first segment if it matches the role/dashboard root
                if (index === 0 && `/${segment}` === dashboardRoot) return null;
                
                const isLast = index === pathSegments.length - 1;
                const title = segment.replace(/-/g, ' ');
                const href = `/${pathSegments.slice(0, index + 1).join('/')}`;

                return (
                  <React.Fragment key={segment}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="capitalize font-semibold text-foreground">
                          {title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="capitalize text-muted-foreground hover:text-foreground transition-colors">
                          {title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Global Search (CMD+K style) */}
        <div className="relative hidden md:block group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search patients, doctors..."
            className="h-9 w-64 rounded-md border border-input bg-card px-9 py-1 text-sm shadow-sm transition-all focus:w-80 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="absolute right-2 top-2 pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-background" />
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
