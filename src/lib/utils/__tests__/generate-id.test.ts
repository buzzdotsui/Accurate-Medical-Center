import { describe, expect, it } from "vitest";
import {
  generateAdmissionId,
  generateLabRequestId,
  generatePrescriptionId,
  generateReceiptId,
  generateRadiologyRequestId,
  generateVisitId,
} from "@/lib/utils/generate-id";

// Pattern: <PREFIX>-<YYYYMMDD>-<4 uppercase alphanumeric chars>
const dateSuffixPattern = (prefix: string) =>
  new RegExp(`^${prefix}-\\d{8}-[A-Z0-9]{4}$`);

describe("generateVisitId", () => {
  it("matches the VIS-<date>-<suffix> format", () => {
    expect(generateVisitId()).toMatch(dateSuffixPattern("VIS"));
  });

  it("produces unique-looking ids across calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateVisitId()));
    // Suffixes are random, so collisions are extremely unlikely across 20 calls.
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("generatePrescriptionId", () => {
  it("matches the RX-<date>-<suffix> format when no count is given", () => {
    expect(generatePrescriptionId()).toMatch(dateSuffixPattern("RX"));
  });

  it("uses a zero-padded numeric format when a count is given", () => {
    expect(generatePrescriptionId(42)).toBe("RX-000042");
    expect(generatePrescriptionId(1)).toBe("RX-000001");
    expect(generatePrescriptionId(0)).toBe("RX-000000");
  });
});

describe("generateReceiptId", () => {
  it("zero-pads the count to 6 digits with a REC- prefix", () => {
    expect(generateReceiptId(42)).toBe("REC-000042");
    expect(generateReceiptId(1)).toBe("REC-000001");
    expect(generateReceiptId(123456)).toBe("REC-123456");
  });

  it("matches the expected regex", () => {
    expect(generateReceiptId(7)).toMatch(/^REC-\d{6}$/);
  });
});

describe("generateAdmissionId", () => {
  it("matches the ADM-<date>-<suffix> format", () => {
    expect(generateAdmissionId()).toMatch(dateSuffixPattern("ADM"));
  });
});

describe("generateLabRequestId", () => {
  it("matches the LAB-<date>-<suffix> format", () => {
    expect(generateLabRequestId()).toMatch(dateSuffixPattern("LAB"));
  });
});

describe("generateRadiologyRequestId", () => {
  it("matches the RAD-<date>-<suffix> format", () => {
    expect(generateRadiologyRequestId()).toMatch(dateSuffixPattern("RAD"));
  });
});
