import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

/**
 * Deferred specialty module notice (Phase 1 commercial scope).
 * Source for future development remains under src/ (psych service/APIs,
 * schema models). This page does not present unfinished features as delivered.
 */
export default function PsychDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Mental Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Role workspace
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-semibold text-foreground">
            Module not included in Phase 1
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Psychological assessment and therapy workflows are deferred to a
          future phase and are not part of the current product release. Please
          use your hospital&apos;s approved clinical process for mental-health
          records until this module is purchased and enabled.
        </p>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/login">
            <ArrowLeft className="w-4 h-4" /> Back to sign-in
          </Link>
        </Button>
      </div>
    </div>
  );
}
