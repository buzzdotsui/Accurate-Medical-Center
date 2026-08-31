"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { FileUp, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function UploadDocumentDialog({ open, onOpenChange, patientId, onSuccess }: UploadDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum size is 10 MB.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);

      const uploadRes = await fetch("/api/v1/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: dataUrl, folder: `accurate-medical/patients/${patientId}` }),
      });
      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok) {
        throw new Error(uploadJson?.error?.message ?? "Failed to upload file.");
      }

      const fileUrl: string = uploadJson.data.url;

      const docRes = await fetch(`/api/v1/patients/${patientId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          fileUrl,
          fileType: file.type || "application/octet-stream",
        }),
      });
      const docJson = await docRes.json().catch(() => null);
      if (!docRes.ok) {
        throw new Error(docJson?.error?.message ?? "Failed to save document record.");
      }

      toast.success("Document uploaded successfully");
      handleClose(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      setError(msg);
      toast.error("Upload failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setTitle("");
      setFile(null);
      setError(null);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Attach a file to this patient&apos;s record (e.g. a scanned report, referral letter, or consent form).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <FormField label="Title" htmlFor="doc-title" required>
            <Input
              id="doc-title"
              placeholder="e.g. Discharge Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="File" htmlFor="doc-file" required helperText="Maximum size 10 MB.">
            <Input
              id="doc-file"
              type="file"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </FormField>

          {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
