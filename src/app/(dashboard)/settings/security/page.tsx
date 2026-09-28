"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Key, ShieldCheck, RefreshCw, LogOut, Smartphone, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/auth/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SecuritySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SecurityInput = z.infer<typeof SecuritySchema>;

interface SessionInfo {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  isCurrent: boolean;
}

export default function SettingsSecurityPage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const passwordForm = useForm<SecurityInput>({
    resolver: zodResolver(SecuritySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<SessionInfo[]>({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/sessions");
      if (!res.ok) throw new Error("Failed to load sessions");
      const json = await res.json();
      return json.data;
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: SecurityInput) => {
      const res = await fetch("/api/v1/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password updated successfully. Please log in again.");
      passwordForm.reset();
      authClient.signOut();
      queryClient.clear();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/v1/users/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      return sessionId;
    },
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/users/sessions", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke all sessions");
    },
    onSuccess: () => {
      toast.success("All other sessions revoked");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const parseUserAgent = (ua: string) => {
    let device = "Unknown Device";
    if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
      device = "Mobile";
    } else if (ua.includes("Tablet") || ua.includes("iPad")) {
      device = "Tablet";
    } else {
      device = "Desktop";
    }

    let browser = "Unknown Browser";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    return { device, browser };
  };

  const onSubmit = (data: SecurityInput) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">Manage your password, active sessions, and security settings.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Password */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>
              Use a strong, unique password. Minimum 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  disabled={updatePasswordMutation.isPending}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  disabled={updatePasswordMutation.isPending}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  disabled={updatePasswordMutation.isPending}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={updatePasswordMutation.isPending}>
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across devices.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => revokeAllSessionsMutation.mutate()}
              disabled={revokeAllSessionsMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
              Revoke All Other Sessions
            </Button>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((sess) => {
                  const { device, browser } = parseUserAgent(sess.userAgent || "");
                  const isCurrent = sess.isCurrent;
                  return (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg", device === "Mobile" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600")}>
                          {device === "Mobile" ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {browser} on {device}
                            {isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                Current Session
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sess.ipAddress ? `${sess.ipAddress} · ` : ""}
                            Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => revokeSessionMutation.mutate(sess.id)}
                          disabled={revokeSessionMutation.isPending}
                        >
                          <LogOut className="w-3.5 h-3.5 mr-1.5" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active sessions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email Verified</dt>
                <dd className="font-medium">{user?.emailVerified ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Two-Factor Authentication</dt>
                <dd className="font-medium">Not Enabled</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Password Last Changed</dt>
                <dd className="font-medium">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-GB') : "Unknown"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account Type</dt>
                <dd className="font-medium">{(user as Record<string, unknown>)?.role?.toString().replace(/_/g, " ") ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Icon imports
import { cn } from "@/lib/utils/cn";