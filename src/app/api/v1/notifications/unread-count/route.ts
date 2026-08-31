import { withAuth } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok } from '@/lib/api/response';

/**
 * GET /api/v1/notifications/unread-count
 * Lightweight endpoint for the notification bell's badge, so the client
 * can poll frequently without re-fetching the full notification list.
 * Always scoped to the authenticated session user - never a client-
 * supplied userId.
 */
export const GET = withAuth(async (_req, session) => {
  const unreadCount = await NotificationService.getUnreadCount(session.user.id);
  return ok({ unreadCount });
});
