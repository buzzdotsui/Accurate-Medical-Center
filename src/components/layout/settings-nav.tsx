"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { type Role, ROLES } from "@/config/roles";

interface SettingsNavProps {
  role: Role;
}

const SETTINGS_SECTIONS: { href: string; label: string; icon: React.ReactNode; roles: Role[]; description: string }[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: <UserRound className="w-4 h-4" />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT],
    description: "Personal information, avatar, and contact details"
  },
  {
    href: "/settings/account",
    label: "Account",
    icon: <UserCog className="w-4 h-4" />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT],
    description: "Account settings, email, and password"
  },
  {
    href: "/settings/preferences",
    label: "Preferences",
    icon: <SlidersHorizontal className="w-4 h-4" />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT],
    description: "Theme, notifications, and interface preferences"
  },
  {
    href: "/settings/security",
    label: "Security",
    icon: <ShieldCheck className="w-4 h-4" />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT],
    description: "Password, sessions, and two-factor authentication"
  },
  {
    href: "/settings/admin",
    label: "Administration",
    icon: <Settings className="w-4 h-4" />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    description: "System configuration, user management, and audit logs"
  },
];

export function SettingsNav({ role }: SettingsNavProps) {
  const pathname = usePathname();

  const sections = SETTINGS_SECTIONS.filter((s) => s.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1 w-full lg:w-56 shrink-0" aria-label="Settings sections">
      {sections.map((section) => {
        const isActive = pathname === section.href || pathname.startsWith(`${section.href}/`);
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={section.description}
          >
            <span className="shrink-0">{section.icon}</span>
            <span className="truncate">{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Icon imports
import { UserRound, UserCog, SlidersHorizontal, ShieldCheck, Settings } from "lucide-react";