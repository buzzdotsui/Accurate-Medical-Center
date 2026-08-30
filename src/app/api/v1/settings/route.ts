import { NextRequest } from 'next/server';
import { withAuth, withRole, parseBody } from '@/lib/api/middleware';
import { UpdateSettingsSchema } from '@/lib/validations/settings';
import { SettingsService } from '@/services/settings.service';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

// Read is intentionally broad (non-sensitive hospital metadata: name,
// contact info, currency) since several dashboards display it.
export const GET = withAuth(async () => {
  const settings = await SettingsService.getSettings();
  return ok(settings);
});

/**
 * PUT /api/v1/settings
 * "Configuration" is a SUPER_ADMIN-only responsibility.
 */
export const PUT = withRole([ROLES.SUPER_ADMIN], async (req, session) => {
  const body = await parseBody(req, UpdateSettingsSchema);
  const result = await SettingsService.updateSettings(body, session.user.id);
  return ok(result, { message: 'Settings updated successfully' });
});
