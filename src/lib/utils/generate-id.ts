/**
 * Hospital ID generators — produce standardized, human-readable IDs
 * for all entities in the system.
 */

// Removed global YEAR constant to avoid date-staleness bugs

/**
 * Generate a zero-padded numeric suffix.
 */
function pad(num: number, size: number): string {
  return String(num).padStart(size, '0');
}

/**
 * Generate a random alphanumeric suffix.
 */
function randomSuffix(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ---------------------------------------------------------------------------
// Patients & Staff
// ---------------------------------------------------------------------------

export function generatePatientId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `PAT-${YEAR}-${pad(sequence, 6)}`; // e.g. PAT-2026-000001
}

export function generateStaffId(departmentCode: string, sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `${departmentCode}-${YEAR}-${pad(sequence, 4)}`; // e.g. DOC-2026-0005
}

// ---------------------------------------------------------------------------
// Clinical & Appointments
// ---------------------------------------------------------------------------

export function generateAppointmentId(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;
  return `APT-${dateStr}-${randomSuffix(4)}`;
}

export function generateVisitId(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;
  return `VST-${dateStr}-${randomSuffix(4)}`;
}

export function generatePrescriptionId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `RX-${YEAR}-${pad(sequence, 5)}`; // e.g. RX-2026-15002
}

// ---------------------------------------------------------------------------
// Diagnostics (Lab & Radiology)
// ---------------------------------------------------------------------------

export function generateLabRequestId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `LAB-${YEAR}-${pad(sequence, 5)}`; // e.g. LAB-2026-10025
}

export function generateRadiologyId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `RAD-${YEAR}-${pad(sequence, 5)}`; // e.g. RAD-2026-0040
}

// ---------------------------------------------------------------------------
// Admissions
// ---------------------------------------------------------------------------

export function generateAdmissionId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `ADM-${YEAR}-${pad(sequence, 4)}`; // e.g. ADM-2026-0089
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export function generateInvoiceId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `INV-${YEAR}-${pad(sequence, 5)}`; // e.g. INV-2026-50012
}

export function generateReceiptId(sequence: number): string {
  const YEAR = new Date().getFullYear();
  return `RC-${YEAR}-${pad(sequence, 4)}`; // e.g. RC-2026-9021
}
