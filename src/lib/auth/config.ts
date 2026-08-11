import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/client';

/**
 * Better Auth configuration.
 * Configures the Prisma adapter, session management, and authentication strategies.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Don't auto sign in after registration (requires verification/approval)
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (Update session if older than 1 day)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  rateLimit: {
    window: 60, // 60 seconds
    max: 100, // 100 requests per minute
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'PATIENT',
      },
      branchId: {
        type: 'string',
        required: false,
      },
    },
  },
});

export type AuthType = typeof auth;
