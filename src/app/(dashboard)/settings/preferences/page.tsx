"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Monitor, Bell, Globe, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().min(2),
  timezone: z.string().min(2),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  systemAlerts: z.boolean(),
});

type PreferencesInput = z.infer<typeof PreferencesSchema>;

export default function SettingsPreferencesPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  });

  const form = useForm<PreferencesInput>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      theme: "system",
      language: "en",
      timezone: "UTC",
      emailNotifications: true,
      pushNotifications: true,
      appointmentReminders: true,
      systemAlerts: true,
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesInput) => {
      const res = await fetch("/api/v1/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update preferences");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Preferences updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (data: PreferencesInput) => {
    updatePreferencesMutation.mutate(data);
  };

  if (!mounted) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardContent className="p-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground mt-1">Customize your interface, notifications, and regional settings.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Appearance */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose how the application looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={form.watch("theme")}
                  onChange={(e) => form.setValue("theme", e.target.value as any)}
                  disabled={updatePreferencesMutation.isPending}
                >
                  <option value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>System Default</span>
                    </div>
                  </option>
                  <option value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </div>
                  </option>
                  <option value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </div>
                  </option>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Regional */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure language, timezone, and date format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={form.watch("language")}
                    onChange={(e) => form.setValue("language", e.target.value)}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                    <option value="ha">Hausa</option>
                    <option value="fr">French</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={form.watch("timezone")}
                    onChange={(e) => form.setValue("timezone", e.target.value)}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <option value="Africa/Lagos">West Africa Time (WAT)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">GMT</option>
                    <option value="America/New_York">Eastern Time</option>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                  </div>
                  <Switch
                    checked={form.watch("emailNotifications")}
                    onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={form.watch("pushNotifications")}
                    onCheckedChange={(checked) => form.setValue("pushNotifications", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                  </div>
                  <Switch
                    checked={form.watch("appointmentReminders")}
                    onCheckedChange={(checked) => form.setValue("appointmentReminders", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Alerts</p>
                    <p className="text-sm text-muted-foreground">Critical system and security notifications</p>
                  </div>
                  <Switch
                    checked={form.watch("systemAlerts")}
                    onCheckedChange={(checked) => form.setValue("systemAlerts", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}