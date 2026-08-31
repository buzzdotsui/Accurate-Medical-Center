"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, AlertCircle, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Real in-app notification bell, backed by the Notification model /
 * NotificationService / `/api/v1/notifications*` routes. The unread badge
 * is always the server-computed count for the authenticated session user
 * only - never a fabricated number, and never another user's data.
 *
 * The badge count polls the lightweight `/unread-count` endpoint on an
 * interval; the full notification list is only fetched once the panel is
 * actually opened, so an idle dashboard tab isn't repeatedly re-fetching
 * notification bodies it isn't displaying.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: countData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications/unread-count");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to load unread count");
      }
      return json.data as { unreadCount: number };
    },
    refetchInterval: 30_000,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications?take=15");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to load notifications");
      }
      return json.data as { notifications: Notification[]; unreadCount: number };
    },
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/v1/notifications/read-all", { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = countData?.unreadCount ?? data?.unreadCount ?? 0;

  function handleNotificationClick(n: Notification) {
    if (!n.isRead) markReadMutation.mutate(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        title="Notifications"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-11 w-auto sm:w-80 max-h-[70vh] sm:max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg z-[100]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b sticky top-0 bg-popover">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-muted-foreground">Failed to load notifications.</span>
              <button type="button" onClick={() => refetch()} className="text-primary text-xs font-medium hover:underline">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && (data?.notifications.length ?? 0) === 0 && (
            <div className="px-4 py-8 text-sm text-center text-muted-foreground">
              You&apos;re all caught up.
            </div>
          )}

          {!isLoading && !isError && data && data.notifications.length > 0 && (
            <ul>
              {data.notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b last:border-0 transition-colors hover:bg-muted/60",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      <div className={cn("flex-1 min-w-0", n.isRead && "pl-3.5")}>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
