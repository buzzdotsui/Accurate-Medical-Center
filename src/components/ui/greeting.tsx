"use client";

import { useEffect, useState } from "react";

/**
 * Returns a time-aware greeting based on the current local time.
 * Morning: 5:00-11:59
 * Afternoon: 12:00-16:59
 * Evening: 17:00-21:59
 * Night: 22:00-4:59 (shows "Good evening")
 */
export function getTimeAwareGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good evening";
}

/**
 * Extracts the first name from a full name.
 */
export function getFirstName(fullName?: string | null): string {
  if (!fullName) return "User";
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Greeting component that displays a personalized, time-aware greeting.
 * Updates automatically as time changes.
 */
export function Greeting({ name }: { name?: string | null }) {
  const [greeting, setGreeting] = useState<string>(() => getTimeAwareGreeting());
  const firstName = getFirstName(name);

  useEffect(() => {
    // Calculate milliseconds until next greeting change
    const now = new Date();
    const currentHour = now.getHours();
    let nextChangeHour: number;

    if (currentHour < 5) nextChangeHour = 5;      // Night -> Morning
    else if (currentHour < 12) nextChangeHour = 12; // Morning -> Afternoon
    else if (currentHour < 17) nextChangeHour = 17; // Afternoon -> Evening
    else if (currentHour < 22) nextChangeHour = 22; // Evening -> Night
    else nextChangeHour = 29; // Night -> Morning (next day, 5 AM = 29 hours from midnight)

    const nextChange = new Date(now);
    nextChange.setHours(nextChangeHour, 0, 0, 0);
    if (nextChange <= now) {
      nextChange.setDate(nextChange.getDate() + 1);
    }

    const msUntilChange = nextChange.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setGreeting(getTimeAwareGreeting());
    }, msUntilChange);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {greeting}, {firstName}
    </>
  );
}

/**
 * Full dashboard header with greeting, date, and optional user avatar.
 */
export function DashboardHeader({
  user,
  title,
  description,
  children,
}: {
  user?: { name?: string | null; image?: string | null } | null;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const firstName = getFirstName(user?.name);
  const greeting = getTimeAwareGreeting();
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {greeting}, {firstName}
          </h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}