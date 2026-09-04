import "server-only";

import { randomInt } from "node:crypto";
import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";
import type { ContactFormData } from "@/lib/validations/contact";

export class ContactEmailConfigurationError extends Error {}

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

  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: contact.email || undefined,
    subject: `New Contact Form Submission - ${submissionId}`,
    text,
  });

  if (error || !data?.id) {
    logger.error("Contact email provider rejected the request", {
      providerError: error?.message ?? "No provider response",
    });
    throw new Error("Contact email provider request failed.");
  }

  return data;
}
