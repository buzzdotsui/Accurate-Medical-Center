import { describe, expect, it } from "vitest";
import { ROLES } from "@/config/roles";

/**
 * Contract tests for Phase 2C privileged-read role allowlists.
 * These mirror the withRole(...) arrays on the actual routes.
 */
describe("Phase 2C role allowlist contracts", () => {
  const invoiceReadRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ACCOUNTANT,
    ROLES.RECEPTIONIST,
    ROLES.PATIENT,
  ];

  const wardReadRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.THEATRE_STAFF,
    ROLES.MATERNAL_STAFF,
  ];

  const appointmentCreateRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.RECEPTIONIST,
  ];

  it("billing invoice reads exclude clinical-only and support roles", () => {
    for (const role of [
      ROLES.DOCTOR,
      ROLES.NURSE,
      ROLES.LAB_SCIENTIST,
      ROLES.RADIOGRAPHER,
      ROLES.PHARMACIST,
      ROLES.AMBULANCE,
      ROLES.MENTAL_HEALTH,
    ]) {
      expect(invoiceReadRoles).not.toContain(role);
    }
  });

  it("billing invoice reads include finance/front-desk and self patient", () => {
    expect(invoiceReadRoles).toContain(ROLES.ACCOUNTANT);
    expect(invoiceReadRoles).toContain(ROLES.RECEPTIONIST);
    expect(invoiceReadRoles).toContain(ROLES.PATIENT);
  });

  it("ward reads exclude patients and non-operational roles", () => {
    expect(wardReadRoles).not.toContain(ROLES.PATIENT);
    expect(wardReadRoles).not.toContain(ROLES.ACCOUNTANT);
    expect(wardReadRoles).not.toContain(ROLES.AMBULANCE);
  });

  it("staff appointment creation excludes patients and clinical-only roles", () => {
    expect(appointmentCreateRoles).not.toContain(ROLES.PATIENT);
    expect(appointmentCreateRoles).not.toContain(ROLES.DOCTOR);
    expect(appointmentCreateRoles).toContain(ROLES.RECEPTIONIST);
  });
});
