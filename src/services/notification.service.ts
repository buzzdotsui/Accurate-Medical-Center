import { Resend } from 'resend';
import { logger } from '@/lib/utils/logger';

// Optionally fallback to Nodemailer for local development
// import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
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
}
