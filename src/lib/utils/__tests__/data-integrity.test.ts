import { describe, expect, it } from "vitest";

/**
 * Phase 5 — data-integrity / ID uniqueness contracts.
 * These are pure invariants (no DB) that must hold for sequential and
 * short-ID generators used across the HMS.
 */
import {
  generateVisitId,
  generatePrescriptionId,
  generateReceiptId,
  generateAdmissionId,
  generateLabRequestId,
  generateRadiologyRequestId,
} from "@/lib/utils/generate-id";

describe("Phase 5 — data integrity invariants", () => {
  it("sequential invoice-style receipt IDs are strictly increasing for increasing counts", () => {
    const counts = [1, 2, 10, 99, 100, 999999];
    const ids = counts.map((n) => generateReceiptId(n));
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i] > ids[i - 1]).toBe(true);
    }
  });

  it("receipt IDs are zero-padded to a fixed width so lexicographic sort matches numeric sort", () => {
    const small = generateReceiptId(7);
    const large = generateReceiptId(12345);
    expect(small).toBe("REC-000007");
    expect(large).toBe("REC-012345");
    expect(large > small).toBe(true);
  });

  it("short operational IDs embed a UTC calendar date (YYYYMMDD)", () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    for (const id of [
      generateVisitId(),
      generatePrescriptionId(),
      generateAdmissionId(),
      generateLabRequestId(),
      generateRadiologyRequestId(),
    ]) {
      expect(id).toContain(today);
    }
  });

  it("random short-ID suffixes do not collide across a large sample", () => {
    const n = 500;
    const visits = new Set(Array.from({ length: n }, () => generateVisitId()));
    // Birthday-collision probability for 4 chars base36 is non-trivial at
    // 500 samples only if entropy were tiny — require near-perfect uniqueness.
    expect(visits.size).toBeGreaterThanOrEqual(n - 2);
  });

  it("prescription count format stays within RX-\d{6} for pharmacy indexes", () => {
    expect(generatePrescriptionId(0)).toMatch(/^RX-\d{6}$/);
    expect(generatePrescriptionId(999999)).toMatch(/^RX-\d{6}$/);
    expect(() => generatePrescriptionId(-1)).not.toThrow();
  });
});
