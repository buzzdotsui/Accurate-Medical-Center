"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ROLES } from "@/config/roles";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserRound, Settings } from "lucide-react";
import React from "react";
import { ROLE_DASHBOARD_ROOTS } from "@/config/nav";
import { authClient } from "@/lib/auth/client";
import { useQueryClient } from "@tanstack/react-query";

interface TopbarProps {
  user?: User;
  role: Role;
}

export function Topbar({ user, role }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Extract breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  const dashboardRoot = ROLE_DASHBOARD_ROOTS[role] || "/dashboard";
  // Staff settings live under shared /settings; patients use their portal home.
  const profileHref = role === ROLES.PATIENT ? "/patient" : "/settings";
  const settingsHref = role === ROLES.SUPER_ADMIN ? "/admin/settings" : "/settings";

  // Same sign-out + cache clear as sidebar/mobile-nav — one auth system.
  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.clear();
    router.push("/login");
  };

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
        {/* Global Search (CMD+K style) — wired to GET /api/v1/search
            (Stage 13). PATIENT sessions never see a search bar at all:
            global search across hospital records is a staff capability. */}
        {role !== ROLES.PATIENT && <GlobalSearch />}

        {/* Real in-app notifications (Stage 13) — backed by the
            Notification model / NotificationService / /api/v1/notifications. */}
        <NotificationBell />

        {/* User Profile menu — avatar opens dropdown with identity + logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 p-0.5 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-primary/80 mt-1 uppercase tracking-wide">
                  {role.replace(/_/g, " ")}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <UserRound className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={settingsHref}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
