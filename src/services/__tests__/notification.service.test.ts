import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();
const createManyMock = vi.fn();
const findManyMock = vi.fn();
const countMock = vi.fn();
const updateManyMock = vi.fn();
const staffFindManyMock = vi.fn();
const userFindManyMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    notification: {
      create: (...args: unknown[]) => createMock(...args),
      createMany: (...args: unknown[]) => createManyMock(...args),
      findMany: (...args: unknown[]) => findManyMock(...args),
      count: (...args: unknown[]) => countMock(...args),
      updateMany: (...args: unknown[]) => updateManyMock(...args),
    },
    staff: {
      findMany: (...args: unknown[]) => staffFindManyMock(...args),
    },
    user: {
      findMany: (...args: unknown[]) => userFindManyMock(...args),
    },
  },
}));

// Imported after the mock so NotificationService picks up the mocked prisma client.
const { NotificationService } = await import("@/services/notification.service");

describe("NotificationService ownership (IDOR protection)", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
    findManyMock.mockReset();
    countMock.mockReset();
  });

  it("markAsRead scopes the update to (id AND userId), never id alone", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });
    const ok = await NotificationService.markAsRead("notif-1", "user-a");

    expect(ok).toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "notif-1", userId: "user-a" },
      data: { isRead: true, readAt: expect.any(Date) },
    });
  });

  it("User A cannot mark User B's notification as read — returns false, never throws or mutates", async () => {
    // The mocked DB simulates zero matching rows because the WHERE clause
    // (id + userId) excludes a notification owned by a different user.
    updateManyMock.mockResolvedValue({ count: 0 });
    const ok = await NotificationService.markAsRead("notif-owned-by-user-a", "user-b");

    expect(ok).toBe(false);
  });

  it("getUserNotifications only ever queries the caller's own userId", async () => {
    findManyMock.mockResolvedValue([]);
    await NotificationService.getUserNotifications("user-a");

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-a" } }),
    );
  });

  it("User A cannot read User B's notifications — the query never accepts an arbitrary userId", async () => {
    findManyMock.mockResolvedValue([{ id: "n1", userId: "user-b" }]);
    // Even if the service were (incorrectly) called with the wrong id, the
    // contract is that callers must always pass session.user.id — verify
    // the WHERE clause is always keyed off the argument actually passed.
    await NotificationService.getUserNotifications("user-a");
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-a" } }),
    );
    expect(findManyMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-b" } }),
    );
  });

  it("markAllAsRead only ever updates the caller's own unread notifications", async () => {
    updateManyMock.mockResolvedValue({ count: 3 });
    await NotificationService.markAllAsRead("user-a");

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { userId: "user-a", isRead: false },
      data: { isRead: true, readAt: expect.any(Date) },
    });
  });
});

describe("NotificationService unread counts", () => {
  beforeEach(() => {
    countMock.mockReset();
  });

  it.each([0, 1, 5])("returns the server-computed unread count (%i)", async (n) => {
    countMock.mockResolvedValue(n);
    const count = await NotificationService.getUnreadCount("user-a");

    expect(count).toBe(n);
    expect(countMock).toHaveBeenCalledWith({ where: { userId: "user-a", isRead: false } });
  });
});

describe("NotificationService branch isolation", () => {
  beforeEach(() => {
    staffFindManyMock.mockReset();
    createManyMock.mockReset();
  });

  it("notifyRoleInBranch only notifies staff scoped to the given branch (Branch A event never reaches a Branch B user)", async () => {
    // The mocked query already simulates DB-level branch filtering: it
    // only returns Branch A's nurses, never Branch B's.
    staffFindManyMock.mockResolvedValue([{ userId: "nurse-a1" }, { userId: "nurse-a2" }]);
    createManyMock.mockResolvedValue({ count: 2 });

    await NotificationService.notifyRoleInBranch({
      roles: ["NURSE"],
      branchId: "branch-a",
      type: "APPOINTMENT",
      title: "New patient in queue",
      body: "A patient is waiting for triage.",
    });

    expect(staffFindManyMock).toHaveBeenCalledWith({
      where: { branchId: "branch-a", isActive: true, user: { role: { in: ["NURSE"] } } },
      select: { userId: true },
    });

    const insertedRows = createManyMock.mock.calls[0][0].data as { userId: string }[];
    expect(insertedRows.map((r) => r.userId)).toEqual(["nurse-a1", "nurse-a2"]);
    expect(insertedRows.some((r) => r.userId === "nurse-b1")).toBe(false);
  });

  it("excludes the acting user from the fan-out (never self-notifies the actor)", async () => {
    staffFindManyMock.mockResolvedValue([{ userId: "actor" }, { userId: "other" }]);
    createManyMock.mockResolvedValue({ count: 1 });

    await NotificationService.notifyRoleInBranch({
      roles: ["ADMIN"],
      branchId: "branch-a",
      type: "BILLING",
      title: "Payment received",
      body: "...",
      excludeUserId: "actor",
    });

    const insertedRows = createManyMock.mock.calls[0][0].data as { userId: string }[];
    expect(insertedRows.map((r) => r.userId)).toEqual(["other"]);
  });

  it("does nothing (no insert) when no staff match the branch/role", async () => {
    staffFindManyMock.mockResolvedValue([]);
    const result = await NotificationService.notifyRoleInBranch({
      roles: ["LAB_SCIENTIST"],
      branchId: "branch-empty",
      type: "LAB",
      title: "x",
      body: "y",
    });

    expect(result).toEqual({ count: 0 });
    expect(createManyMock).not.toHaveBeenCalled();
  });
});

describe("NotificationService SUPER_ADMIN organization-wide notifications", () => {
  beforeEach(() => {
    userFindManyMock.mockReset();
    createManyMock.mockReset();
  });

  it("notifySuperAdmins targets every SUPER_ADMIN with no branch filter", async () => {
    userFindManyMock.mockResolvedValue([{ id: "super-1" }, { id: "super-2" }]);
    createManyMock.mockResolvedValue({ count: 2 });

    await NotificationService.notifySuperAdmins({
      type: "STAFF",
      title: "New staff member created",
      body: "Jane Doe (NURSE) was added to the team.",
    });

    expect(userFindManyMock).toHaveBeenCalledWith({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    const insertedRows = createManyMock.mock.calls[0][0].data as { userId: string }[];
    expect(insertedRows.map((r) => r.userId)).toEqual(["super-1", "super-2"]);
  });

  it("excludes the acting SUPER_ADMIN from their own fan-out", async () => {
    userFindManyMock.mockResolvedValue([{ id: "super-2" }]);
    createManyMock.mockResolvedValue({ count: 1 });

    await NotificationService.notifySuperAdmins({
      type: "STAFF",
      title: "x",
      body: "y",
      excludeUserId: "super-1",
    });

    expect(userFindManyMock).toHaveBeenCalledWith({
      where: { role: "SUPER_ADMIN", id: { not: "super-1" } },
      select: { id: true },
    });
  });
});
