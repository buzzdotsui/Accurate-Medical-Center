"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally no console dump of PHI-adjacent stack traces in production UI.
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while loading this dashboard view. You can try again.
      </p>
      <Button className="mt-6" onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
