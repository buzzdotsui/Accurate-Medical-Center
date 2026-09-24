import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const patientFindUniqueMock = vi.fn();
const patientFindFirstMock = vi.fn();
const branchFindFirstMock = vi.fn();
const patientServiceCreateMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    patient: {
      findUnique: (...args: unknown[]) => patientFindUniqueMock(...args),
      findFirst: (...args: unknown[]) => patientFindFirstMock(...args),
    },
    branch: {
      findFirst: (...args: unknown[]) => branchFindFirstMock(...args),
    },
  },
}));

vi.mock("@/lib/auth/config", () => ({
  auth: {
    api: {
      getSession: vi.fn(async ({ headers }: { headers: Headers }) => {
        const role = headers.get("x-test-role") ?? "PATIENT";
        const id = headers.get("x-test-user-id") ?? "user-pat-1";
        if (headers.get("x-test-no-session") === "1") return null;
        return { user: { id, email: "pat@example.com", role } };
      }),
    },
  },
}));

vi.mock("@/services/patient.service", () => ({
  PatientService: {
    createPatient: (...args: unknown[]) => patientServiceCreateMock(...args),
  },
}));

const { POST } = await import("@/app/api/v1/patients/self-register/route");

function req(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/v1/patients/self-register", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const routeCtx = { params: Promise.resolve({}) };

describe("Phase 3 — patient self-register linkage", () => {
  beforeEach(() => {
    patientFindUniqueMock.mockReset();
    patientFindFirstMock.mockReset();
    branchFindFirstMock.mockReset();
    patientServiceCreateMock.mockReset();
  });

  it("rejects unauthenticated callers with 401", async () => {
    const res = await POST(
      req({ firstName: "A", lastName: "B" }, { "x-test-no-session": "1" }),
      routeCtx,
    );
    expect(res.status).toBe(401);
  });

  it("rejects non-PATIENT sessions with 403", async () => {
    const res = await POST(
      req({ firstName: "A", lastName: "B" }, { "x-test-role": "DOCTOR" }),
      routeCtx,
    );
    expect(res.status).toBe(403);
    expect(patientServiceCreateMock).not.toHaveBeenCalled();
  });

  it("requires first and last name", async () => {
    const res = await POST(req({ firstName: "", lastName: "" }), routeCtx);
    expect(res.status).toBe(400);
  });

  it("links the created Patient to session.user.id and audits the source", async () => {
    patientFindUniqueMock.mockResolvedValue(null);
    branchFindFirstMock.mockResolvedValue({ id: "branch-1" });
    patientServiceCreateMock.mockResolvedValue({ id: "p-new", patientId: "AMC-PT-000001" });

    const res = await POST(
      req(
        { firstName: "Ada", lastName: "Lovelace" },
        { "x-test-user-id": "user-link-9" },
      ),
      routeCtx,
    );

    expect(res.status).toBe(201);
    expect(patientServiceCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Ada",
        lastName: "Lovelace",
        userId: "user-link-9",
        email: "pat@example.com",
        branchId: "branch-1",
        auditContext: expect.objectContaining({
          userId: "user-link-9",
          userRole: "PATIENT",
          source: "PUBLIC_SELF_REGISTER",
        }),
      }),
    );
  });

  it("returns existing profile (200) without creating a duplicate when userId already linked", async () => {
    patientFindUniqueMock.mockResolvedValue({
      id: "p-existing",
      userId: "user-link-9",
    });

    const res = await POST(
      req(
        { firstName: "Ada", lastName: "Lovelace" },
        { "x-test-user-id": "user-link-9" },
      ),
      routeCtx,
    );

    expect(res.status).toBe(200);
    expect(patientServiceCreateMock).not.toHaveBeenCalled();
  });

  it("fails closed when no active branch is configured", async () => {
    patientFindUniqueMock.mockResolvedValue(null);
    branchFindFirstMock.mockResolvedValue(null);

    const res = await POST(req({ firstName: "A", lastName: "B" }), routeCtx);
    expect(res.status).toBe(500);
    expect(patientServiceCreateMock).not.toHaveBeenCalled();
  });
});
