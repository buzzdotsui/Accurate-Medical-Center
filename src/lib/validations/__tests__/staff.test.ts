import { describe, expect, it } from "vitest";
import { ROLES } from "@/config/roles";
import { CreateStaffSchema, canAssignRole } from "@/lib/validations/staff";

describe("canAssignRole", () => {
  it("allows SUPER_ADMIN to create SUPER_ADMIN", () => {
    expect(canAssignRole(ROLES.SUPER_ADMIN, ROLES.SUPER_ADMIN)).toBe(true);
  });

  it("rejects ADMIN creating SUPER_ADMIN", () => {
    expect(canAssignRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)).toBe(false);
  });

  it("rejects any non-SUPER_ADMIN creating SUPER_ADMIN", () => {
    for (const role of [
      ROLES.DOCTOR,
      ROLES.NURSE,
      ROLES.RECEPTIONIST,
      ROLES.ACCOUNTANT,
      ROLES.PATIENT,
    ]) {
      expect(canAssignRole(role, ROLES.SUPER_ADMIN)).toBe(false);
    }
  });

  it("allows ADMIN to create ordinary staff roles", () => {
    expect(canAssignRole(ROLES.ADMIN, ROLES.DOCTOR)).toBe(true);
    expect(canAssignRole(ROLES.ADMIN, ROLES.NURSE)).toBe(true);
    expect(canAssignRole(ROLES.ADMIN, ROLES.ACCOUNTANT)).toBe(true);
  });

  it("allows SUPER_ADMIN to create ordinary staff roles", () => {
    expect(canAssignRole(ROLES.SUPER_ADMIN, ROLES.DOCTOR)).toBe(true);
  });
});

describe("CreateStaffSchema", () => {
  it("still accepts SUPER_ADMIN as a role value (server gates assignment)", () => {
    const result = CreateStaffSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "password123",
      role: ROLES.SUPER_ADMIN,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ordinary staff roles", () => {
    const result = CreateStaffSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "password123",
      role: ROLES.DOCTOR,
    });
    expect(result.success).toBe(true);
  });
});
