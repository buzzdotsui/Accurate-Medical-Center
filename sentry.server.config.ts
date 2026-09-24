import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Prefer server DSN; fall back to public DSN for simple single-key setups.
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
