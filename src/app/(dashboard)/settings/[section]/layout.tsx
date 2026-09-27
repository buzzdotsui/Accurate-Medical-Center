"use client";

import { ReactNode, useEffect, useState } from "react";
import { SettingsNav } from "@/components/layout/settings-nav";
import { type Role, ROLES } from "@/config/roles";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [role, setRole] = useState<Role>(ROLES.PATIENT);

  useEffect(() => {
    const container = document.querySelector('[data-user-role]');
    if (container) {
      const roleAttr = container.getAttribute('data-user-role');
      if (roleAttr && Object.values(ROLES).includes(roleAttr as Role)) {
        setRole(roleAttr as Role);
      }
    }
  }, []);

  return (
    <div className="flex gap-6 lg:gap-8">
      <SettingsNav role={role} />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}