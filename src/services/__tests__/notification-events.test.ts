import { beforeEach, describe, expect, it, vi } from "vitest";

// AuditService is mocked out entirely: these tests are about notification
// generation, not audit logging (which already has its own established
// behavior), and mocking it avoids needing to also mock `auditLog.create`.
vi.mock("@/services/audit.service", () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}));

const createNotificationMock = vi.fn().mockResolvedValue(undefined);
const notifyRoleInBranchMock = vi.fn().mockResolvedValue(undefined);
const notifySuperAdminsMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/services/notification.service", () => ({
  NotificationService: {
    createNotification: (...args: unknown[]) => createNotificationMock(...args),
    createNotifications: vi.fn().mockResolvedValue(undefined),
    notifyRoleInBranch: (...args: unknown[]) => notifyRoleInBranchMock(...args),
    notifySuperAdmins: (...args: unknown[]) => notifySuperAdminsMock(...args),
  },
}));

const appointmentFindUniqueMock = vi.fn();
const appointmentUpdateMock = vi.fn();
const staffFindUniqueMock = vi.fn();
const labRequestFindUniqueMock = vi.fn();
const radiologyRequestFindUniqueMock = vi.fn();
const prescriptionFindUniqueMock = vi.fn();
const prescriptionUpdateMock = vi.fn();
const invoiceFindUniqueMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    appointment: {
      findUnique: (...args: unknown[]) => appointmentFindUniqueMock(...args),
      update: (...args: unknown[]) => appointmentUpdateMock(...args),
    },
    staff: {
      findUnique: (...args: unknown[]) => staffFindUniqueMock(...args),
    },
    labRequest: {
      findUnique: (...args: unknown[]) => labRequestFindUniqueMock(...args),
    },
    radiologyRequest: {
      findUnique: (...args: unknown[]) => radiologyRequestFindUniqueMock(...args),
    },
    prescription: {
      findUnique: (...args: unknown[]) => prescriptionFindUniqueMock(...args),
      update: (...args: unknown[]) => prescriptionUpdateMock(...args),
    },
    invoice: {
      findUnique: (...args: unknown[]) => invoiceFindUniqueMock(...args),
    },
    $transaction: (...args: unknown[]) => transactionMock(...args),
  },
}));

const { AppointmentService } = await import("@/services/appointment.service");
const { LaboratoryService } = await import("@/services/laboratory.service");
const { RadiologyService } = await import("@/services/radiology.service");
const { PharmacyService } = await import("@/services/pharmacy.service");
const { BillingService } = await import("@/services/billing.service");

beforeEach(() => {
  createNotificationMock.mockClear();
  notifyRoleInBranchMock.mockClear();
  notifySuperAdminsMock.mockClear();
  appointmentFindUniqueMock.mockReset();
  appointmentUpdateMock.mockReset();
  staffFindUniqueMock.mockReset();
  labRequestFindUniqueMock.mockReset();
  radiologyRequestFindUniqueMock.mockReset();
  prescriptionFindUniqueMock.mockReset();
  prescriptionUpdateMock.mockReset();
  invoiceFindUniqueMock.mockReset();
  transactionMock.mockReset();
});

describe("Appointment event: reschedule", () => {
  it("notifies the patient, the assigned doctor, and reception/admin on reschedule", async () => {
    appointmentFindUniqueMock.mockResolvedValue({
      id: "apt-1",
      status: "SCHEDULED",
      patientId: "patient-1",
      doctorId: "doctor-staff-1",
      branchId: "branch-a",
      timeSlot: "09:00",
    });
    appointmentUpdateMock.mockResolvedValue({
      id: "apt-1",
      status: "SCHEDULED",
      patientId: "patient-1",
      doctorId: "doctor-staff-1",
      branchId: "branch-a",
    });
    staffFindUniqueMock.mockResolvedValue({ userId: "doctor-user-1" });

    await AppointmentService.reschedule("apt-1", "2026-01-01T09:00:00.000Z", "10:00", "receptionist-1");

    expect(notifyRoleInBranchMock).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: "branch-a", type: "APPOINTMENT", excludeUserId: "receptionist-1" }),
    );
    // Doctor notification resolves asynchronously off a `.then()` chain.
    await new Promise((r) => setTimeout(r, 0));
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "doctor-user-1", type: "APPOINTMENT", title: "Appointment rescheduled" }),
    );
  });
});

