import { NextRequest } from "next/server";
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

  try {
    const submissionId = generateAppointmentSubmissionId();
    await sendAppointmentEmail(parsed.data, submissionId);
    return ok({ status: "submitted", submissionId });
  } catch (sendError) {
    logger.error("Appointment request could not be sent", {
      error: sendError instanceof Error ? sendError.message : "Unknown error",
      ip,
    });

    if (sendError instanceof ContactEmailConfigurationError) {
      return error("SERVICE_UNAVAILABLE", "The appointment service is temporarily unavailable. Please call us directly.", 503);
    }

    return error("EMAIL_SEND_FAILED", "We could not submit your appointment request right now. Please try again or call us directly.", 502);
  }
}
