import { describe, expect, it, vi } from "vitest";
import {
  IdGeneratorService,
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

function makeTx(opts: {
  stored?: { current: number } | null;
  casResults?: number[];
}) {
  const casResults = [...(opts.casResults ?? [1])];
  return {
    systemSetting: {
      upsert: vi.fn(async () => ({})),
      findUnique: vi.fn(async () =>
        opts.stored === null
          ? null
          : { key: "seq_patient", value: opts.stored ?? { current: 0 } }
      ),
      updateMany: vi.fn(async () => ({ count: casResults.shift() ?? 0 })),
    },
  };
}

describe("IdGeneratorService.getNextId (CAS)", () => {
  it("allocates the next sequential patient ID when CAS succeeds", async () => {
    const tx = makeTx({ stored: { current: 41 } });
    const id = await IdGeneratorService.getNextId(tx as never, "patient");
    expect(id).toBe("AMC-PT-000042");
    expect(tx.systemSetting.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          key: "seq_patient",
          value: { equals: { current: 41 } },
        },
        data: { value: { current: 42 } },
      })
    );
  });

  it("retries after a lost CAS race and returns the winning value", async () => {
    let readCount = 0;
    const tx = {
      systemSetting: {
        upsert: vi.fn(async () => ({})),
        findUnique: vi.fn(async () => {
          readCount += 1;
          // First read is stale (another writer advanced the counter).
          return {
            key: "seq_patient",
            value: { current: readCount === 1 ? 7 : 8 },
          };
        }),
        updateMany: vi
          .fn()
          // First CAS fails (stale), second succeeds.
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ count: 1 }),
      },
    };

    const id = await IdGeneratorService.getNextId(tx as never, "patient");
    expect(id).toBe("AMC-PT-000009");
    expect(tx.systemSetting.updateMany).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting CAS retries", async () => {
    const tx = makeTx({ stored: { current: 0 }, casResults: [0, 0, 0, 0, 0] });
    await expect(
      IdGeneratorService.getNextId(tx as never, "patient")
    ).rejects.toThrow(/concurrent retries/);
  });

  it("uses the configured prefixes for each sequence type", async () => {
    const cases = [
      ["staff", "AMC-ST-000001"],
      ["appointment", "AMC-APT-000001"],
      ["invoice", "AMC-INV-000001"],
    ] as const;

    for (const [type, expected] of cases) {
      const tx = makeTx({ stored: { current: 0 } });
      const id = await IdGeneratorService.getNextId(tx as never, type);
      expect(id).toBe(expected);
    }
  });
});

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
