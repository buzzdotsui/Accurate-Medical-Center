import "server-only";

import { randomInt } from "node:crypto";
import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";
import type { ContactFormData } from "@/lib/validations/contact";

export class ContactEmailConfigurationError extends Error {}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function getContactEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.CONTACT_EMAIL_TO;

  if (!apiKey || !from || !to) {
    throw new ContactEmailConfigurationError("Contact email service is not configured.");
  }

  return { apiKey, from, to };
}

const SUBMISSION_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getSubmissionDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}${value("month")}${value("day")}`;
}

export function generatePublicFormSubmissionId(prefix: "AMC" | "AMC-APT", now = new Date()) {
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += SUBMISSION_ID_ALPHABET[randomInt(SUBMISSION_ID_ALPHABET.length)];
  }

  return `${prefix}-${getSubmissionDate(now)}-${suffix}`;
}

export function generateContactSubmissionId(now = new Date()) {
  return generatePublicFormSubmissionId("AMC", now);
}

export async function sendContactEmail(contact: ContactFormData, submissionId: string) {
  const { apiKey, from, to } = getContactEmailConfiguration();
  const submittedAt = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  const text = [
    "ACCURATE MEDICAL CENTER",
    "NEW CONTACT FORM SUBMISSION",
    "",
    `Submission ID: ${submissionId}`,
    `Submitted: ${submittedAt}`,
    "",
    "--------------------------------",
    "CONTACT INFORMATION",
    "--------------------------------",
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email || "Not provided"}`,
    `Phone: ${contact.phone || "Not provided"}`,
    "",
    "--------------------------------",
    "MESSAGE",
    "--------------------------------",
    "",
    contact.message,
    "",
    "--------------------------------",
    "",
    `Submission ID: ${submissionId}`,
  ].join("\n");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://accurate-medical.vercel.app";
  const logoUrl = `${appUrl}/marketing/images/logo.jpeg`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #03161a; padding: 40px 32px; text-align: center; border-bottom: 4px solid #d8e874;">
        <img src="${logoUrl}" alt="Accurate Medical Center" style="width: 72px; height: 72px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.2;">Accurate Medical Center</h1>
        <p style="color: #d8e874; margin: 12px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600;">New Contact Message</p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 32px;">
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
          A new message has been submitted through the contact form on the website portal.
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th align="left" style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Name</th>
              <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px; font-weight: 500; line-height: 1.5;">${escapeHtml(contact.name)}</td>
            </tr>
            <tr>
              <th align="left" style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Email</th>
              <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 16px; font-weight: 500; line-height: 1.5;">${escapeHtml(contact.email || "Not provided")}</td>
            </tr>
            <tr>
              <th align="left" style="padding: 16px 0; color: #6b7280; font-weight: 600; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Phone</th>
              <td style="padding: 16px 0; color: #111827; font-size: 16px; font-weight: 500; line-height: 1.5;">${escapeHtml(contact.phone || "Not provided")}</td>
            </tr>
          </table>
        </div>
        
        <h2 style="font-size: 14px; color: #4b5563; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Message</h2>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; font-size: 16px; line-height: 1.6; color: #111827; border: 1px solid #e5e7eb; white-space: pre-wrap; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);">${escapeHtml(contact.message)}</div>
        
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
    replyTo: contact.email || undefined,
    subject: `New Contact Form Submission - ${submissionId}`,
    text,
    html,
  });

  if (error || !data?.id) {
    logger.error("Contact email provider rejected the request", {
      providerError: error?.message ?? "No provider response",
    });
    throw new Error("Contact email provider request failed.");
  }

  return data;
}
