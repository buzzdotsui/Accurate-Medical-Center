import { Resend } from 'resend';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/client';
import { ROLES, type Role } from '@/config/roles';

// Optionally fallback to Nodemailer for local development
// import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * In-app notification categories. Kept 1:1 with the real HMS events that
 * actually generate a notification below — the bell must never claim to
 * represent an event type that nothing creates.
 */
export type InAppNotificationType =
  | 'APPOINTMENT'
  | 'CONSULTATION'
  | 'LAB'
  | 'RADIOLOGY'
  | 'PRESCRIPTION'
  | 'BILLING'
  | 'INPATIENT'
  | 'STAFF'
  | 'SYSTEM';

export interface CreateNotificationParams {
  userId: string;
  type: InAppNotificationType;
  title: string;
  body: string;
  /** Optional deep-link to the related HMS record (an existing app route). */
  link?: string;
  /** Generic source-record reference, mirroring AuditLog.resource/resourceId. */
  resource?: string;
  resourceId?: string;
}

export class NotificationService {
  /**
   * Send an email using Resend
   */
  static async sendEmail(params: SendEmailParams) {
    try {
      const response = await resend.emails.send({
        from: params.from || 'Accurate Medical <no-reply@accuratemedical.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      return response;
    } catch (error) {
      logger.error('Failed to send email via Resend', { error, params });
      return null;
    }
  }

  /**
   * Template: Appointment Confirmation
   */
  static async sendAppointmentConfirmation(email: string, patientName: string, dateStr: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Appointment Confirmed</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment at Accurate Medical Center has been scheduled for <strong>${dateStr}</strong>.</p>
        <p>Please arrive 15 minutes early.</p>
        <br/>
        <p>Regards,<br/>The Accurate Medical Team</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Appointment Confirmed', html });
  }

  // ---------------------------------------------------------------------
  // In-app notifications (Notification model)
  // ---------------------------------------------------------------------
  //
  // Ownership is always enforced by scoping every read/write to the
  // caller's own userId (resolved server-side from the session — never
  // trusted from the client). Nothing here ever accepts an arbitrary
  // userId from an API request body/query string.

  /**
   * Create an in-app notification for a specific user (by their User.id).
   */
  static async createNotification(params: CreateNotificationParams) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        type: params.type,
        link: params.link,
        resource: params.resource,
        resourceId: params.resourceId,
      },
    });
  }

  /**
   * Bulk-create the same notification for many users at once (e.g. "notify
   * every nurse in this branch"). Uses `createMany`, which is a single
   * INSERT — safe and efficient for branch-scoped fan-out, at the cost of
   * not returning the created rows (never needed by callers here).
   */
  static async createNotifications(paramsList: CreateNotificationParams[]) {
    if (paramsList.length === 0) return { count: 0 };
    return prisma.notification.createMany({
      data: paramsList.map((params) => ({
        userId: params.userId,
        title: params.title,
        body: params.body,
        type: params.type,
        link: params.link,
        resource: params.resource,
        resourceId: params.resourceId,
      })),
    });
  }

  /**
   * Notify every active staff member of the given role(s) within a single
   * branch. This is the branch-isolation boundary for fan-out
   * notifications: it only ever looks up Staff rows scoped to `branchId`,
   * the same mechanism `buildBranchFilter`/`verifyStaffAccess` use
   * elsewhere, so a Branch A event can never reach a Branch B user.
   */
  static async notifyRoleInBranch(params: {
    roles: Role[];
    branchId: string;
    type: InAppNotificationType;
    title: string;
    body: string;
    link?: string;
    resource?: string;
    resourceId?: string;
    excludeUserId?: string;
  }) {
    const staff = await prisma.staff.findMany({
      where: {
        branchId: params.branchId,
        isActive: true,
        user: { role: { in: params.roles } },
      },
      select: { userId: true },
    });

    const userIds = staff
      .map((s) => s.userId)
      .filter((id) => id !== params.excludeUserId);

    return this.createNotifications(
      userIds.map((userId) => ({
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
        resource: params.resource,
        resourceId: params.resourceId,
      })),
    );
  }

  /**
   * Notify every SUPER_ADMIN in the organization (SUPER_ADMIN is
   * branch-independent by design, so this is intentionally NOT
   * branch-scoped — mirrors the existing SUPER_ADMIN override used
   * throughout `resource-authorization.ts`).
   */
  static async notifySuperAdmins(params: {
    type: InAppNotificationType;
    title: string;
    body: string;
    link?: string;
    resource?: string;
    resourceId?: string;
    excludeUserId?: string;
  }) {
    const admins = await prisma.user.findMany({
      where: {
        role: ROLES.SUPER_ADMIN,
        ...(params.excludeUserId ? { id: { not: params.excludeUserId } } : {}),
      },
      select: { id: true },
    });

    return this.createNotifications(
      admins.map((admin) => ({
        userId: admin.id,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
        resource: params.resource,
        resourceId: params.resourceId,
      })),
    );
  }

  /**
   * List notifications for a user, most recent first. Always scoped to the
   * given userId — callers must pass the session user's own id.
   */
  static async getUserNotifications(userId: string, params?: { unreadOnly?: boolean; take?: number }) {
    const take = params?.take ?? 20;
    return prisma.notification.findMany({
      where: { userId, ...(params?.unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  /**
   * Mark a single notification as read. Scoped to userId in the same
   * `updateMany` WHERE clause (not a separate ownership check followed by
   * an unscoped update) so a user can never mark another user's
   * notification as read — the id alone is never sufficient.
   */
  static async markAsRead(id: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
