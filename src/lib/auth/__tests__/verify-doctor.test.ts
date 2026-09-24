import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/config/roles";
import type { SessionUser } from "@/lib/auth/session";

const staffFindUniqueMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    staff: {
      findUnique: (...args: unknown[]) => staffFindUniqueMock(...args),
    },
  },
}));

const { verifyAssignableDoctor } = await import(
  "@/lib/auth/resource-authorization"
);

function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: ROLES.RECEPTIONIST,
    branchId: "branch-a",
    isActive: true,
    ...overrides,
  };
}

function doctorRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "staff-doc-1",
    branchId: "branch-a",
    isActive: true,
    user: { role: ROLES.DOCTOR },
    ...overrides,
  };
}

describe("verifyAssignableDoctor (Phase 2C)", () => {
  beforeEach(() => {
    staffFindUniqueMock.mockReset();
  });

  it("allows an active DOCTOR in the target branch", async () => {
    staffFindUniqueMock.mockResolvedValue(doctorRow());
    const result = await verifyAssignableDoctor(
      makeUser(),
      "staff-doc-1",
      "branch-a",
    );
    expect(result).toEqual({ id: "staff-doc-1", branchId: "branch-a" });
  });

  it("rejects a missing staff record with 404", async () => {
    staffFindUniqueMock.mockResolvedValue(null);
    await expect(
      verifyAssignableDoctor(makeUser(), "missing", "branch-a"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects an inactive doctor with 404", async () => {
    staffFindUniqueMock.mockResolvedValue(doctorRow({ isActive: false }));
    await expect(
      verifyAssignableDoctor(makeUser(), "staff-doc-1", "branch-a"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects a non-doctor staff role with 400", async () => {
    staffFindUniqueMock.mockResolvedValue(
      doctorRow({ user: { role: ROLES.NURSE } }),
    );
    await expect(
      verifyAssignableDoctor(makeUser(), "staff-doc-1", "branch-a"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects a doctor from another branch with 403", async () => {
    staffFindUniqueMock.mockResolvedValue(doctorRow({ branchId: "branch-b" }));
    await expect(
      verifyAssignableDoctor(makeUser(), "staff-doc-1", "branch-a"),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("allows SUPER_ADMIN role staff as assignable doctor", async () => {
    staffFindUniqueMock.mockResolvedValue(
      doctorRow({ user: { role: ROLES.SUPER_ADMIN } }),
    );
    const result = await verifyAssignableDoctor(
      makeUser({ role: ROLES.SUPER_ADMIN, branchId: null }),
      "staff-doc-1",
      "branch-a",
    );
    expect(result.id).toBe("staff-doc-1");
  });
});
