"use client";

import * as React from "react";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface DischargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  onConfirm: (dischargeNotes: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function DischargeDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  isLoading = false,
}: DischargeDialogProps) {
  const [notes, setNotes] = useState("");

  function handleClose(isOpen: boolean) {
    if (!isOpen) setNotes("");
    onOpenChange(isOpen);
  }

  async function handleConfirm() {
    await onConfirm(notes);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-primary" />
            Discharge Patient
          </DialogTitle>
          <DialogDescription>
            {patientName
              ? `Discharge ${patientName} and free their bed for a new admission.`
              : "Discharge this patient and free their bed for a new admission."}
          </DialogDescription>
        </DialogHeader>

        <FormField label="Discharge Notes" htmlFor="discharge-notes" helperText="Optional">
          <Textarea
            id="discharge-notes"
            placeholder="e.g. Patient recovered, discharged with follow-up in 2 weeks…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
        </FormField>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => handleClose(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirm} disabled={isLoading} className="gap-2">
            <LogOut className="w-4 h-4" />
            {isLoading ? "Discharging…" : "Discharge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
