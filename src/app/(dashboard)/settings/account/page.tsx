"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Mail, Key, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/auth/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AccountSchema = z.object({
  email: z.string().email("Invalid email address"),
}).refine((data) => data.email.length > 0, {
  message: "Email is required",
  path: ["email"],
});

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AccountInput = z.infer<typeof AccountSchema>;
type PasswordInput = z.infer<typeof PasswordSchema>;

export default function SettingsAccountPage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState<"account" | "password">("account");

  const accountForm = useForm<AccountInput>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data: AccountInput) => {
      const res = await fetch("/api/v1/users/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update email");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordInput) => {
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
      toast.success("Password updated successfully");
      passwordForm.reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onAccountSubmit = (data: AccountInput) => {
    updateEmailMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordInput) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings, email, and password.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Email Section */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Address
            </CardTitle>
            <CardDescription>
              Your email is used for login, notifications, and password recovery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...accountForm.register("email")}
                  disabled={updateEmailMutation.isPending}
                />
                {accountForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{accountForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={updateEmailMutation.isPending}>
                {updateEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Section */}
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
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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

        {/* Account Info */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">{(user as Record<string, unknown>)?.role?.toString().replace(/_/g, " ") ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono text-xs">{user?.id ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email Verified</dt>
                <dd className="font-medium">{user?.emailVerified ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account Created</dt>
                <dd className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Updated</dt>
                <dd className="font-medium">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}