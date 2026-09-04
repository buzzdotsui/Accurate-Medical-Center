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
  const values = [
    ["Submission ID", submissionId],
    ["Full Name", fullName],
    ["Phone", appointment.phone],
    ["Email", appointment.email || "Not provided"],
    ["Preferred Date", appointment.preferredDate],
    ["Department/Service", appointment.service],
    ["Message", appointment.notes || "Not provided"],
  ] as const;
  const text = [
    "ACCURATE MEDICAL CENTER",
    "APPOINTMENT REQUEST",
    "",
    ...values.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
  const html = `
    <h1>Appointment Request</h1>
    <table style="border-collapse:collapse">
      ${values.map(([label, value]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`).join("")}
    </table>
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
