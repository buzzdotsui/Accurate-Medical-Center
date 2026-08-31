import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { NotificationService } from '@/services/notification.service';
import { ok, notFound } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * POST /api/v1/notifications/:id/read
 * Mark a single notification as read. Ownership is enforced inside
 * `NotificationService.markAsRead` (scoped to the caller's own userId),
 * never trusting the URL id alone.
 */
export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const id = await getParam(ctx, 'id');
  const found = await NotificationService.markAsRead(id, session.user.id);
  if (!found) return notFound('Notification');
  return ok({ id, isRead: true });
});
