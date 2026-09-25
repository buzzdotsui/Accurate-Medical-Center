import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

/**
 * Deferred-module notice for Phase 1 product-surface enforcement
 * (invoice TTI/2026/HMS-P1-002).
 *
 * Rendered by server layouts/pages when isDeferredModuleEnabled() is false,
 * so future functionality (radiology, advanced analytics, specialty
 * modules) never appears as a working surface inside the Phase 1 product.
 * Source code for the deferred module remains under src/ for a future phase.
 */
export function DeferredModuleNotice({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle?: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-semibold text-foreground">
            Module not included in Phase 1
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
