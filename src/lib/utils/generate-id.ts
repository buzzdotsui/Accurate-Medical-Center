import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type SequenceType = "patient" | "staff" | "appointment";

const SEQUENCE_CONFIG: Record<
  SequenceType,
  { key: string; prefix: string; digits: number }
> = {
  patient: {
    key: "seq_patient",
    prefix: "AMC-PT-",
    digits: 6,
  },
  staff: {
    key: "seq_staff",
    prefix: "AMC-ST-",
    digits: 6,
  },
  appointment: {
    key: "seq_appointment",
    prefix: "AMC-APT-",
    digits: 6,
  },
};

export class IdGeneratorService {
  /**
   * Generates the next sequential ID safely under concurrency.
   *
   * Implementation uses Prisma ORM methods (upsert + update) rather than
   * $executeRaw / $queryRaw to avoid PostgreSQL error 42P18 ("could not
   * determine data type of parameter $1") which occurs when Prisma's
   * tagged-template parameterisation passes untyped values into raw SQL
   * expressions such as concat() or jsonb_build_object().
   *
   * Atomicity guarantee:
   *   - Called inside a $transaction from the service layer.
   *   - upsert initialises the row if absent (current = 0).
   *   - update reads the stored value, increments locally, and writes back.
   *   - The surrounding transaction serialises concurrent callers at the
   *     database level.
   */
  static async getNextId(
    tx: TransactionClient,
    type: SequenceType
  ): Promise<string> {
    const config = SEQUENCE_CONFIG[type];

    // 1. Ensure the sequence row exists.
    //    If absent, create it with current = 0.
    //    If present, leave it unchanged.
    await tx.systemSetting.upsert({
      where: { key: config.key },
      create: {
        key: config.key,
        value: { current: 0 },
        description: `Auto-increment sequence for ${type} IDs`,
      },
      update: {}, // no-op — row already exists
    });

    // 2. Fetch the current counter value.
    const setting = await tx.systemSetting.findUniqueOrThrow({
      where: { key: config.key },
    });

    // 3. Parse the stored counter.  The JSON value shape is { current: number }.
    const valueObj = setting.value as { current?: number };
    const currentVal =
      typeof valueObj?.current === "number" ? valueObj.current : 0;
    const nextVal = currentVal + 1;

    // 4. Write the incremented counter back.
    await tx.systemSetting.update({
      where: { key: config.key },
      data: { value: { current: nextVal } },
    });

    // 5. Format and return the human-readable ID.
    const paddedNumber = String(nextVal).padStart(config.digits, "0");
    return `${config.prefix}${paddedNumber}`;
  }

  static async generatePatientId(tx: TransactionClient): Promise<string> {
    return this.getNextId(tx, "patient");
  }

  static async generateStaffId(tx: TransactionClient): Promise<string> {
    return this.getNextId(tx, "staff");
  }

  static async generateAppointmentId(tx: TransactionClient): Promise<string> {
    return this.getNextId(tx, "appointment");
  }
}

// ---------------------------------------------------------------------------
// Legacy sync helpers — used by clinical, consultation, payment, and
// prescription services for non-sequential short IDs (visits, receipts, etc.)
// These are NOT sequential and may not be globally unique over time; they are
// only used for internal reference codes where exact uniqueness is enforced by
// the database unique constraint + retry logic in the caller.
// ---------------------------------------------------------------------------

/** Generates a short random Visit ID, e.g. VIS-20260824-A3F9 */
export function generateVisitId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VIS-${date}-${suffix}`;
}

/** Generates a short Prescription ID. Optionally accepts a count for a numeric prefix. */
export function generatePrescriptionId(count?: number): string {
  if (count !== undefined) {
    return `RX-${String(count).padStart(6, "0")}`;
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RX-${date}-${suffix}`;
}

/** Generates a receipt ID based on a sequential count, e.g. REC-000042 */
export function generateReceiptId(count: number): string {
  return `REC-${String(count).padStart(6, "0")}`;
}

/** Generates a short Admission ID, e.g. ADM-20260830-A3F9 */
export function generateAdmissionId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ADM-${date}-${suffix}`;
}

/** Generates a short Lab Request ID, e.g. LAB-20260830-A3F9 */
export function generateLabRequestId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LAB-${date}-${suffix}`;
}

/** Generates a short Radiology Request ID, e.g. RAD-20260830-A3F9 */
export function generateRadiologyRequestId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RAD-${date}-${suffix}`;
}
