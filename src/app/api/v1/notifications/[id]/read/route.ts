import { withAuth } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok, notFound } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read. Ownership is enforced inside
 * `NotificationService.markAsRead` (scoped to the caller's own userId in
 * the same WHERE clause), never trusting the URL id alone — a request for
 * another user's notification id returns 404, not another user's data.
 */
export const PATCH = withAuth(async (req, session, ctx: RouteContext) => {
  const id = await getParam(ctx, 'id');
  const found = await NotificationService.markAsRead(id, session.user.id);
  if (!found) return notFound('Notification');
  return ok({ id, isRead: true });
});
