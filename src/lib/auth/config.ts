import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/client';
import { NotificationService } from '@/services/notification.service';

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
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      try {
        await NotificationService.sendEmail({
          to: user.email,
          subject: 'Reset Your Password — Accurate Medical Center',
          html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f766e;">Password Reset Request</h2>
          <p>Dear ${user.name || 'User'},</p>
          <p>We received a request to reset the password for your account at Accurate Medical Center.</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <p style="margin: 24px 0;">
            <a href="${url}" style="background: #0f766e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
          <p style="font-size: 12px; color: #666;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Accurate Medical Center — Secure Healthcare Management</p>
        </div>
      `,
        });
      } catch (error) {
        // Log but don't throw — Better Auth handles the token generation regardless of email delivery
        console.error('[Auth] Failed to send password reset email:', error);
      }
    },
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
