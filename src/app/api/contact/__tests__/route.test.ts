import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const checkRateLimitMock = vi.fn();
const sendContactEmailMock = vi.fn();

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock("@/lib/email/contact", () => ({
  ContactEmailConfigurationError: class ContactEmailConfigurationError extends Error {},
  generateContactSubmissionId: () => "AMC-TEST-001",
  sendContactEmail: (...args: unknown[]) => sendContactEmailMock(...args),
}));

import { POST } from "@/app/api/contact/route";

const validContact = {
  name: "Testimony Owolabi",
  phone: "+23490493337959",
  email: "example@gmail.com",
  message: "I need consultation with the Doctor",
  website: "",
};

function makeRequest(payload: unknown) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    sendContactEmailMock.mockReset();
    checkRateLimitMock.mockResolvedValue(undefined);
    sendContactEmailMock.mockResolvedValue(undefined);
  });

  it("passes a valid contact payload to the email submission stage", async () => {
    const response = await POST(makeRequest(validContact));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { status: "sent", submissionId: "AMC-TEST-001" },
    });
    expect(checkRateLimitMock).toHaveBeenCalledWith("127.0.0.1", "contact");
    expect(sendContactEmailMock).toHaveBeenCalledWith(validContact, "AMC-TEST-001");
  });

  it("rejects invalid contact data before rate limiting or email submission", async () => {
    const response = await POST(makeRequest({ ...validContact, phone: "phone?" }));

    expect(response.status).toBe(422);
    expect(checkRateLimitMock).not.toHaveBeenCalled();
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });
});
