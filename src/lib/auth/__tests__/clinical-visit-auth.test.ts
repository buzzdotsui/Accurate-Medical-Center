import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/config/roles";
import type { SessionUser } from "@/lib/auth/session";

const patientFindUniqueMock = vi.fn();
const appointmentFindUniqueMock = vi.fn();
const appointmentFindFirstMock = vi.fn();
const patientFindFirstMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    patient: {
      findUnique: (...args: unknown[]) => patientFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => patientFindFirstMock(...args),
    },
    appointment: {
      findUnique: (...args: unknown[]) => appointmentFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => appointmentFindFirstMock(...args),
    },
  },
}));

const { verifyPatientAccess, verifyAppointmentAccess } = await import(
  "@/lib/auth/resource-authorization"
);

function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: ROLES.NURSE,
    branchId: "branch-a",
    isActive: true,
    ...overrides,
  };
}

describe("verifyPatientAccess (clinical visit P0-4)", () => {
  beforeEach(() => {
    patientFindUniqueMock.mockReset();
    patientFindFirstMock.mockReset();
  });

  it("allows same-branch staff", async () => {
    patientFindUniqueMock.mockResolvedValue({ id: "p1", branchId: "branch-a" });
    const result = await verifyPatientAccess(makeUser(), "p1", "UPDATE");
    expect(result.branchId).toBe("branch-a");
  });

  it("rejects cross-branch staff", async () => {
    patientFindUniqueMock.mockResolvedValue({ id: "p1", branchId: "branch-b" });
    await expect(verifyPatientAccess(makeUser(), "p1", "UPDATE")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows SUPER_ADMIN any branch", async () => {
    patientFindUniqueMock.mockResolvedValue({ id: "p1", branchId: "branch-z" });
    const result = await verifyPatientAccess(
      makeUser({ role: ROLES.SUPER_ADMIN, branchId: null }),
      "p1",
      "UPDATE",
    );
    expect(result.branchId).toBe("branch-z");
  });

  it("returns 404 for missing patient", async () => {
    patientFindUniqueMock.mockResolvedValue(null);
    await expect(verifyPatientAccess(makeUser(), "missing", "UPDATE")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("verifyAppointmentAccess (clinical visit P0-4)", () => {
  beforeEach(() => {
    appointmentFindUniqueMock.mockReset();
    appointmentFindFirstMock.mockReset();
  });

  it("allows same-branch appointment", async () => {
    appointmentFindUniqueMock.mockResolvedValue({
      id: "a1",
      branchId: "branch-a",
      patientId: "p1",
      doctorId: null,
    });
    const result = await verifyAppointmentAccess(makeUser(), "a1", "UPDATE");
    expect(result.patientId).toBe("p1");
  });

  it("rejects cross-branch appointment", async () => {
    appointmentFindUniqueMock.mockResolvedValue({
      id: "a1",
      branchId: "branch-b",
      patientId: "p1",
      doctorId: null,
    });
    await expect(verifyAppointmentAccess(makeUser(), "a1", "UPDATE")).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
