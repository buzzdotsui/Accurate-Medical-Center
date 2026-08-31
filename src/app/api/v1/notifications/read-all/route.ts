import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok } from '@/lib/api/response';

/**
 * POST /api/v1/notifications/read-all
 * Mark all of the authenticated user's own notifications as read.
 */
export const POST = withAuth(async (req, session) => {
  await NotificationService.markAllAsRead(session.user.id);
  return ok({ success: true });
});
