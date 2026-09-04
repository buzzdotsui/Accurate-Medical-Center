import { describe, expect, it } from "vitest";
import {
  CreateAppointmentSchema,
  PublicAppointmentRequestSchema,
  UpdateAppointmentStatusSchema,
} from "@/lib/validations/appointment";

describe("CreateAppointmentSchema", () => {
  it("accepts a minimal valid appointment", () => {
    const result = CreateAppointmentSchema.safeParse({
      patientId: "patient-1",
      date: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("defaults type to IN_PERSON when omitted", () => {
    const result = CreateAppointmentSchema.safeParse({
      patientId: "patient-1",
      date: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("IN_PERSON");
    }
  });

  it("rejects a missing patientId", () => {
    const result = CreateAppointmentSchema.safeParse({
      date: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-datetime date string", () => {
    const result = CreateAppointmentSchema.safeParse({
      patientId: "patient-1",
      date: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid appointment type", () => {
    const result = CreateAppointmentSchema.safeParse({
      patientId: "patient-1",
      date: new Date().toISOString(),
      type: "VIDEO_CALL",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateAppointmentStatusSchema", () => {
  it("accepts each known status", () => {
    for (const status of [
      "SCHEDULED",
      "CHECKED_IN",
      "ARRIVED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "IN_PROGRESS",
    ]) {
      expect(
        UpdateAppointmentStatusSchema.safeParse({ status }).success,
      ).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    const result = UpdateAppointmentStatusSchema.safeParse({
      status: "PENDING",
    });
    expect(result.success).toBe(false);
  });
});

describe("PublicAppointmentRequestSchema", () => {
  it("accepts a valid public appointment request", () => {
    const result = PublicAppointmentRequestSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      phone: "+23490493337959",
      service: "Outpatient Clinic",
      preferredDate: "2099-01-01",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional email addresses when empty or valid", () => {
    const validRequest = {
      firstName: "Jane",
      lastName: "Doe",
      phone: "+23490493337959",
      service: "Outpatient Clinic",
      preferredDate: "2099-01-01",
      website: "",
    };

    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, email: "" }).success).toBe(true);
    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, email: "example@gmail.com" }).success).toBe(true);
  });

  it("rejects a request missing a required phone number", () => {
    const result = PublicAppointmentRequestSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      phone: "123",
      service: "Outpatient Clinic",
      preferredDate: "2099-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed dates, unknown services, and populated honeypots", () => {
    const validRequest = {
      firstName: "Jane",
      lastName: "Doe",
      phone: "+23490493337959",
      service: "Outpatient Clinic",
      preferredDate: "2099-01-01",
      website: "",
    };

    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, preferredDate: "2099-02-30" }).success).toBe(false);
    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, service: "Unknown Service" }).success).toBe(false);
    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, website: "spam.example" }).success).toBe(false);
  });

  it("rejects malformed email addresses and oversized public fields", () => {
    const validRequest = {
      firstName: "Jane",
      lastName: "Doe",
      phone: "+23490493337959",
      service: "Outpatient Clinic",
      preferredDate: "2099-01-01",
      website: "",
    };

    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, email: "not-an-email" }).success).toBe(false);
    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, firstName: "J".repeat(101) }).success).toBe(false);
    expect(PublicAppointmentRequestSchema.safeParse({ ...validRequest, notes: "N".repeat(1_001) }).success).toBe(false);
  });
});
