import { withAuth } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok } from '@/lib/api/response';

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all of the authenticated user's own notifications as read.
 */
export const PATCH = withAuth(async (_req, session) => {
  await NotificationService.markAllAsRead(session.user.id);
  return ok({ success: true });
});
