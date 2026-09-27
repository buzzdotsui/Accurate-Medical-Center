import { prisma } from "@/lib/db/client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";

type AuditAction = "VIEWED" | "UPDATED" | "DELETED" | "CREATED" | "PRINTED" | "DOWNLOADED";

interface AuditLogOptions {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  branchId?: string;
}

/**
 * Creates a HIPAA-compliant audit log entry for tracking access to medical records.
 * Automatically extracts the authenticated user, role, IP address, and User-Agent from the request headers.
 */
export async function logAudit({ action, resource, resourceId, details, branchId }: AuditLogOptions) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    
    if (!session?.user) {
      return; // Only log authenticated actions
    }

    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const userAgent = reqHeaders.get("user-agent") || "unknown";
    const userRole = (session.user as any).role || "UNKNOWN";

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: userRole,
        action,
        resource,
        resourceId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ip,
        userAgent,
        branchId,
      },
    });
  } catch (error) {
    // In production, we don't want audit logging failures to break the main request flow,
    // but we should definitely log the failure to our server logs.
    console.error("[AUDIT_LOG_ERROR] Failed to write audit log:", error);
  }
}
