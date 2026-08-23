"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePatientSchema, type CreatePatientInput } from "@/lib/validations/patient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function NewPatientRegistration() {
  const router = useRouter();

  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(CreatePatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const res = await fetch("/api/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to register patient");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Patient registered successfully with ID: ${data.data.patientId}`);
      router.push("/reception/patients");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data: CreatePatientInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reception/patients">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Register New Patient</h1>
          <p className="text-muted-foreground mt-1">Enter patient demographics into the central database.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name *</label>
                <Input {...form.register("firstName")} placeholder="John" />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name *</label>
                <Input {...form.register("lastName")} placeholder="Doe" />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <Input {...form.register("phone")} placeholder="+234 800 000 0000" />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input {...form.register("email")} placeholder="john@example.com" type="email" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date of Birth</label>
                <Input {...form.register("dateOfBirth")} type="date" />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select 
                  {...form.register("gender")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="ghost" asChild>
                <Link href="/reception/patients">Cancel</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
