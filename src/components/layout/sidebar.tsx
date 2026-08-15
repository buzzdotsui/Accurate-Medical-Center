"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";
import { type Role } from "@/config/roles";
import { navConfig } from "@/config/nav";
import * as Icons from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "better-auth";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  role: Role;
  user?: User;
}

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navConfig[role] || [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <aside 
      className={cn(
        "bg-card border-r flex flex-col hidden md:flex transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b bg-background">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8 shrink-0 text-primary" />
          {!isCollapsed && (
            <span className="leading-tight flex flex-col min-w-0">
              <span className="font-heading font-bold text-base text-primary truncate">{siteConfig.shortName}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium -mt-1 truncate">Medical Center</span>
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!isCollapsed && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2 font-semibold">
            Main Menu
          </div>
        )}
        
        <TooltipProvider delayDuration={0}>
          {items.map((item, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Icon = (Icons as any)[item.icon.replace(/-./g, (x: string) => x[1].toUpperCase()).replace(/^./, (x: string) => x.toUpperCase())] || Icons.Circle;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            const navLink = (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    {navLink}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </TooltipProvider>
      </nav>

      {/* User Mini Profile */}
      <div className="p-4 border-t bg-muted/20">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate text-foreground">{user?.name || "User Name"}</span>
                <span className="text-[11px] text-muted-foreground truncate uppercase tracking-wider">{role.replace('_', ' ')}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
              <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
