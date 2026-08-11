import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { UpdateSettingsSchema } from '@/lib/validations/settings';
import { SettingsService } from '@/services/settings.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const settings = await SettingsService.getSettings();
  return ok(settings);
});

export const PUT = withAuth(async (req, session) => {
  const body = await parseBody(req, UpdateSettingsSchema);
  const result = await SettingsService.updateSettings(body, session.user.id);
  return ok(result, { message: 'Settings updated successfully' });
});
