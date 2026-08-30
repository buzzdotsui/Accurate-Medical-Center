import { prisma } from '@/lib/db/client';
import { UpdateSettingsInput } from '@/lib/validations/settings';
import { AuditService } from './audit.service';

export class SettingsService {
  /**
   * Fetch all hospital settings as a key-value object
   */
  static async getSettings() {
    const settings = await prisma.systemSetting.findMany();
    const config: Record<string, string> = {};
    settings.forEach((s) => { config[s.key] = String(s.value); });
    return config;
  }

  /**
   * Update multiple settings atomically
   */
  static async updateSettings(data: UpdateSettingsInput, executorId: string) {
    return await prisma.$transaction(async (tx) => {
      const keys = Object.keys(data) as Array<keyof UpdateSettingsInput>;
      
      for (const key of keys) {
        const val = String(data[key] ?? "");
        await tx.systemSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val }
        });
      }

      await AuditService.log({
        userId: executorId,
        userRole: 'ADMIN',
        action: 'UPDATE_SETTINGS',
        resource: 'SYSTEM',
        details: data
      });

      return { success: true };
    });
  }

  /**
   * Fetch paginated audit logs.
   * Non-SUPER_ADMIN callers must pass their branchId so results are scoped
   * to their own branch, consistent with every other list endpoint.
   */
  static async getAuditLogs(page: number = 1, limit: number = 50, branchId?: string) {
    const skip = (page - 1) * limit;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = branchId ? { branchId } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
