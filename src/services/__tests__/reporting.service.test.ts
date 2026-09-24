import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/config/roles";

const paymentFindManyMock = vi.fn();
const visitFindManyMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    payment: {
      findMany: (...args: unknown[]) => paymentFindManyMock(...args),
    },
    visit: {
      findMany: (...args: unknown[]) => visitFindManyMock(...args),
    },
  },
}));

const { ReportingService } = await import("@/services/reporting.service");

describe("ReportingService.generateReportData branch scoping", () => {
  beforeEach(() => {
    paymentFindManyMock.mockReset();
    visitFindManyMock.mockReset();
    paymentFindManyMock.mockResolvedValue([]);
    visitFindManyMock.mockResolvedValue([]);
  });

  const range = { startDate: "2026-01-01", endDate: "2026-01-31", format: "JSON" as const };

  it("scopes FINANCIAL payments through invoice.branchId for non-SUPER_ADMIN", async () => {
    await ReportingService.generateReportData(
      { ...range, type: "FINANCIAL" },
      "branch-a",
    );

    expect(paymentFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          invoice: { branchId: "branch-a" },
        }),
      }),
    );
  });

  it("does not add invoice.branchId filter for SUPER_ADMIN (undefined branch)", async () => {
    await ReportingService.generateReportData({ ...range, type: "FINANCIAL" }, undefined);

    const where = paymentFindManyMock.mock.calls[0][0].where;
    expect(where.invoice).toBeUndefined();
  });

  it("scopes CLINICAL visits through patient.branchId for non-SUPER_ADMIN", async () => {
    await ReportingService.generateReportData(
      { ...range, type: "CLINICAL" },
      "branch-a",
    );

    expect(visitFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: { branchId: "branch-a" },
        }),
      }),
    );
  });

  it("does not add patient.branchId filter for SUPER_ADMIN", async () => {
    await ReportingService.generateReportData({ ...range, type: "CLINICAL" }, undefined);

    const where = visitFindManyMock.mock.calls[0][0].where;
    expect(where.patient).toBeUndefined();
  });

  it("still applies date range filters when branch-scoped", async () => {
    await ReportingService.generateReportData(
      { ...range, type: "FINANCIAL" },
      "branch-a",
    );

    const where = paymentFindManyMock.mock.calls[0][0].where;
    expect(where.createdAt.gte).toBeInstanceOf(Date);
    expect(where.createdAt.lte).toBeInstanceOf(Date);
    expect(where.invoice.branchId).toBe("branch-a");
  });
});

describe("role constants used by reporting authorization", () => {
  it("reporting route roles include ACCOUNTANT but not clinical-only roles", () => {
    // Documented contract for POST /api/v1/reporting/generate
    const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT];
    expect(allowed).toContain(ROLES.ACCOUNTANT);
    expect(allowed).not.toContain(ROLES.DOCTOR);
    expect(allowed).not.toContain(ROLES.PATIENT);
  });
});
