import { prisma } from '@/lib/db/client';
import { logger } from '@/lib/utils/logger';

export interface AuditLogParams {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  branchId?: string;
}

export class AuditService {
  /**
   * Log an action to the database.
   * In a Next.js App Router environment, if this is called without await,
   * it might be aborted. Use `after()` or `waitUntil()` from Next.js, or just await it.
   */
  static async log(params: AuditLogParams) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          userRole: params.userRole,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId,
          details: params.details ?? undefined,
          ip: params.ip,
          userAgent: params.userAgent,
          branchId: params.branchId,
        },
      });
    } catch (error) {
      // We don't throw here because we don't want audit log failures
      // to break the main application workflows.
      logger.error('Failed to write audit log', { error, params });
    }
  }
}
