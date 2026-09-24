import * as Sentry from "@sentry/nextjs";

// Client SDK init for Next (also referenced by instrumentation-client conventions).
// Server/edge init lives in sentry.server.config.ts / sentry.edge.config.ts
// and is registered from src/instrumentation.ts.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
