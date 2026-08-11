"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerateReportSchema, type GenerateReportInput } from "@/lib/validations/reporting";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function ReportGenerator() {
  const form = useForm<GenerateReportInput>({
    resolver: zodResolver(GenerateReportSchema),
    defaultValues: {
      type: "FINANCIAL",
      startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
      endDate: new Date().toISOString().split('T')[0], // Today
      format: "CSV"
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: GenerateReportInput) => {
      const res = await fetch(`/api/v1/reporting/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      return res.json();
    },
    onSuccess: (response) => {
      // In a real application, you would create a Blob from the response and trigger a browser download
      // const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url; a.download = `report.${form.getValues('format').toLowerCase()}`; a.click();
      
      toast.success(`Report generated successfully in ${response.format} format.`);
    }
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Report Generator</h1>
        <p className="text-muted-foreground mt-1">Extract specific datasets for auditing, compliance, and accounting.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle>Configure Export</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset Type</label>
              <select {...form.register("type")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="FINANCIAL">Financial (Revenue, Payments, Invoices)</option>
                <option value="CLINICAL">Clinical (Patient Visits, Diagnoses)</option>
                <option value="INVENTORY">Inventory (Stock Movements, Alerts)</option>
                <option value="HR">Human Resources (Schedules, Staff)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y py-6 my-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" {...form.register("startDate")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" {...form.register("endDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <select {...form.register("format")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="CSV">Raw CSV (For Excel/Sheets)</option>
                <option value="PDF">Formatted PDF Document</option>
                <option value="JSON">Raw JSON (For API/Devs)</option>
              </select>
            </div>

            <Button type="submit" size="lg" className="w-full h-12" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              Generate & Download
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
