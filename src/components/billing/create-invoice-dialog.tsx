"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Receipt, Loader2, Search, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const ClientCreateInvoiceSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().int().positive("Must be at least 1"),
        unitPrice: z.coerce.number().nonnegative("Cannot be negative"),
      })
    )
    .min(1, "At least one item is required"),
  discount: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
});

type ClientCreateInvoiceInput = z.infer<typeof ClientCreateInvoiceSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [created, setCreated] = useState<{ invoiceId: string; totalAmount: number } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientCreateInvoiceInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ClientCreateInvoiceSchema) as any,
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      discount: 0,
      tax: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = watch("discount") ?? 0;
  const tax = watch("tax") ?? 0;
  const subTotal = (items ?? []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const total = subTotal - Number(discount || 0) + Number(tax || 0);

  const searchPatients = useCallback((search: string) => {
    setLoadingPatients(true);
    const params = new URLSearchParams({ take: "20" });
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/v1/patients?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setPatients(data?.data?.patients ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    searchPatients("");
  }, [open, searchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => searchPatients(patientSearch), 400);
    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients]);

  async function onSubmit(values: ClientCreateInvoiceInput) {
    try {
      const res = await fetch("/api/v1/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error("Failed to create invoice", { description: json?.error?.message ?? "Please try again." });
        return;
      }

      setCreated({ invoiceId: json.data.invoiceId, totalAmount: Number(json.data.totalAmount) });
      reset({ items: [{ description: "", quantity: 1, unitPrice: 0 }], discount: 0, tax: 0 });
      setPatientSearch("");
      onSuccess();
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset({ items: [{ description: "", quantity: 1, unitPrice: 0 }], discount: 0, tax: 0 });
      setPatientSearch("");
      setCreated(null);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Receipt className="w-5 h-5" />
                Invoice Created
              </DialogTitle>
              <DialogDescription>
                The invoice has been generated and the patient has been notified.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-5 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-base font-semibold text-foreground">{formatNaira(created.totalAmount)}</p>
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice ID</p>
                <p className="font-mono text-2xl font-bold tracking-widest text-primary">{created.invoiceId}</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCreated(null)}>Create Another</Button>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                New Invoice
              </DialogTitle>
              <DialogDescription>
                Generate an invoice for a registered patient. Add one or more line items.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField label="Patient" htmlFor="inv-patientSearch" error={errors.patientId?.message} required>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="inv-patientSearch"
                      placeholder="Search by name, ID, or phone…"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-8"
                    />
                  </div>
                  <Select id="inv-patientId" disabled={isSubmitting || loadingPatients} {...register("patientId")}>
                    <option value="">{loadingPatients ? "Loading patients…" : "— Select Patient —"}</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientId})
                      </option>
                    ))}
                  </Select>
                </div>
              </FormField>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Line Items</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_70px_110px_auto] gap-2 items-start">
                    <div>
                      <Input
                        placeholder="e.g. Consultation fee"
                        disabled={isSubmitting}
                        {...register(`items.${index}.description`)}
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-xs text-destructive mt-1">{errors.items[index]?.description?.message}</p>
                      )}
                    </div>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      disabled={isSubmitting}
                      {...register(`items.${index}.quantity`)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Unit price"
                      disabled={isSubmitting}
                      {...register(`items.${index}.unitPrice`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => remove(index)}
                      disabled={isSubmitting || fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {errors.items?.message && <p className="text-xs text-destructive">{errors.items.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Discount" htmlFor="inv-discount" error={errors.discount?.message}>
                  <Input id="inv-discount" type="number" step="0.01" min={0} disabled={isSubmitting} {...register("discount")} />
                </FormField>
                <FormField label="Tax" htmlFor="inv-tax" error={errors.tax?.message}>
                  <Input id="inv-tax" type="number" step="0.01" min={0} disabled={isSubmitting} {...register("tax")} />
                </FormField>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatNaira(total)}</span>
              </div>

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleClose(false)}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" /> Create Invoice
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
