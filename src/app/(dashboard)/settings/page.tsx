"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Building2, ShieldCheck, Mail, Database } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function SettingsDashboard() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['hospital-settings'],
    queryFn: async () => {
      const res = await fetch('/api/v1/settings');
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
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
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure hospital parameters and view security logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings/audit">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Audit Logs
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
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
                    <label className="text-sm font-medium">Hospital Name</label>
                    <Input {...form.register("hospitalName")} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input type="email" {...form.register("contactEmail")} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Phone</label>
                    <Input {...form.register("contactPhone")} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <textarea 
                      {...form.register("address")} 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Currency</label>
                    <select {...form.register("currency")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Configuration
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                System Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-success/10 rounded-full">
                      <Mail className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Email Gateway (SMTP)</h4>
                      <p className="text-xs text-muted-foreground mt-1">Configured for automated patient notifications</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success/10 text-success">
                      Connected
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-success/10 rounded-full">
                      <Database className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Prisma Database Service</h4>
                      <p className="text-xs text-muted-foreground mt-1">PostgreSQL Connection Pool</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success/10 text-success">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
