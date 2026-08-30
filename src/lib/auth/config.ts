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
      // `input: false` is critical: it stops these fields from being
      // settable through the public sign-up/update surface (both the
      // client SDK AND a raw HTTP POST to /api/auth/sign-up/email), which
      // would otherwise let anyone self-elevate to ADMIN/SUPER_ADMIN or
      // claim a branch by simply adding an extra field to the request
      // body. Every account starts as a PATIENT with no branch.
      //
      // Elevated roles/branches are only ever assigned server-side, by
      // `StaffService.createStaff` (itself gated behind an ADMIN/SUPER_ADMIN
      // authorization check), via a direct Prisma write — never through
      // this Better Auth input path.
      role: {
        type: 'string',
        required: false,
        defaultValue: 'PATIENT',
        input: false,
      },
      branchId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
});

export type AuthType = typeof auth;
