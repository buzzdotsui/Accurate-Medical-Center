"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DispensePrescriptionSchema, type DispensePrescriptionInput } from "@/lib/validations/pharmacy";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle, PackageOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface PrescriptionDetail {
  id: string;
  prescriptionId: string;
  status: string;
  createdAt: string;
  visit: {
    patient: { firstName: string; lastName: string; patientId: string };
  };
  doctor: { user: { name: string } };
  items: Array<{
    id: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: string;
    dispensedQty: number;
    medicine: { name: string; unit: string; stockQuantity: number; reorderLevel: number };
  }>;
}

export default function DispensePrescription() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const prescriptionId = params.id as string;

  const { data: prescriptions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["prescriptions", "pending"],
    queryFn: async (): Promise<PrescriptionDetail[]> => {
      const res = await fetch("/api/v1/pharmacy/prescriptions", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? "Failed to load prescription");
      }
      return json.data;
    },
  });

  const prescription = prescriptions?.find((p) => p.id === prescriptionId);

  const form = useForm<DispensePrescriptionInput>({
    resolver: zodResolver(DispensePrescriptionSchema),
    defaultValues: {
      status: "DISPENSED",
      notes: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: DispensePrescriptionInput) => {
      const res = await fetch(`/api/v1/pharmacy/prescriptions/${prescriptionId}/dispense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to dispense");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Medications dispensed successfully.");
      queryClient.invalidateQueries({ queryKey: ["prescriptions", "pending"] });
      router.push("/pharmacy/prescriptions");
    },
    onError: (err: any) => {
      // Surface the exact backend message (including 409 "insufficient
      // stock for X: need Y, have Z" errors) instead of a generic toast.
      toast.error(err.message, { duration: 6000 });
    }
  });

  if (isLoading) {
    return <LoadingState message="Loading prescription..." className="py-24" />;
  }

  if (isError) {
    return (
      <ErrorState
        description={error instanceof Error ? error.message : "Failed to load prescription"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!prescription) {
    return (
      <ErrorState
        title="Prescription not found"
        description="This prescription could not be found. It may have already been dispensed."
        onRetry={() => refetch()}
      />
    );
  }

  const hasInsufficientStock = prescription.items.some(
    (it) => it.quantity - it.dispensedQty > 0 && it.medicine.stockQuantity < it.quantity - it.dispensedQty
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pharmacy/prescriptions"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dispense Medication</h1>
          <p className="text-muted-foreground mt-1">Prescription ID: {prescription.prescriptionId}</p>
        </div>
      </div>

      {hasInsufficientStock && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">
            One or more medications on this prescription do not have enough stock to be fully dispensed. Fully dispensing will fail until stock is replenished — consider marking as Partially Dispensed.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Prescribed Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.items.map(item => {
                  const remaining = item.quantity - item.dispensedQty;
                  const isLowStock = item.medicine.stockQuantity < remaining;
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-4 border rounded-lg ${isLowStock ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/10'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-1 ${isLowStock ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                          <PackageOpen className={`w-5 h-5 ${isLowStock ? 'text-destructive' : 'text-primary'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{item.medicine.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.dosage} • {item.frequency} • For {item.duration}
                          </p>
                          <p className={`text-xs mt-1 font-medium ${isLowStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                            In stock: {item.medicine.stockQuantity} {item.medicine.unit}(s)
                            {isLowStock && ` — insufficient for remaining ${remaining}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.quantity}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.dispensedQty > 0 ? `${item.dispensedQty} already dispensed` : "Total Qty"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Dispensing Action</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Patient</label>
                  <div className="p-3 bg-muted/50 rounded-md text-sm border font-medium">
                    {prescription.visit.patient.firstName} {prescription.visit.patient.lastName} ({prescription.visit.patient.patientId})
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Action</label>
                  <select 
                    {...form.register("status")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="DISPENSED">Fully Dispensed</option>
                    <option value="PARTIAL">Partially Dispensed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pharmacist Notes (Optional)</label>
                  <textarea 
                    {...form.register("notes")} 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="E.g. Substituted with generic brand..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Confirm Dispensation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
