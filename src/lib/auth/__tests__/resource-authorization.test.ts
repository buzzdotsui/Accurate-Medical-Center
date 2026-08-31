import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/api/errors";
import { ROLES } from "@/config/roles";
import type { SessionUser } from "@/lib/auth/session";

const findFirstMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    branch: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
    },
  },
}));

// Imported after the mock so `resolveBranchId` picks up the mocked prisma client.
const { resolveBranchId } = await import("@/lib/auth/resource-authorization");

function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: ROLES.ADMIN,
    branchId: "branch-1",
    isActive: true,
    ...overrides,
  };
}

describe("resolveBranchId", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
  });

  it("falls back to the first active branch for a SUPER_ADMIN with no branchId", async () => {
    findFirstMock.mockResolvedValue({ id: "hq-branch" });

    const user = makeUser({ role: ROLES.SUPER_ADMIN, branchId: null });
    const branchId = await resolveBranchId(user, undefined);

    expect(branchId).toBe("hq-branch");
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
  });

  it("throws a 403 when a non-SUPER_ADMIN requests a different branch than their own", async () => {
    const user = makeUser({ role: ROLES.RECEPTIONIST, branchId: "branch-1" });

    await expect(resolveBranchId(user, "branch-2")).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(resolveBranchId(user, "branch-2")).rejects.toBeInstanceOf(
      AppError,
    );
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("throws a 403 when a non-SUPER_ADMIN has no branchId at all", async () => {
    const user = makeUser({ role: ROLES.DOCTOR, branchId: null });

    await expect(resolveBranchId(user, undefined)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows a non-SUPER_ADMIN to operate on their own branch", async () => {
    const user = makeUser({ role: ROLES.NURSE, branchId: "branch-1" });

    const branchId = await resolveBranchId(user, "branch-1");
    expect(branchId).toBe("branch-1");
  });
});
