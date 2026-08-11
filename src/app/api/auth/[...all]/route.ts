import { auth } from '@/lib/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';

// Convert the Better Auth instance into Next.js Route Handlers
export const { GET, POST } = toNextJsHandler(auth);
