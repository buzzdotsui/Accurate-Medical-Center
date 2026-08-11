import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AppError } from '@/lib/api/errors';

// Initialize Redis only if URLs are provided (graceful degradation)
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = (redisUrl && redisToken) 
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

/**
 * Helper to execute a rate limit check and throw a standard AppError if exceeded.
 */
export async function checkRateLimit(ip: string = '127.0.0.1', type: 'global' | 'auth' = 'global') {
  if (!redis) return; // Skip if Redis is not configured (e.g., local dev without Redis)

  const limiter = type === 'auth' ? authRateLimit : globalRateLimit;
  if (!limiter) return;

  const { success } = await limiter.limit(ip);
  if (!success) {
    throw new AppError('Rate limit exceeded. Please try again later.', 'TOO_MANY_REQUESTS', 429);
  }
}
