import "server-only";

import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";
import {
  generatePublicFormSubmissionId,
  getContactEmailConfiguration,
} from "@/lib/email/contact";
import type { PublicAppointmentRequestInput } from "@/lib/validations/appointment";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function generateAppointmentSubmissionId(now = new Date()) {
  return generatePublicFormSubmissionId("AMC-APT", now);
}

export async function sendAppointmentEmail(
  appointment: PublicAppointmentRequestInput,
  submissionId: string,
) {
  const { apiKey, from, to } = getContactEmailConfiguration();
  const fullName = `${appointment.firstName} ${appointment.lastName}`;
  
  let formattedDate = appointment.preferredDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
    const [year, month, day] = formattedDate.split('-');
    formattedDate = `${day}/${month}/${year}`;
  }

  const values = [
    ["Submission ID", submissionId],
    ["Full Name", fullName],
    ["Phone", appointment.phone],
    ["Email", appointment.email || "Not provided"],
    ["Preferred Date", formattedDate],
    ["Department/Service", appointment.service],
    ["Message", appointment.notes || "Not provided"],
  ] as const;
  const text = [
    "ACCURATE MEDICAL CENTER",
    "APPOINTMENT REQUEST",
    "",
    ...values.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://accuratemedicalcentre.com";
  const logoUrl = `${appUrl}/marketing/images/logo.jpeg`;
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #03161a; padding: 40px 32px; text-align: center; border-bottom: 4px solid #d8e874;">
        <img src="${logoUrl}" alt="Accurate Medical Center" style="width: 72px; height: 72px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.2;">Accurate Medical Center</h1>
        <p style="color: #d8e874; margin: 12px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600;">New Appointment Request</p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 32px;">
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
          A new appointment request has been submitted through the website portal. Please review the details below.
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${values.map(([label, value], index) => `
              <tr>
                <th align="left" style="padding: 16px 0; ${index !== values.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''} color: #6b7280; font-weight: 600; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${escapeHtml(label)}</th>
                <td style="padding: 16px 0; ${index !== values.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''} color: #111827; font-size: 16px; font-weight: 500; line-height: 1.5;">${escapeHtml(value)}</td>
              </tr>
            `).join("")}
          </table>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
            <strong>Accurate Medical Center</strong><br/>
            Healing Minds. Restoring Lives.
          </p>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            Secure Notification &bull; ID: ${submissionId}
          </p>
        </div>
      </div>
    </div>
  `;

  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: appointment.email || undefined,
    subject: `New Appointment Request - ${submissionId}`,
    text,
    html,
  });

  if (error || !data?.id) {
    logger.error("Appointment email provider rejected the request", {
      providerError: error?.message ?? "No provider response",
    });
    throw new Error("Appointment email provider request failed.");
  }

  return data;
}
