"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Loader2, AlertCircle, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Real in-app notification bell, backed by `GET /api/v1/notifications`.
 * Replaces the Stage 3.5 disabled placeholder bell now that the
 * Notification model has a real service/API behind it (Stage 13). The
 * unread badge is always the server-computed count - never a fabricated
 * number.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications?take=15");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to load notifications");
      }
      return json.data as { notifications: Notification[]; unreadCount: number };
    },
    refetchInterval: 60_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
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

  const unreadCount = data?.unreadCount ?? 0;

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
        <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
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
                    onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
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
