import { prisma } from '@/lib/db/client';
import { logger } from '@/lib/utils/logger';

export type AuditAction = 
  // PATIENT DOMAIN
  | 'PATIENT_REGISTERED' | 'PATIENT_UPDATED' | 'PATIENT_ACTIVATED' | 'PATIENT_DEACTIVATED'
  // STAFF DOMAIN
  | 'STAFF_CREATED' | 'STAFF_UPDATED' | 'STAFF_ACTIVATED' | 'STAFF_DEACTIVATED'
  // APPOINTMENT DOMAIN
  | 'APPOINTMENT_CREATED' | 'APPOINTMENT_UPDATED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_COMPLETED'
  // OTHER EXISTING ACTIONS
  | 'RECORD_VITALS' | 'SAVE_RADIOLOGY_REPORT' | 'CREATE_PRESCRIPTION' | 'DISPENSE_PRESCRIPTION' 
  | 'SAVE_LAB_RESULT' | 'ADMIT_PATIENT' | 'ADJUST_STOCK' | 'ASSIGN_SHIFT' 
  | 'CREATE_CONSULTATION' | 'START_VISIT' | 'ADD_DIAGNOSIS' | 'PROCESS_PAYMENT' | 'UPDATE_SETTINGS'
  // STAGE 13 ADDITIONS
  | 'DISCHARGE_PATIENT' | 'CREATE_LAB_REQUEST' | 'CREATE_RADIOLOGY_REQUEST'
  | 'DOCUMENT_UPLOADED' | 'DOCUMENT_DELETED' | 'NOTIFICATION_READ'
  // STAGE 17 ADDITIONS
  | 'INVOICE_CREATED';

export interface AuditLogParams {
  userId: string;
  userRole: string;
  action: AuditAction;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: params.details ? (params.details as any) : undefined,
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
