import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client configuration.
 * Exposes hooks like useSession, signIn, signOut for React components.
 *
 * FIX (Stage 3.5): The previous version hard-coded
 *   baseURL: process.env.NEXT_PUBLIC_APP_URL
 * which was baked into the JS bundle at Docker build time as the production
 * Vercel URL ("https://accurate-medical.vercel.app").  This caused all
 * client-side auth requests (signUp, signIn, getSession) to be sent to the
 * production server, whose session cookies are scoped to the production
 * domain and are therefore invisible to the local API routes.
 *
 * Fix: omit baseURL so Better Auth defaults to window.location.origin at
 * runtime, making it self-relative in every environment (local Docker,
 * staging, production) without requiring a rebuild.
 */
export const authClient = createAuthClient();

// Export convenience hooks
export const { useSession, signIn, signOut, signUp, requestPasswordReset, resetPassword } = authClient;
