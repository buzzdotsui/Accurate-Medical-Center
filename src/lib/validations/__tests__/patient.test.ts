import { describe, expect, it } from "vitest";
import {
  CreatePatientSchema,
  SetPatientStatusSchema,
  UpdatePatientSchema,
} from "@/lib/validations/patient";

describe("CreatePatientSchema", () => {
  it("accepts a minimal valid patient", () => {
    const result = CreatePatientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fully populated valid patient", () => {
    const result = CreatePatientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "08012345678",
      dateOfBirth: "1990-01-01",
      gender: "FEMALE",
      bloodGroup: "O+",
      genotype: "AA",
      address: "123 Main St",
      branchId: "branch-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a first name that is too short", () => {
    const result = CreatePatientSchema.safeParse({
      firstName: "J",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = CreatePatientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid blood group", () => {
    const result = CreatePatientSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      bloodGroup: "Z+",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdatePatientSchema", () => {
  it("requires an id", () => {
    const result = UpdatePatientSchema.safeParse({ firstName: "Jane" });
    expect(result.success).toBe(false);
  });

  it("accepts a partial update with an id", () => {
    const result = UpdatePatientSchema.safeParse({
      id: "patient-1",
      firstName: "Janet",
    });
    expect(result.success).toBe(true);
  });
});

describe("SetPatientStatusSchema", () => {
  it("requires a boolean isActive", () => {
    expect(SetPatientStatusSchema.safeParse({ isActive: true }).success).toBe(
      true,
    );
    expect(
      SetPatientStatusSchema.safeParse({ isActive: "true" }).success,
    ).toBe(false);
    expect(SetPatientStatusSchema.safeParse({}).success).toBe(false);
  });
});
