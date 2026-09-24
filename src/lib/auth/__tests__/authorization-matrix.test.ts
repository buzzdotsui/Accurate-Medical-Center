import { describe, expect, it, vi, beforeEach } from "vitest";
import { ROLES } from "@/config/roles";
import type { SessionUser } from "@/lib/auth/session";

const patientFindUniqueMock = vi.fn();
const patientFindFirstMock = vi.fn();
const staffFindUniqueMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    patient: {
      findUnique: (...args: unknown[]) => patientFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => patientFindFirstMock(...args),
    },
    staff: {
      findUnique: (...args: unknown[]) => staffFindUniqueMock(...args),
    },
  },
}));

const { verifyPatientAccess, verifyStaffAccess } = await import(
  "@/lib/auth/resource-authorization"
);

function user(role: string, branchId: string | null = "branch-a"): SessionUser {
  return {
    id: "u-1",
    email: "x@example.com",
    name: "X",
    role,
    branchId,
    isActive: true,
  };
}

const patientRow = { id: "p-1", branchId: "branch-a", userId: "pat-user-1" };
const staffRow = { id: "s-1", branchId: "branch-a", isActive: true };

describe("Authorization matrix — verifyPatientAccess", () => {
  beforeEach(() => {
    patientFindUniqueMock.mockReset();
    patientFindFirstMock.mockReset();
  });

  it("SUPER_ADMIN can read any patient", async () => {
    patientFindUniqueMock.mockResolvedValue(patientRow);
    await expect(
      verifyPatientAccess(user(ROLES.SUPER_ADMIN, null), "p-1", "READ"),
    ).resolves.toEqual({ id: "p-1", branchId: "branch-a" });
  });

  it("PATIENT can read only their linked record", async () => {
    patientFindFirstMock.mockResolvedValue(patientRow);
    await expect(
      verifyPatientAccess(user(ROLES.PATIENT, null), "p-1", "READ"),
    ).resolves.toEqual({ id: "p-1", branchId: "branch-a" });
    expect(patientFindFirstMock).toHaveBeenCalledWith({
      where: { id: "p-1", user: { id: "u-1" } },
    });
  });

  it("PATIENT is denied a different patient's record with 403", async () => {
    patientFindFirstMock.mockResolvedValue(null);
    await expect(
      verifyPatientAccess(user(ROLES.PATIENT, null), "p-other", "READ"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("ADMIN in same branch is allowed", async () => {
    patientFindUniqueMock.mockResolvedValue(patientRow);
    await expect(
      verifyPatientAccess(user(ROLES.ADMIN, "branch-a"), "p-1", "UPDATE"),
    ).resolves.toEqual({ id: "p-1", branchId: "branch-a" });
  });

  it("ADMIN in another branch is denied with 403", async () => {
    patientFindUniqueMock.mockResolvedValue(patientRow);
    await expect(
      verifyPatientAccess(user(ROLES.ADMIN, "branch-b"), "p-1", "READ"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("staff without a branch is denied with 403", async () => {
    await expect(
      verifyPatientAccess(user(ROLES.DOCTOR, null), "p-1", "READ"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("missing patient yields 404", async () => {
    patientFindUniqueMock.mockResolvedValue(null);
    await expect(
      verifyPatientAccess(user(ROLES.SUPER_ADMIN, null), "missing", "READ"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("Authorization matrix — verifyStaffAccess", () => {
  beforeEach(() => {
    staffFindUniqueMock.mockReset();
  });

  it("SUPER_ADMIN can update any staff", async () => {
    staffFindUniqueMock.mockResolvedValue(staffRow);
    await expect(
      verifyStaffAccess(user(ROLES.SUPER_ADMIN, null), "s-1", "UPDATE"),
    ).resolves.toMatchObject({ id: "s-1", branchId: "branch-a" });
  });

  it("branch-scoped ADMIN can update staff in their branch", async () => {
    staffFindUniqueMock.mockResolvedValue(staffRow);
    await expect(
      verifyStaffAccess(user(ROLES.ADMIN, "branch-a"), "s-1", "UPDATE"),
    ).resolves.toMatchObject({ id: "s-1", branchId: "branch-a" });
  });

  it("ADMIN from another branch is denied with 403", async () => {
    staffFindUniqueMock.mockResolvedValue(staffRow);
    await expect(
      verifyStaffAccess(user(ROLES.ADMIN, "branch-b"), "s-1", "UPDATE"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("staff user without a branch is denied with 403", async () => {
    await expect(
      verifyStaffAccess(user(ROLES.RECEPTIONIST, null), "s-1", "UPDATE"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // Role allowlisting (ADMIN/SUPER_ADMIN only) is enforced by withRole on the
  // route before verifyStaffAccess runs — this helper only owns branch isolation.
  it("missing staff yields 404", async () => {
    staffFindUniqueMock.mockResolvedValue(null);
    await expect(
      verifyStaffAccess(user(ROLES.SUPER_ADMIN, null), "missing", "READ"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
