"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveLabResultSchema, type SaveLabResultInput } from "@/lib/validations/laboratory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, AlertTriangle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { differenceInYears } from "date-fns";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface LabRequestDetail {
  id: string;
  requestId: string;
  testName: string;
  priority: string;
  notes: string | null;
  category: { name: string };
  doctor: { user: { name: string } };
  visit: {
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
      gender: string | null;
      dateOfBirth: string | null;
    };
  };
}

export default function InputLabResult() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const { data: request, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["laboratory-request", requestId],
    queryFn: async (): Promise<LabRequestDetail> => {
      const res = await fetch(`/api/v1/laboratory/requests/${requestId}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load lab request");
      }
      return json.data;
    },
  });

  const form = useForm<SaveLabResultInput>({
    resolver: zodResolver(SaveLabResultSchema) as any,
    defaultValues: {
      findings: "",
      conclusion: "",
      referenceRange: "",
      isAbnormal: false,
      attachments: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments"
  });

  const isAbnormal = form.watch("isAbnormal");

  const mutation = useMutation({
    mutationFn: async (data: SaveLabResultInput) => {
      const res = await fetch(`/api/v1/laboratory/requests/${requestId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to save lab result");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Lab result saved successfully and published to doctor.");
      router.push("/laboratory/requests");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  if (isLoading) {
    return <LoadingState message="Loading lab request..." className="py-24" />;
  }

  if (isError || !request) {
    return (
      <ErrorState
        description={error instanceof Error ? error.message : "Failed to load lab request"}
        onRetry={() => refetch()}
      />
    );
  }

  const patient = request.visit.patient;
  const age = patient.dateOfBirth ? differenceInYears(new Date(), new Date(patient.dateOfBirth)) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/laboratory/requests"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Input Lab Result</h1>
          <p className="text-muted-foreground mt-1">Request ID: {request.requestId}</p>
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
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                  {(patient.gender || age !== null) && (
                    <> ({[patient.gender, age !== null ? `${age}y` : null].filter(Boolean).join(", ")})</>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{patient.patientId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Test Requested</label>
                <p className="font-medium text-primary">{request.testName}</p>
                <p className="text-xs text-muted-foreground">{request.category.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Requesting Doctor</label>
                <p className="font-medium">{request.doctor.user.name}</p>
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

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Attachments (Optional)</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ fileUrl: "", fileName: "", fileType: "" })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Attachment
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-xs text-muted-foreground">No attachments linked. Paste a hosted file URL below to attach scanned reports, images, or PDFs.</p>
                  )}

                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20 relative group">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="space-y-4 pr-8">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">File URL *</label>
                          <Input {...form.register(`attachments.${index}.fileUrl`)} placeholder="https://storage.accurate.med/results/report.pdf" />
                          {form.formState.errors.attachments?.[index]?.fileUrl && <p className="text-xs text-destructive">{form.formState.errors.attachments[index]?.fileUrl?.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">File Name *</label>
                            <Input {...form.register(`attachments.${index}.fileName`)} placeholder="e.g. cbc_result.pdf" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">File Type *</label>
                            <Input {...form.register(`attachments.${index}.fileType`)} placeholder="e.g. PDF, JPG" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
