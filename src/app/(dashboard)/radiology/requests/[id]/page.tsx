"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveRadiologyReportSchema, type SaveRadiologyReportInput } from "@/lib/validations/radiology";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function SubmitRadiologyReport() {
  const router = useRouter();
  const params = useParams();
  
  // Mock data mapping to the selected request
  const request = {
    id: params.id as string,
    patient: { name: "Mary Smith", id: "AMC-2026-0004", age: 28, gender: "FEMALE" },
    scanType: "CT Scan",
    region: "Chest",
    priority: "STAT",
    clinicalNotes: "R/O Pulmonary Embolism",
    status: "SCANNED" // Images already taken, pending report
  };

  const form = useForm<SaveRadiologyReportInput>({
    resolver: zodResolver(SaveRadiologyReportSchema),
    defaultValues: {
      findings: "",
      conclusion: "",
      images: [{ imageUrl: "", dicomUrl: "", notes: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const mutation = useMutation({
    mutationFn: async (data: SaveRadiologyReportInput) => {
      const res = await fetch(`/api/v1/radiology/requests/${request.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save radiology report");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Radiology report saved and published.");
      router.push("/radiology/requests");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/radiology/requests"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Diagnostic Report</h1>
          <p className="text-muted-foreground mt-1">Request ID: {request.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Clinical Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Patient</label>
                <p className="font-medium">{request.patient.name} ({request.patient.gender}, {request.patient.age}y)</p>
                <p className="text-sm text-muted-foreground">{request.patient.id}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Modality & Region</label>
                <p className="font-medium text-primary">{request.scanType} - {request.region}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                <p className={`font-semibold ${request.priority === 'STAT' ? 'text-destructive' : 'text-foreground'}`}>
                  {request.priority}
                </p>
              </div>
              {request.clinicalNotes && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Doctor's Notes</label>
                  <p className="text-sm italic border-l-2 pl-3 mt-1 py-1 text-muted-foreground">{request.clinicalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Report & Image Linking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Radiological Findings *</label>
                  <textarea 
                    {...form.register("findings")} 
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe specific observations, normal and abnormal anatomy..."
                  />
                  {form.formState.errors.findings && <p className="text-xs text-destructive">{form.formState.errors.findings.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Conclusion / Impression *</label>
                  <textarea 
                    {...form.register("conclusion")} 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Provide the final diagnosis or clinical impression..."
                  />
                  {form.formState.errors.conclusion && <p className="text-xs text-destructive">{form.formState.errors.conclusion.message}</p>}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Attached Images</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ imageUrl: "", dicomUrl: "", notes: "" })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Image Link
                    </Button>
                  </div>
                  
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
                          <label className="text-xs font-medium">Standard Image URL (JPG/PNG) *</label>
                          <Input {...form.register(`images.${index}.imageUrl`)} placeholder="https://pacs.accurate.med/image1.jpg" />
                          {form.formState.errors.images?.[index]?.imageUrl && <p className="text-xs text-destructive">{form.formState.errors.images[index]?.imageUrl?.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">DICOM Viewer URL (Optional)</label>
                            <Input {...form.register(`images.${index}.dicomUrl`)} placeholder="https://pacs.accurate.med/viewer?id=..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Image Note (Optional)</label>
                            <Input {...form.register(`images.${index}.notes`)} placeholder="e.g. Sagittal view showing mass" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/radiology/requests">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Sign & Publish Report
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
