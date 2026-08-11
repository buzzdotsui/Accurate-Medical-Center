import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { SettingsService } from '@/services/settings.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  
  const logs = await SettingsService.getAuditLogs(page, limit);
  return ok(logs);
});
