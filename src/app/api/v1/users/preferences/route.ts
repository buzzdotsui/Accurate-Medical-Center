import { withAuth, parseBody } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const PreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).optional(),
  timezone: z.string().min(2).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
});

/**
 * GET /api/v1/users/preferences
 * Get the authenticated user's preferences.
 */
export const GET = withAuth(async (_req, session) => {
  // For now, return defaults since we don't have a preferences table
  // In the future, this would query a UserPreferences model
  return ok({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
  });
});

/**
 * PATCH /api/v1/users/preferences
 * Update the authenticated user's preferences.
 */
export const PATCH = withAuth(async (req, session) => {
  const body = await parseBody(req, PreferencesSchema);

  // For now, just return success since we don't have a preferences table
  // In the future, this would upsert a UserPreferences record
  return ok({ success: true, preferences: body });
});