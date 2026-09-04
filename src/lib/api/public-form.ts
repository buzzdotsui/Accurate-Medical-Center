import type { NextRequest } from "next/server";

export const MAX_PUBLIC_FORM_REQUEST_BYTES = 16_384;

export type PublicFormRequestBody =
  | { kind: "ok"; payload: unknown }
  | { kind: "invalid" }
  | { kind: "too_large" };

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function readPublicFormJsonBody(request: NextRequest): Promise<PublicFormRequestBody> {
  if (!request.body) return { kind: "invalid" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      length += value.byteLength;
      if (length > MAX_PUBLIC_FORM_REQUEST_BYTES) {
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
