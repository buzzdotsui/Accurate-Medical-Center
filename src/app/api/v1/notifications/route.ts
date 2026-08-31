import { NextRequest } from 'next/server';
import { withAuth, parseQuery } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok } from '@/lib/api/response';
import { z } from 'zod';

const ListNotificationsQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional().default(false),
  take: z.coerce.number().min(1).max(50).optional().default(20),
});

/**
 * GET /api/v1/notifications
 * List the authenticated user's own in-app notifications, most recent
 * first, plus their current unread count.
 *
 * Authorization: any authenticated user. Always scoped to `session.user.id`
 * server-side (never a client-supplied userId) - a user can only ever see
 * their own notifications.
 */
export const GET = withAuth(async (req, session) => {
  const { unreadOnly, take } = parseQuery(req, ListNotificationsQuerySchema);
  const [notifications, unreadCount] = await Promise.all([
    NotificationService.listNotifications(session.user.id, { unreadOnly, take }),
    NotificationService.getUnreadCount(session.user.id),
  ]);
  return ok({ notifications, unreadCount });
});
