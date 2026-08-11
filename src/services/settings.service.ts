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
    settings.forEach((s: any) => { config[s.key] = String(s.value); });
    return config;
  }

  /**
   * Update multiple settings atomically
   */
  static async updateSettings(data: UpdateSettingsInput, executorId: string) {
    return await prisma.$transaction(async (tx) => {
      const keys = Object.keys(data) as Array<keyof UpdateSettingsInput>;
      
      for (const key of keys) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value: data[key] as any },
          create: { key, value: data[key] as any }
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
   * Fetch paginated audit logs
   */
  static async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count()
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
