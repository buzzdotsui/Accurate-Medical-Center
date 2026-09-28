/**
 * Next.js Edge Middleware
 *
 * Applies auth rate-limiting to /api/auth/* via the Upstash-backed
 * checkRateLimit helper. When Upstash is not configured the middleware
 * passes all requests through (fail-open) so local development is unaffected.
 *
 * Previously this logic lived in src/proxy.ts but was never invoked because
 * Next.js only runs files named middleware.ts as middleware.
 */
export { proxy as middleware, config } from './proxy';
