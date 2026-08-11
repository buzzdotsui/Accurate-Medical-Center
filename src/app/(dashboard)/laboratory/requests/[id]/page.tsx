"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveLabResultSchema, type SaveLabResultInput } from "@/lib/validations/laboratory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function InputLabResult() {
  const router = useRouter();
  const params = useParams();
  
  // Mock data mapping to the selected request
  const request = {
    id: params.id as string,
    patient: { name: "Mary Smith", id: "AMC-2026-0004", age: 28, gender: "FEMALE" },
    testName: "Complete Blood Count",
    priority: "STAT",
    notes: "Check for signs of infection"
  };

  const form = useForm<SaveLabResultInput>({
    resolver: zodResolver(SaveLabResultSchema) as any,
    defaultValues: {
      findings: "",
      conclusion: "",
      referenceRange: "",
      isAbnormal: false
    }
  });

  const isAbnormal = form.watch("isAbnormal");

  const mutation = useMutation({
    mutationFn: async (data: SaveLabResultInput) => {
      const res = await fetch(`/api/v1/laboratory/requests/${request.id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save lab result");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Lab result saved successfully and published to doctor.");
      router.push("/laboratory/requests");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/laboratory/requests"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Input Lab Result</h1>
          <p className="text-muted-foreground mt-1">Request ID: {request.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Patient</label>
                <p className="font-medium">{request.patient.name} ({request.patient.gender}, {request.patient.age}y)</p>
                <p className="text-sm text-muted-foreground">{request.patient.id}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Test Requested</label>
                <p className="font-medium text-primary">{request.testName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                <p className={`font-semibold ${request.priority === 'STAT' ? 'text-destructive' : 'text-foreground'}`}>
                  {request.priority}
                </p>
              </div>
              {request.notes && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Clinical Notes</label>
                  <p className="text-sm italic border-l-2 pl-3 mt-1 py-1 text-muted-foreground">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className={`border-none shadow-sm ring-1 transition-colors duration-300 ${isAbnormal ? 'ring-destructive/50 bg-destructive/5' : 'ring-border/50'}`}>
            <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Result Data</CardTitle>
              {isAbnormal && <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />}
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Findings / Values *</label>
                  <textarea 
                    {...form.register("findings")} 
                    className={`flex min-h-[150px] w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isAbnormal ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
                    placeholder="Enter the raw values or descriptive findings..."
                  />
                  {form.formState.errors.findings && <p className="text-xs text-destructive">{form.formState.errors.findings.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reference Range (Optional)</label>
                  <Input {...form.register("referenceRange")} placeholder="e.g. 4.0 - 10.0 x10^9/L" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pathologist Conclusion (Optional)</label>
                  <textarea 
                    {...form.register("conclusion")} 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Summarize the implications of these findings..."
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-md bg-background">
                  <input 
                    type="checkbox" 
                    id="isAbnormal" 
                    {...form.register("isAbnormal")}
                    className="w-5 h-5 rounded border-gray-300 text-destructive focus:ring-destructive"
                  />
                  <label htmlFor="isAbnormal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Flag result as ABNORMAL (Alerts the requesting physician immediately)
                  </label>
                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/laboratory/requests">Cancel</Link>
                  </Button>
                  <Button type="submit" variant={isAbnormal ? "destructive" : "default"} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Publish Result
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
