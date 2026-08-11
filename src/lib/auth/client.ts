import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client configuration.
 * Exposes hooks like useSession, signIn, signOut for React components.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL, // Must match the environment variable
});

// Export convenience hooks
export const { useSession, signIn, signOut, signUp } = authClient;
