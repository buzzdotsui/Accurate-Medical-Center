import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Users,
  ScrollText,
  Settings,
} from "lucide-react";

/**
 * Settings hub — Phase 1 commercial scope only. Cards link to real,
 * implemented destinations. Payment gateways, notifications, and external
 * integrations are deferred (invoice TTI/2026/HMS-P1-002).
 */
const SETTINGS_LINKS = [
  {
    title: "Hospital Profile",
    desc: "Update hospital name, contact, address, and currency.",
    href: "/settings",
    icon: Building2,
  },
  {
    title: "Roles & Permissions",
    desc: "Review role-based access for each user type.",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "Audit Logs",
    desc: "Review system access and data modification events.",
    href: "/settings/audit",
    icon: ScrollText,
  },
  {
    title: "System Settings",
    desc: "Configure hospital parameters.",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Staff Management",
    desc: "Create and manage staff accounts.",
    href: "/admin/staff",
    icon: ShieldCheck,
  },
] as const;

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground">
        System configuration, roles, departments, and audit logging.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="border rounded-xl bg-card p-5 hover:border-primary/40 transition-colors space-y-2 block"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Integrations, payment gateways, and advanced notifications are deferred
        to a future phase.
      </p>
    </div>
  );
}
