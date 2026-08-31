import { describe, expect, it } from "vitest";
import { CreateConsultationSchema } from "@/lib/validations/consultation";

const baseInput = {
  visitId: "visit-1",
  subjective: "Patient reports headache",
  objective: "Vitals stable",
  assessment: "Tension headache",
  plan: "Rest and hydration",
};

describe("CreateConsultationSchema", () => {
  it("accepts a minimal valid consultation", () => {
    const result = CreateConsultationSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("accepts a fully populated valid consultation", () => {
    const result = CreateConsultationSchema.safeParse({
      ...baseInput,
      diagnosis: ["Tension headache"],
      prescriptions: [
        {
          medicineId: "med-1",
          quantity: 10,
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "5 days",
          instructions: "Take with food",
        },
      ],
      labRequests: [
        {
          categoryId: "cat-1",
          testName: "Full Blood Count",
          priority: "URGENT",
        },
      ],
      radiologyRequests: [
        {
          scanType: "XRAY",
          region: "Chest",
          priority: "STAT",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a request missing required SOAP fields", () => {
    const result = CreateConsultationSchema.safeParse({
      visitId: "visit-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a prescription item missing medicineId", () => {
    const result = CreateConsultationSchema.safeParse({
      ...baseInput,
      prescriptions: [
        {
          quantity: 5,
          dosage: "500mg",
          frequency: "Once daily",
          duration: "3 days",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a prescription item missing quantity", () => {
    const result = CreateConsultationSchema.safeParse({
      ...baseInput,
      prescriptions: [
        {
          medicineId: "med-1",
          dosage: "500mg",
          frequency: "Once daily",
          duration: "3 days",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a radiology request with an invalid scanType enum value", () => {
    const result = CreateConsultationSchema.safeParse({
      ...baseInput,
      radiologyRequests: [
        {
          scanType: "PET_SCAN",
          region: "Chest",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
