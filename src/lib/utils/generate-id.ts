import { PrismaClient, Prisma } from "@prisma/client";

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
   * Generates the next sequential ID safely under concurrency using row-level locking.
   */
  static async getNextId(
    tx: TransactionClient,
    type: SequenceType
  ): Promise<string> {
    const config = SEQUENCE_CONFIG[type];

    // Ensure the sequence row exists before locking
    await tx.$executeRaw`
      INSERT INTO "system_settings" ("id", "key", "value", "updatedAt")
      VALUES (
        concat('seq_', ${type}, '_', gen_random_uuid()),
        ${config.key},
        jsonb_build_object('current', 0),
        now()
      )
      ON CONFLICT ("key") DO NOTHING;
    `;

    // Lock the row exclusively for update
    const rows = await tx.$queryRaw<{ value: { current: number } }[]>`
      SELECT "value"
      FROM "system_settings"
      WHERE "key" = ${config.key}
      FOR UPDATE;
    `;

    let currentVal = 0;
    if (rows.length > 0 && rows[0]?.value && typeof rows[0].value.current === "number") {
      currentVal = rows[0].value.current;
    }

    const nextVal = currentVal + 1;

    // Update the sequence with the incremented counter
    await tx.$executeRaw`
      UPDATE "system_settings"
      SET "value" = jsonb_build_object('current', ${nextVal}), "updatedAt" = now()
      WHERE "key" = ${config.key};
    `;

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
