"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Building2, ShieldCheck, Mail, Database, Users, UserCog, Calendar, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/auth/user";

const AdminSettingsSchema = z.object({
  hospitalName: z.string().min(2, "Hospital name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(5, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  currency: z.string().length(3, "Currency must be a 3-letter code (e.g., USD)"),
});

type AdminSettingsInput = z.infer<typeof AdminSettingsSchema>;

export default function SettingsAdminPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['hospital-settings'],
    queryFn: async () => {
      const res = await fetch('/api/v1/settings');
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return (json.data ?? {}) as Record<string, string>;
    }
  });

  const form = useForm<AdminSettingsInput>({
    resolver: zodResolver(AdminSettingsSchema),
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
    mutationFn: async (data: AdminSettingsInput) => {
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-1">System configuration, user management, and audit logs.</p>
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
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input id="hospitalName" {...form.register("hospitalName")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" {...form.register("contactPhone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <textarea
                      id="address"
                      {...form.register("address")}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select id="currency" {...form.register("currency")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
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

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Administrative Tools
              </CardTitle>
              <CardDescription>
                Quick access to administrative management functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-start gap-2 text-left">
                  <Link href="/admin/patients">
                    <Users className="w-6 h-6 text-primary" />
                    <span className="font-medium">Patient Management</span>
                    <span className="text-sm text-muted-foreground">View, register, and manage patients</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-start gap-2 text-left">
                  <Link href="/admin/staff">
                    <UserCog className="w-6 h-6 text-primary" />
                    <span className="font-medium">Staff Management</span>
                    <span className="text-sm text-muted-foreground">Manage staff, roles, and assignments</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-start gap-2 text-left">
                  <Link href="/admin/appointments">
                    <Calendar className="w-6 h-6 text-primary" />
                    <span className="font-medium">Appointment Management</span>
                    <span className="text-sm text-muted-foreground">View and manage all appointments</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-start gap-2 text-left">
                  <Link href="/settings/audit">
                    <Settings className="w-6 h-6 text-primary" />
                    <span className="font-medium">Audit Logs</span>
                    <span className="text-sm text-muted-foreground">Review system audit trail</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}