/**
 * Structured logger — wraps console in development, ready to be
 * swapped for Pino or a cloud log aggregator in production.
 *
 * All log calls include: timestamp, level, context, and message.
 * Audit logs (mutations) should use auditLog() instead.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  patientId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  ip?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, output structured JSON for log aggregation (Datadog, etc.)
    // Replace with: pino().info(entry) when Pino is configured
    console[level](JSON.stringify(entry));
  } else {
    // In development, output formatted for readability
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    console[level](`${prefix} ${message}`, context ? context : '');
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// ---------------------------------------------------------------------------
// Audit Logger — for all data mutation events
// ---------------------------------------------------------------------------

export interface AuditEntry {
  userId: string;
  userRole: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  branchId?: string;
}

/**
 * Log an audit event. This writes to both the structured log AND
 * will persist to the AuditLog database table (via the API middleware).
 */
export function auditLog(entry: AuditEntry): void {
  logger.info(`AUDIT: ${entry.action} ${entry.resource}`, {
    userId: entry.userId,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    ip: entry.ip,
    branchId: entry.branchId,
  });
  // Database persistence is handled by the API middleware layer
}
