"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DispensePrescriptionSchema, type DispensePrescriptionInput } from "@/lib/validations/pharmacy";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function DispensePrescription() {
  const router = useRouter();
  const params = useParams();
  
  // Hardcoded mock data for frontend demonstration. 
  // Real implementation maps this from GET /api/v1/pharmacy/prescriptions
  const prescription = {
    id: params.id as string,
    patient: { name: "John Doe", id: "AMC-2026-0001", age: 34 },
    doctor: "Dr. Adams",
    date: "2026-08-07",
    medications: [
      { id: 1, name: "Amoxicillin 500mg", dosage: "1 Tablet", frequency: "TID", duration: "7 days", qty: 21 },
      { id: 2, name: "Ibuprofen 400mg", dosage: "1 Tablet", frequency: "PRN", duration: "5 days", qty: 15 }
    ]
  };

  const form = useForm<DispensePrescriptionInput>({
    resolver: zodResolver(DispensePrescriptionSchema),
    defaultValues: {
      status: "DISPENSED",
      notes: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: DispensePrescriptionInput) => {
      const res = await fetch(`/api/v1/pharmacy/prescriptions/${prescription.id}/dispense`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to dispense");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Medications dispensed successfully.");
      router.push("/pharmacy/prescriptions");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pharmacy/prescriptions"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dispense Medication</h1>
          <p className="text-muted-foreground mt-1">Prescription ID: {prescription.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg">Prescribed Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full mt-1">
                        <PackageOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{med.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {med.dosage} • {med.frequency} • For {med.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{med.qty}</div>
                      <div className="text-xs text-muted-foreground">Total Qty</div>
                    </div>
                  </div>
                ))}
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
                    {prescription.patient.name} ({prescription.patient.id})
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
