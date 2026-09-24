import { describe, expect, it } from "vitest";
import { ROLES, STAFF_ROLES } from "@/config/roles";

/**
 * Contract tests for document write authorization (P0-6).
 * POST/DELETE document routes use withRole(STAFF_ROLES) which must exclude PATIENT.
 */
describe("document write role gate", () => {
  it("STAFF_ROLES does not include PATIENT", () => {
    expect(STAFF_ROLES).not.toContain(ROLES.PATIENT);
  });

  it("STAFF_ROLES includes roles expected to upload documents", () => {
    for (const role of [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DOCTOR,
      ROLES.NURSE,
      ROLES.RECEPTIONIST,
    ]) {
      expect(STAFF_ROLES).toContain(role);
    }
  });
});
