"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateConsultationSchema, type CreateConsultationInput } from "@/lib/validations/consultation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, FileSignature } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function ConsultationRoom() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const form = useForm<CreateConsultationInput>({
    resolver: zodResolver(CreateConsultationSchema),
    defaultValues: {
      visitId: visitId,
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      diagnosis: [],
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateConsultationInput) => {
      const res = await fetch("/api/v1/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save consultation");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Consultation saved successfully. Visit marked as completed.");
      router.push("/doctor/queue");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data: CreateConsultationInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/doctor/queue">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Consultation Room</h1>
            <p className="text-muted-foreground mt-1">Patient: John Doe (AMC-2026-0001)</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
          <FileSignature className="w-4 h-4" />
          AI Summarize Transcript
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* S & O */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-border/50 h-full">
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold">S</span>
                  Subjective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Chief Complaint & History</label>
                  <textarea 
                    {...form.register("subjective")} 
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Patient describes..."
                  />
                  {form.formState.errors.subjective && <p className="text-xs text-destructive">{form.formState.errors.subjective.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border/50 h-full">
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold">O</span>
                  Objective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Vitals & Physical Exam</label>
                  <textarea 
                    {...form.register("objective")} 
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="BP: 120/80, HR: 72..."
                  />
                  {form.formState.errors.objective && <p className="text-xs text-destructive">{form.formState.errors.objective.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* A & P */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-border/50 h-full">
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold">A</span>
                  Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Diagnosis & Medical Decision Making</label>
                  <textarea 
                    {...form.register("assessment")} 
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Acute bronchitis..."
                  />
                  {form.formState.errors.assessment && <p className="text-xs text-destructive">{form.formState.errors.assessment.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border/50 h-full">
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold">P</span>
                  Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Treatment & Follow-up</label>
                  <textarea 
                    {...form.register("plan")} 
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Prescribed Amoxicillin..."
                  />
                  {form.formState.errors.plan && <p className="text-xs text-destructive">{form.formState.errors.plan.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Button type="button" variant="ghost" asChild>
            <Link href="/doctor/queue">Cancel</Link>
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="px-8 shadow-md">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Sign & Close Encounter
          </Button>
        </div>
      </form>
    </div>
  );
}