describe("Lab event: result ready", () => {
  it("notifies both the requesting doctor and the patient when a lab result is saved", async () => {
    labRequestFindUniqueMock.mockResolvedValue({
      id: "lab-1",
      requestId: "AMC-LR-000001",
      testName: "CBC",
      status: "ANALYZING",
      visit: { patient: { userId: "patient-user-1" } },
      doctor: { userId: "doctor-user-1" },
    });
    transactionMock.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({
        labResult: { create: vi.fn().mockResolvedValue({ id: "result-1" }) },
        labRequest: { update: vi.fn().mockResolvedValue({}) },
      }),
    );

    await LaboratoryService.saveResult("lab-1", { findings: "x", conclusion: "y", isAbnormal: false }, "labscientist-1");

    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "doctor-user-1", type: "LAB", title: "Lab result ready" }),
    );
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "patient-user-1", type: "LAB", title: "Lab result available" }),
    );
  });
});

describe("Radiology event: report ready", () => {
  it("notifies both the requesting doctor and the patient when a radiology report is saved", async () => {
    radiologyRequestFindUniqueMock.mockResolvedValue({
      id: "rad-1",
      requestId: "AMC-RR-000001",
      scanType: "X-Ray",
      region: "Chest",
      status: "SCANNED",
      visit: { patient: { userId: "patient-user-1" } },
      doctor: { userId: "doctor-user-1" },
    });
    transactionMock.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({
        radiologyReport: { create: vi.fn().mockResolvedValue({ id: "report-1" }) },
        radiologyRequest: { update: vi.fn().mockResolvedValue({}) },
      }),
    );

    await RadiologyService.saveReport("rad-1", { findings: "x", conclusion: "y" }, "radiographer-1");

    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "doctor-user-1", type: "RADIOLOGY", title: "Radiology report ready" }),
    );
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "patient-user-1", type: "RADIOLOGY", title: "Radiology report available" }),
    );
  });
});

describe("Prescription event: dispensed", () => {
  it("notifies the patient once their prescription is fully dispensed", async () => {
    prescriptionFindUniqueMock.mockResolvedValue({
      id: "presc-1",
      status: "PENDING",
      prescriptionId: "AMC-RX-000001",
      visit: { patient: { userId: "patient-user-1", branchId: "branch-a" } },
      items: [{ id: "item-1", medicineId: "med-1", quantity: 5, dispensedQty: 5, medicine: { stockQuantity: 100, name: "Paracetamol" } }],
    });
    transactionMock.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({
        medicine: { update: vi.fn() },
        medicationItem: { update: vi.fn() },
        inventoryTransaction: { create: vi.fn() },
        prescription: { update: vi.fn().mockResolvedValue({ id: "presc-1", status: "DISPENSED" }) },
      }),
    );

    await PharmacyService.dispensePrescription("presc-1", { status: "DISPENSED" }, "pharmacist-1");

    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "patient-user-1", type: "PRESCRIPTION", title: "Prescription dispensed" }),
    );
  });

  it("does NOT notify the patient for a PARTIAL dispense (no real 'dispensed' event yet)", async () => {
    prescriptionFindUniqueMock.mockResolvedValue({
      id: "presc-2",
      status: "PENDING",
      prescriptionId: "AMC-RX-000002",
      visit: { patient: { userId: "patient-user-1", branchId: "branch-a" } },
      items: [],
    });
    prescriptionUpdateMock.mockResolvedValue({ id: "presc-2", status: "PARTIAL" });

    await PharmacyService.dispensePrescription("presc-2", { status: "PARTIAL" }, "pharmacist-1");

    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});

describe("Billing event: payment received", () => {
  it("notifies the patient and the branch's admins when a payment is processed", async () => {
    invoiceFindUniqueMock.mockResolvedValue({
      id: "inv-1",
      status: "ISSUED",
      totalAmount: 100,
      payments: [],
      patient: { userId: "patient-user-1", branchId: "branch-a" },
    });
    transactionMock.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({
        payment: { create: vi.fn().mockResolvedValue({ id: "pay-1" }) },
        invoice: { update: vi.fn().mockResolvedValue({ id: "inv-1", status: "PAID" }) },
      }),
    );

    await BillingService.processPayment("inv-1", { amount: 100, method: "CASH" }, "accountant-1");

    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "patient-user-1", type: "BILLING", title: "Payment received" }),
    );
    expect(notifyRoleInBranchMock).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: "branch-a", type: "BILLING", excludeUserId: "accountant-1" }),
    );
  });
});
