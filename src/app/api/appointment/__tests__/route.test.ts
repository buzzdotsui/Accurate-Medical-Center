import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const checkRateLimitMock = vi.fn();
const sendAppointmentEmailMock = vi.fn();

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock("@/lib/email/contact", () => ({
  ContactEmailConfigurationError: class ContactEmailConfigurationError extends Error {},
}));

vi.mock("@/lib/email/appointment", () => ({
  generateAppointmentSubmissionId: () => "AMC-APT-TEST-001",
  sendAppointmentEmail: (...args: unknown[]) => sendAppointmentEmailMock(...args),
}));

import { POST } from "@/app/api/appointment/route";

const validAppointment = {
  firstName: "Testimony",
  lastName: "Owolabi",
  phone: "+23490493337959",
  email: "example@gmail.com",
  service: "Outpatient Clinic",
  preferredDate: "2099-01-01",
  notes: "I need consultation with the Doctor",
  website: "",
};

function makeRequest(payload: unknown) {
  return new NextRequest("http://localhost/api/appointment", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/appointment", () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    sendAppointmentEmailMock.mockReset();
    checkRateLimitMock.mockResolvedValue(undefined);
    sendAppointmentEmailMock.mockResolvedValue(undefined);
  });

  it("passes a valid appointment payload to the email submission stage", async () => {
    const response = await POST(makeRequest(validAppointment));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { status: "submitted", submissionId: "AMC-APT-TEST-001" },
    });
    expect(checkRateLimitMock).toHaveBeenCalledWith("127.0.0.1", "appointment");
    expect(sendAppointmentEmailMock).toHaveBeenCalledWith(validAppointment, "AMC-APT-TEST-001");
  });

  it("rejects a past appointment date before rate limiting or email submission", async () => {
    const response = await POST(makeRequest({ ...validAppointment, preferredDate: "2000-01-01" }));

    expect(response.status).toBe(422);
    expect(checkRateLimitMock).not.toHaveBeenCalled();
    expect(sendAppointmentEmailMock).not.toHaveBeenCalled();
  });
});
