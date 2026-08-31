"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerateReportSchema, type GenerateReportInput } from "@/lib/validations/reporting";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

/**
 * Converts an array of (possibly nested) records into a flat CSV string.
 * Nested objects are flattened one level using dot-notation keys
 * (e.g. `invoice.patient.firstName`).
 */
function toCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return "";

  const flatten = (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
    return Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(acc, flatten(value as Record<string, unknown>, path));
      } else {
        acc[path] = Array.isArray(value) ? JSON.stringify(value) : value;
      }
      return acc;
    }, {});
  };

  const flatRecords = records.map((r) => flatten(r));
  const headers = Array.from(flatRecords.reduce((set, r) => {
    Object.keys(r).forEach((k) => set.add(k));
    return set;
  }, new Set<string>()));

  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [headers.join(",")];
  for (const record of flatRecords) {
    lines.push(headers.map((h) => escape(record[h])).join(","));
  }
  return lines.join("\n");
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportGenerator() {
  const [lastResult, setLastResult] = React.useState<{ records: Record<string, unknown>[]; format: string } | null>(null);

  const form = useForm<GenerateReportInput>({
    resolver: zodResolver(GenerateReportSchema),
    defaultValues: {
      type: "FINANCIAL",
      startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
      endDate: new Date().toISOString().split('T')[0], // Today
      format: "CSV"
    }
  });

  const format = form.watch("format");

  const mutation = useMutation({
    mutationFn: async (data: GenerateReportInput) => {
      const res = await fetch(`/api/v1/reporting/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to generate report");
      }
      return json.data as { data: Record<string, unknown>[]; format: string };
    },
    onSuccess: (result) => {
      setLastResult({ records: result.data, format: result.format });

      if (result.data.length === 0) {
        toast.info("Report generated, but no records were found for this date range.");
        return;
      }

      if (result.format === "JSON") {
        triggerDownload(JSON.stringify(result.data, null, 2), `report-${Date.now()}.json`, "application/json");
        toast.success(`Report downloaded (${result.data.length} records, JSON).`);
      } else if (result.format === "CSV") {
        triggerDownload(toCsv(result.data), `report-${Date.now()}.csv`, "text/csv");
        toast.success(`Report downloaded (${result.data.length} records, CSV).`);
      } else {
        // PDF rendering is not implemented server-side yet — be honest about
        // the limitation instead of pretending a PDF was generated.
        toast.info(`${result.data.length} records retrieved. PDF rendering is not yet available — see the JSON preview below.`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message);
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
              {(form.watch("type") === "INVENTORY" || form.watch("type") === "HR") && (
                <p className="text-xs text-warning flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> This dataset type is not yet implemented server-side and will return an empty report.
                </p>
              )}
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
                <option value="JSON">Raw JSON (For API/Devs)</option>
                <option value="PDF">Formatted PDF Document (preview only)</option>
              </select>
              {format === "PDF" && (
                <p className="text-xs text-warning flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> PDF rendering isn't implemented yet — you'll get a JSON data preview instead.
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full h-12" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              Generate & Download
            </Button>
          </form>
        </CardContent>
      </Card>

      {lastResult && (
        <Card className="border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <CardTitle>Last Generated Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {lastResult.records.length} record{lastResult.records.length === 1 ? "" : "s"} retrieved.
            </p>
            {lastResult.records.length > 0 && (
              <pre className="text-xs bg-muted/40 rounded-md p-4 overflow-auto max-h-80">
                {JSON.stringify(lastResult.records.slice(0, 20), null, 2)}
                {lastResult.records.length > 20 && `\n... ${lastResult.records.length - 20} more record(s) not shown`}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
