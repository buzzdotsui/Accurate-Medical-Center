import { NextRequest } from "next/server";
import { error, ok, tooManyRequests } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import {
  ContactEmailConfigurationError,
  generateContactSubmissionId,
  sendContactEmail,
} from "@/lib/email/contact";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ContactFormSchema } from "@/lib/validations/contact";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16_384;

type RequestBodyResult =
  | { kind: "ok"; payload: unknown }
  | { kind: "invalid" }
  | { kind: "too_large" };

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

async function readJsonBody(request: NextRequest): Promise<RequestBodyResult> {
  if (!request.body) return { kind: "invalid" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      length += value.byteLength;
      if (length > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "invalid" };
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { kind: "ok", payload: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { kind: "invalid" };
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!contentType.toLowerCase().includes("application/json")) {
    return error("UNSUPPORTED_MEDIA_TYPE", "Please submit the form as JSON.", 415);
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return error("PAYLOAD_TOO_LARGE", "The submitted form is too large.", 413);
  }

  const body = await readJsonBody(request);
  if (body.kind === "too_large") {
    return error("PAYLOAD_TOO_LARGE", "The submitted form is too large.", 413);
  }

  const payload = body.kind === "ok" ? body.payload : null;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return error("BAD_REQUEST", "Please review the form and try again.", 400);
  }
  const payloadRecord = payload as Record<string, unknown>;

  // A filled honeypot is rejected without revealing the anti-spam mechanism.
  if (typeof payloadRecord.website === "string" && payloadRecord.website.length > 0) {
    return error("BAD_REQUEST", "Please review the form and try again.", 400);
  }

  const parsed = ContactFormSchema.safeParse(payload);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Please review the form and try again.", 422);
  }

  const ip = getClientIp(request);
  try {
    await checkRateLimit(ip, "contact");
  } catch (rateLimitError) {
    if (rateLimitError instanceof AppError && rateLimitError.statusCode === 429) {
      return tooManyRequests("Please wait a few minutes before sending another message.");
    }

    logger.error("Contact rate limit check failed", {
      error: rateLimitError instanceof Error ? rateLimitError.message : "Unknown error",
    });
    return error("SERVICE_UNAVAILABLE", "The contact service is temporarily unavailable.", 503);
  }

  try {
    const submissionId = generateContactSubmissionId();
    await sendContactEmail(parsed.data, submissionId);
    return ok({ status: "sent", submissionId });
  } catch (sendError) {
    logger.error("Contact message could not be sent", {
      error: sendError instanceof Error ? sendError.message : "Unknown error",
      ip,
    });

    if (sendError instanceof ContactEmailConfigurationError) {
      return error("SERVICE_UNAVAILABLE", "The contact service is temporarily unavailable. Please call us directly.", 503);
    }

    return error("EMAIL_SEND_FAILED", "We could not send your message right now. Please try again or call us directly.", 502);
  }
}
