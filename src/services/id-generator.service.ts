import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/client';

export class IdGeneratorService {
  /**
   * Safely generates a sequential ID using row-level locking on the SystemSetting table.
   * Can be passed an existing transaction context (`tx`) to ensure atomicity within a broader operation.
   */
  private static async getNextSequence(prefixKey: string, txContext?: Prisma.TransactionClient): Promise<number> {
    const execute = async (t: Prisma.TransactionClient) => {
      // 1. Lock the row for this specific key
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await t.$queryRaw<any[]>`
        SELECT value FROM system_settings 
        WHERE key = ${prefixKey} 
        FOR UPDATE
      `;

      let current = 0;
      if (result && result.length > 0 && result[0].value) {
        // value is a JSON object. We expect { "current": number }
        const val = result[0].value;
        current = typeof val.current === 'number' ? val.current : 0;
      }

      const nextVal = current + 1;

      // 2. Update or insert the new sequence value
      if (result && result.length > 0) {
        await t.systemSetting.update({
          where: { key: prefixKey },
          data: { value: { current: nextVal } }
        });
      } else {
        await t.systemSetting.create({
          data: {
            key: prefixKey,
            value: { current: nextVal }
          }
        });
      }

      return nextVal;
    };

    if (txContext) {
      return execute(txContext);
    } else {
      return prisma.$transaction(execute);
    }
  }

  private static pad(num: number, size: number): string {
    return String(num).padStart(size, '0');
  }

  /**
   * Generates a patient ID in the format AMC-PT-XXXXXX
   */
  static async generatePatientId(tx?: Prisma.TransactionClient): Promise<string> {
    const seq = await this.getNextSequence('seq_patient', tx);
    return `AMC-PT-${this.pad(seq, 6)}`;
  }

  /**
   * Generates a staff ID in the format AMC-ST-XXXXXX
   */
  static async generateStaffId(tx?: Prisma.TransactionClient): Promise<string> {
    const seq = await this.getNextSequence('seq_staff', tx);
    return `AMC-ST-${this.pad(seq, 6)}`;
  }

  /**
   * Generates an appointment ID in the format AMC-APT-XXXXXX
   */
  static async generateAppointmentId(tx?: Prisma.TransactionClient): Promise<string> {
    const seq = await this.getNextSequence('seq_appointment', tx);
    return `AMC-APT-${this.pad(seq, 6)}`;
  }
}
