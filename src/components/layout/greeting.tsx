"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface GreetingUser {
  id?: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  role?: string;
}

interface GreetingProps {
  user?: GreetingUser;
  className?: string;
}

/**
 * Get time-aware greeting based on current hour
 */
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good evening";
}

/**
 * Extract first name from full name
 */
function getFirstName(name?: string | null): string {
  if (!name) return "User";
  const parts = name.trim().split(/\s+/);
  return parts[0] || "User";
}

/**
 * Extract initials from full name
 */
function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name.substring(0, 2).toUpperCase();
}

/**
 * Time-aware greeting component that shows "Good morning/afternoon/evening, FirstName"
 * based on the current local time.
 */
export function Greeting({ user, className }: GreetingProps) {
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const firstName = useMemo(() => getFirstName(user?.name), [user?.name]);

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeGreeting());
    };

    // Set initial greeting
    updateGreeting();

    // Update greeting every minute to handle time transitions
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm text-muted-foreground font-medium">
        {greeting}{firstName && `, ${firstName}`}
      </p>
    </div>
  );
}

/**
 * Greeting with avatar - for use in dashboard headers
 */
export function GreetingWithAvatar({ user, className }: GreetingProps) {
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const firstName = useMemo(() => getFirstName(user?.name), [user?.name]);
  const userInitials = useMemo(() => getInitials(user?.name), [user?.name]);

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeGreeting());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground font-medium">
          {greeting}{firstName && `, ${firstName}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
        {user?.image ? (
          <img src={user.image} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          userInitials
        )}
      </div>
    </div>
  );
}