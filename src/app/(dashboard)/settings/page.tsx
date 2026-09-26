"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Building2, ShieldCheck, Mail, Database, User, Lock, Bell, Palette, Settings as SettingsIcon, Users, UserCog, Calendar, FileText, Camera, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLES } from "@/config/roles";
import type { Role } from "@/config/roles";
import type { User as BetterAuthUser } from "better-auth";

interface SettingsPageProps {
  user?: BetterAuthUser;
  role?: Role;
}

function ProfileTab({ user }: { user?: BetterAuthUser }) {
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.image);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['hospital-settings'],
    queryFn: async () => {
      const res = await fetch('/api/v1/settings');
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return (json.data ?? {}) as Record<string, string>;
    }
  });

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(UpdateSettingsSchema),
    defaultValues: {
      hospitalName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      currency: "USD"
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        hospitalName: settings.hospitalName || "Accurate Medical Center",
        contactEmail: settings.contactEmail || "admin@accurate.med",
        contactPhone: settings.contactPhone || "+1 (555) 123-4567",
        address: settings.address || "123 Health Ave",
        currency: settings.currency || "USD"
      });
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (data: UpdateSettingsInput) => {
      const res = await fetch(`/api/v1/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Global settings updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['hospital-settings'] });
    }
  });

  const avatarMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const res = await fetch(`/api/v1/users/me/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to upload avatar");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Profile picture updated");
      setAvatarPreview(data.data?.image);
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setAvatarPreview(user?.image); // Revert on error
    },
    onSettled: () => setAvatarUploading(false),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/users/me/avatar`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove avatar");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Profile picture removed");
      setAvatarPreview(undefined);
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
      setAvatarUploading(true);
      avatarMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Personal Profile */}
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Profile
          </CardTitle>
          <CardDescription>
            Your personal information and profile picture. Visible to other staff members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={avatarPreview || user?.image} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  disabled={avatarUploading}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={avatarUploading}
                  aria-label="Change profile picture"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
              </label>
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-lg font-semibold">{user?.name || "User Name"}</h4>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {user?.role ? user.role.replace(/_/g, " ") : "Unknown Role"}
              </span>
              {(avatarPreview || user?.image) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteAvatarMutation.mutate()}
                  disabled={deleteAvatarMutation.isPending}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-firstName">First Name</Label>
              <Input id="profile-firstName" defaultValue={user?.name?.split(" ")[0] || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-lastName">Last Name</Label>
              <Input id="profile-lastName" defaultValue={user?.name?.split(" ").slice(1).join(" ") || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" defaultValue={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input id="profile-role" defaultValue={user?.role ? user.role.replace(/_/g, " ") : ""} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Profile (Admin only) */}
      {([ROLES.ADMIN, ROLES.SUPER_ADMIN] as Role[]).includes(role as Role) && (
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Hospital Profile
            </CardTitle>
            <CardDescription>
              Public-facing contact information used on patient invoices and reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input {...form.register("hospitalName")} id="hospitalName" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input type="email" {...form.register("contactEmail")} id="contactEmail" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input {...form.register("contactPhone")} id="contactPhone" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <textarea 
                    {...form.register("address")} 
                    id="address"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select {...form.register("currency")} id="currency">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Configuration
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountTab({ user }: { user?: BetterAuthUser }) {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your account details and connected services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" defaultValue={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input defaultValue={user?.role ? user.role.replace(/_/g, " ") : ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email Verified</Label>
              <Input defaultValue={user?.emailVerified ? "Yes" : "No"} disabled />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Connected Accounts</h4>
              <p className="text-sm text-muted-foreground">Manage third-party authentication providers</p>
            </div>
            <Button variant="outline" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesTab() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the application looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Compact Mode</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
              <span className="text-sm">Reduce spacing and density</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about important events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates for appointments, messages, and system alerts</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive browser push notifications for real-time updates</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Password & Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">View and manage your active login sessions</p>
            </div>
            <Button variant="outline" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              View Sessions
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminTab() {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>
            Administrator controls for managing users, staff, patients, and appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="gap-2 h-auto p-4 flex flex-col items-start">
              <Link href="/admin/patients">
                <Users className="w-6 h-6 text-primary mb-2" />
                <span className="font-medium">Patients</span>
                <span className="text-xs text-muted-foreground">View and manage all patients</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 h-auto p-4 flex flex-col items-start">
              <Link href="/admin/staff">
                <UserCog className="w-6 h-6 text-primary mb-2" />
                <span className="font-medium">Staff</span>
                <span className="text-xs text-muted-foreground">Manage staff members</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 h-auto p-4 flex flex-col items-start">
              <Link href="/admin/appointments">
                <Calendar className="w-6 h-6 text-primary mb-2" />
                <span className="font-medium">Appointments</span>
                <span className="text-xs text-muted-foreground">Manage appointments</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 h-auto p-4 flex flex-col items-start">
              <Link href="/settings/audit">
                <FileText className="w-6 h-6 text-primary mb-2" />
                <span className="font-medium">Audit Logs</span>
                <span className="text-xs text-muted-foreground">View system audit trail</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Role & Permission Overview
          </CardTitle>
          <CardDescription>
            Overview of system roles and their permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT] as Role[]).map((r) => (
              <div key={r} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{r.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsDashboard({ user, role }: SettingsPageProps) {
  const activeRole = role || (user?.role as Role) || ROLES.PATIENT;
  const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(activeRole);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, preferences, and system configuration.</p>
        </div>
        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/settings/audit">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Audit Logs
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab user={user} />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="admin">
            <AdminTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}