"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveVitalsSchema, type SaveVitalsInput } from "@/lib/validations/vitals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

interface VisitPatientDetail {
  id: string;
  visitId: string;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
  };
}

export default function RecordVitals() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const { data: visit, isLoading: isVisitLoading, isError: isVisitError, error: visitError } = useQuery({
    queryKey: ["visit", visitId],
    queryFn: async (): Promise<VisitPatientDetail> => {
      const res = await fetch(`/api/v1/clinical/visits/${visitId}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load visit");
      }
      return json.data;
    },
  });

  const form = useForm<SaveVitalsInput>({
    resolver: zodResolver(SaveVitalsSchema) as any,
    defaultValues: {
      visitId: params.visitId as string,
      bloodPressure: "",
      heartRate: undefined,
      temperature: undefined,
      respiratoryRate: undefined,
      oxygenSaturation: undefined,
      weight: undefined,
      height: undefined,
      notes: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: SaveVitalsInput) => {
      const res = await fetch("/api/v1/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to save vitals");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Vitals recorded successfully. Patient is ready for doctor.");
      router.push("/nurse/queue");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/nurse/queue"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Record Vitals</h1>
          <p className="text-muted-foreground mt-1">
            {isVisitLoading
              ? "Loading patient..."
              : isVisitError
              ? (visitError instanceof Error ? visitError.message : "Failed to load patient")
              : `Patient: ${visit?.patient.firstName} ${visit?.patient.lastName} (${visit?.patient.patientId})`}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>Clinical Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Blood Pressure (mmHg)</label>
                <Input {...form.register("bloodPressure")} placeholder="120/80" />
                {form.formState.errors.bloodPressure && <p className="text-xs text-destructive">{form.formState.errors.bloodPressure.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Heart Rate (bpm)</label>
                <Input type="number" {...form.register("heartRate")} placeholder="72" />
                {form.formState.errors.heartRate && <p className="text-xs text-destructive">{form.formState.errors.heartRate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Temperature (°C)</label>
                <Input type="number" step="0.1" {...form.register("temperature")} placeholder="36.5" />
                {form.formState.errors.temperature && <p className="text-xs text-destructive">{form.formState.errors.temperature.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Respiratory Rate (breaths/min)</label>
                <Input type="number" {...form.register("respiratoryRate")} placeholder="16" />
                {form.formState.errors.respiratoryRate && <p className="text-xs text-destructive">{form.formState.errors.respiratoryRate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Oxygen Saturation (%)</label>
                <Input type="number" {...form.register("oxygenSaturation")} placeholder="98" />
                {form.formState.errors.oxygenSaturation && <p className="text-xs text-destructive">{form.formState.errors.oxygenSaturation.message}</p>}
              </div>

              <div className="space-y-2 flex gap-4">
                <div className="w-1/2 space-y-2">
                  <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                  <Input type="number" step="0.1" {...form.register("weight")} placeholder="70.5" />
                  {form.formState.errors.weight && <p className="text-xs text-destructive">{form.formState.errors.weight.message}</p>}
                </div>
                <div className="w-1/2 space-y-2">
                  <label className="text-sm font-medium text-foreground">Height (cm)</label>
                  <Input type="number" {...form.register("height")} placeholder="175" />
                  {form.formState.errors.height && <p className="text-xs text-destructive">{form.formState.errors.height.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Additional Nursing Notes</label>
              <textarea 
                {...form.register("notes")} 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Patient reports feeling dizzy..."
              />
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="ghost" asChild>
                <Link href="/nurse/queue">Cancel</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Vitals
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
