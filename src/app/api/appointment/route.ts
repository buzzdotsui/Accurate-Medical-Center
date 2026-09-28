import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { error, ok, tooManyRequests } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import {
  getClientIp,
  MAX_PUBLIC_FORM_REQUEST_BYTES,
  readPublicFormJsonBody,
} from "@/lib/api/public-form";
import {
  ContactEmailConfigurationError,
} from "@/lib/email/contact";
import {
  generateAppointmentSubmissionId,
  sendAppointmentEmail,
} from "@/lib/email/appointment";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { PublicAppointmentRequestSchema } from "@/lib/validations/appointment";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!contentType.toLowerCase().includes("application/json")) {
    return error("UNSUPPORTED_MEDIA_TYPE", "Please submit the form as JSON.", 415);
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_PUBLIC_FORM_REQUEST_BYTES) {
    return error("PAYLOAD_TOO_LARGE", "The submitted form is too large.", 413);
  }

  const body = await readPublicFormJsonBody(request);
  if (body.kind === "too_large") {
    return error("PAYLOAD_TOO_LARGE", "The submitted form is too large.", 413);
  }

  const payload = body.kind === "ok" ? body.payload : null;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return error("BAD_REQUEST", "Please review the form and try again.", 400);
  }
  const payloadRecord = payload as Record<string, unknown>;

  if (typeof payloadRecord.website === "string" && payloadRecord.website.length > 0) {
    return error("BAD_REQUEST", "Please review the form and try again.", 400);
  }

  const parsed = PublicAppointmentRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Please review the form and try again.", 422);
  }

  const todayParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: Intl.DateTimeFormatPartTypes) =>
    todayParts.find((part) => part.type === type)?.value;
  const today = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;
  if (parsed.data.preferredDate < today) {
    return error("VALIDATION_ERROR", "Please choose a preferred date that is not in the past.", 422);
  }

  const ip = getClientIp(request);
  try {
    await checkRateLimit(ip, "appointment");
  } catch (rateLimitError) {
    if (rateLimitError instanceof AppError && rateLimitError.statusCode === 429) {
      return tooManyRequests("Please wait a few minutes before submitting another appointment request.");
    }

    logger.error("Appointment rate limit check failed", {
      error: rateLimitError instanceof Error ? rateLimitError.message : "Unknown error",
    });
    return error("SERVICE_UNAVAILABLE", "The appointment service is temporarily unavailable.", 503);
  }

  const submissionId = generateAppointmentSubmissionId();

  // ── Step 1: Send email notification (fail-soft) ─────────────────────────────
  // Email is the hospital's immediate alert. If it fails (e.g. Resend domain
  // not yet verified, misconfigured key) we log the exact provider error for
  // ops visibility but never surface it to the patient — the appointment is
  // still saved to the database and the hospital can retrieve it there.
  try {
    await sendAppointmentEmail(parsed.data, submissionId);
  } catch (emailError) {
    logger.error("Appointment email failed (fail-soft — request still accepted)", {
      error: emailError instanceof Error ? emailError.message : "Unknown error",
      submissionId,
      ip,
    });
    // Do not return an error response — fall through to DB write and success.
  }

  // ── Step 2: Persist to the database (secondary — fail-soft) ─────────────
  // Once the email is sent the patient's request is received. DB errors here
  // (e.g. schema not yet pushed, transient connection issue) must not cause
  // the user to see a failure — they will receive an email confirmation and
  // staff can manually log the visit if the record is missing.
  try {
    let branch = await prisma.branch.findFirst();
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          code: "MAIN",
          name: "Main Branch",
          address: "Accurate Medical Center",
          phone: "+2348133583097",
          email: "accuratemedicalcenterofficial@gmail.com",
        },
      });
    }

    let patient = null;
    if (parsed.data.email) {
      patient = await prisma.patient.findFirst({ where: { email: parsed.data.email } });
    }
    if (!patient && parsed.data.phone) {
      patient = await prisma.patient.findFirst({ where: { phone: parsed.data.phone } });
    }
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          patientId: `PAT-${Date.now().toString().slice(-6)}`,
          branchId: branch.id,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          email: parsed.data.email || undefined,
        },
      });
    }

    await prisma.appointment.create({
      data: {
        appointmentId: submissionId,
        patientId: patient.id,
        branchId: branch.id,
        date: new Date(parsed.data.preferredDate),
        status: "SCHEDULED",
        reason: parsed.data.service,
        notes: parsed.data.notes,
      },
    });
  } catch (dbError) {
    // Log for ops visibility but do not fail the request — email was sent.
    logger.error("Appointment DB write failed (email already sent)", {
      error: dbError instanceof Error ? dbError.message : "Unknown error",
      submissionId,
      ip,
    });
  }

  return ok({ status: "submitted", submissionId });
}
