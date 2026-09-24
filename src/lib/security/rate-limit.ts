import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AppError } from '@/lib/api/errors';

// Upstash-only architecture: @upstash/redis is an HTTPS REST client and
// does NOT accept a TCP redis:// URL. A local Docker redis://redis:6379
// backend is intentionally unsupported here — configure production/local
// rate limiting with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
// When unset: auth fails open (login stays available); contact/appointment
// public forms fail closed (503) so abuse protection is never silently off.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = (redisUrl?.startsWith('https://') && redisToken)
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

/**
 * Global rate limiter allowing 100 requests per 10 seconds per IP.
 * Used for standard API endpoints.
 */
export const globalRateLimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/global',
    })
  : null;

/**
 * Strict rate limiter for authentication endpoints (e.g., login, register).
 * Allows 5 requests per minute per IP to prevent brute-force attacks.
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/auth',
    })
  : null;

/** Public contact form limiter: five submissions per ten minutes per IP. */
export const contactRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/contact',
    })
  : null;

/** Public appointment-request limiter: five submissions per ten minutes per IP. */
export const appointmentRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/appointment',
    })
  : null;

/**
 * Helper to execute a rate limit check and throw a standard AppError if exceeded.
 */
export async function checkRateLimit(ip: string = '127.0.0.1', type: 'global' | 'auth' | 'contact' | 'appointment' = 'global') {
  if (!redis) {
    // Public form delivery must never run without its abuse protection.
    if (type === 'contact' || type === 'appointment') {
      throw new AppError('Public form rate limiting is not configured.', 'SERVICE_UNAVAILABLE', 503);
    }
    return; // Other existing endpoints retain their local-development behaviour.
  }

  const limiter = type === 'auth'
    ? authRateLimit
    : type === 'contact'
      ? contactRateLimit
      : type === 'appointment'
        ? appointmentRateLimit
        : globalRateLimit;
  if (!limiter) return;

  const { success } = await limiter.limit(ip);
  if (!success) {
    throw new AppError('Rate limit exceeded. Please try again later.', 'TOO_MANY_REQUESTS', 429);
  }
}
