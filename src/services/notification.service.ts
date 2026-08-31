import { Resend } from 'resend';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/client';

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
 * In-app notification types. Kept intentionally small and matched 1:1 to
 * events that are actually wired up below - the notification bell must
 * never claim to represent event types that nothing generates.
 */
export type InAppNotificationType = 'ALERT' | 'REMINDER' | 'MESSAGE';

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
  // The Notification model already exists in the Prisma schema (userId,
  // title, body, type, isRead, createdAt) but, until Stage 13, nothing
  // ever created, read, or updated a row in it - the topbar bell was
  // hard-disabled with a comment saying no such model existed yet. Since
  // the schema already supports it, this implements the real thing rather
  // than documenting it as future work. Call sites wrap these in
  // try/catch (mirroring AuditService.log) so a notification failure
  // never breaks the primary workflow.

  /**
   * Create an in-app notification for a specific user (by their User.id).
   */
  static async createNotification(params: {
    userId: string;
    title: string;
    body: string;
    type: InAppNotificationType;
  }) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        type: params.type,
      },
    });
  }

  /**
   * List notifications for a user, most recent first.
   */
  static async listNotifications(userId: string, params?: { unreadOnly?: boolean; take?: number }) {
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
   * Mark a single notification as read. Scoped to userId so a user can
   * only ever mark their own notifications.
   */
  static async markAsRead(id: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return result.count > 0;
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
