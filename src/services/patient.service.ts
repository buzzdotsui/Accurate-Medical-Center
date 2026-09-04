import { prisma } from '@/lib/db/client';
import { UpdatePatientInput } from '@/lib/validations/patient';
import { IdGeneratorService } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

export type CreatePatientData = {
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  address?: string;
  bloodGroup?: string;
  genotype?: string;
  branchId?: string;
  auditContext?: {
    userId?: string;
    userRole?: string;
    ip?: string;
    userAgent?: string;
    /** Free-text tag identifying which entry point created this patient (for audit trail clarity). */
    source?: string;
  };
};

export class PatientService {
  /**
   * THE single authoritative patient-creation routine.
   *
   * Every code path that creates a Patient row — public self-registration,
   * admin/reception registration, and the implicit patient creation that
   * happens during public appointment booking — MUST go through this method
   * (directly, or via `createPatient` below). It is the only place a Patient
   * ID is minted and the only place a PATIENT_REGISTERED audit event is
   * written, so identity/audit behaviour cannot drift between entry points.
   *
   * Accepts a caller-supplied transaction so it can be composed atomically
   * with other writes (e.g. creating an appointment for a brand-new
   * public-booking patient in the same transaction).
   */
  static async createPatientInTx(
    tx: Prisma.TransactionClient,
    data: CreatePatientData
  ) {
    // Concurrency-safe sequential patient ID (e.g., AMC-PT-000001)
    const patientId = await IdGeneratorService.generatePatientId(tx);

    const patient = await tx.patient.create({
      data: {
        patientId,
        userId: data.userId ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone ?? null,
        gender: data.gender ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        address: data.address ?? null,
        bloodGroup: data.bloodGroup ?? null,
        genotype: data.genotype ?? null,
        ...(data.branchId ? { branchId: data.branchId } : {}),
      } as Prisma.PatientUncheckedCreateInput,
    });

    // Written via `tx` (not the global `AuditService.log`) so the audit
    // event participates in the same transaction as the Patient insert
    // and the ID sequence increment. If the transaction rolls back, the
    // audit event rolls back with it — no orphaned audit records.
    // This runs unconditionally: every patient creation must leave an
    // audit trail, regardless of which entry point called this method.
    await tx.auditLog.create({
      data: {
        userId: data.auditContext?.userId || data.userId || "system",
        userRole: data.auditContext?.userRole || "PATIENT",
        action: "PATIENT_REGISTERED",
        resource: "PATIENT",
        resourceId: patient.id,
        details: {
          patientId: patient.patientId,
          email: patient.email,
          source: data.auditContext?.source ?? "UNSPECIFIED",
        } as Prisma.InputJsonValue,
        ip: data.auditContext?.ip,
        userAgent: data.auditContext?.userAgent,
        branchId: patient.branchId,
      },
    });

    return patient;
  }

  /**
   * Convenience wrapper around `createPatientInTx` for callers that don't
   * already have an open transaction (the common case).
   */
  static async createPatient(data: CreatePatientData) {
    return await prisma.$transaction((tx) => this.createPatientInTx(tx, data));
  }

  /**
   * Self-healing lookup for the currently authenticated PATIENT user.
   *
   * Registration is a two-step process at the client (see
   * `src/app/(auth)/register/page.tsx`): create the Better Auth account,
   * then POST `/api/v1/patients/self-register` to create the Patient row.
   * If that second step fails (network blip, tab closed, etc.) the user is
   * left with a valid login but no Patient profile, and nothing previously
   * retried it — every self-service endpoint just threw a 404 forever.
   *
   * This is the single place that closes that gap: it returns the existing
   * profile if one exists, and otherwise creates exactly one (via the same
   * authoritative `createPatient` routine used by self-register) using the
   * account's own name/email. Safe to call on every patient-facing read —
   * it never duplicates or overwrites an existing profile.
   */
  static async ensureSelfProfile(user: { id: string; email: string; name: string }) {
    const existing = await prisma.patient.findFirst({
      where: { userId: user.id, deletedAt: null },
    });
    if (existing) return existing;

    const defaultBranch = await prisma.branch.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!defaultBranch) {
      throw new AppError(
        'System is not fully configured (no active branch found).',
        'BAD_REQUEST',
        400
      );
    }

    const nameParts = (user.name || 'Patient').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Patient';
    const lastName = nameParts.slice(1).join(' ') || 'Patient';

    return this.createPatient({
      firstName,
      lastName,
      email: user.email,
      branchId: defaultBranch.id,
      userId: user.id,
      auditContext: {
        userId: user.id,
        userRole: 'PATIENT',
        source: 'AUTO_HEALED_SELF_PROFILE',
      },
    });
  }

  static async getPatient(identifier: string, branchId?: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        AND: [
          { OR: [{ id: identifier }, { patientId: identifier }] },
          { deletedAt: null },
          ...(branchId ? [{ branchId }] : []),
        ]
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
        allergies: true,
        chronicConditions: true,
      }
    });

    if (!patient) {
      throw new AppError('Patient not found', 'NOT_FOUND', 404);
    }

    return patient;
  }

  /**
   * Deterministic deduplication for public appointment requests.
   * Finds an existing patient by phone or email safely.
   */
  static async findExistingPatient(params: { phone?: string; email?: string; branchId: string }) {
    if (!params.phone && !params.email) return null;

    // Normalize
    const normalizedPhone = params.phone ? params.phone.replace(/\D/g, '') : null;
    const normalizedEmail = params.email ? params.email.toLowerCase().trim() : null;

    if (!normalizedPhone && !normalizedEmail) return null;

    const whereClauses = [];
    if (normalizedPhone) whereClauses.push({ phone: { contains: normalizedPhone } });
    if (normalizedEmail) whereClauses.push({ email: normalizedEmail });

    const patients = await prisma.patient.findMany({
      where: {
        branchId: params.branchId,
        deletedAt: null,
        OR: whereClauses,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (patients.length === 0) return null;

    // If both provided, ensure they don't point to completely different identities
    if (normalizedPhone && normalizedEmail && patients.length > 1) {
      const emailMatch = patients.find(p => p.email?.toLowerCase() === normalizedEmail);
      const phoneMatch = patients.find(p => p.phone && p.phone.replace(/\D/g, '').includes(normalizedPhone));
      
      if (emailMatch && phoneMatch && emailMatch.id !== phoneMatch.id) {
        // Conflicting identities. Prefer the exact email match as it is usually more definitive.
        // Or if we want to be hyper-safe, we return null to force a new record that staff must merge later.
        // Returning null prevents mistakenly revealing/associating the wrong patient.
        return null;
      }
    }

    // Return the best match (first one, since we ordered by desc, it's the most recent)
    return patients[0];
  }

  static async getPatientProfile(identifier: string, branchId?: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        AND: [
          { OR: [{ id: identifier }, { patientId: identifier }] },
          { deletedAt: null },
          ...(branchId ? [{ branchId }] : []),
        ]
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
        allergies: true,
        chronicConditions: true,
        insurance: true,
        nextOfKin: true,
        visits: {
          take: 20,
          orderBy: { startedAt: 'desc' },
          include: {
            doctor: { include: { user: { select: { name: true } } } },
            diagnoses: true,
            prescriptions: true,
            labRequests: true,
            radRequests: true,
          }
        },
        appointments: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      }
    });

    if (!patient) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    return patient;
  }

  static async getPatientTimeline(patientId: string, branchId?: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        AND: [
          { OR: [{ id: patientId }, { patientId }] },
          { deletedAt: null },
          ...(branchId ? [{ branchId }] : []),
        ]
      },
      select: { id: true }
    });
    if (!patient) throw new AppError('Patient not found', 'NOT_FOUND', 404);

    const [visits, appointments, invoices, diagnoses] = await Promise.all([
      prisma.visit.findMany({
        where: { patientId: patient.id },
        orderBy: { startedAt: 'desc' },
        take: 50,
      }),
      prisma.appointment.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.invoice.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.diagnosis.findMany({
        where: { visit: { patientId: patient.id } },
        orderBy: { id: 'desc' },
        take: 50,
      }),
    ]);

    type TimelineEvent = {
      id: string;
      type: 'VISIT' | 'APPOINTMENT' | 'INVOICE' | 'DIAGNOSIS';
      date: Date;
      title: string;
      description?: string;
      metadata: Record<string, unknown>;
    };

    const events: TimelineEvent[] = [];
    visits.forEach(v => events.push({
      id: `v-${v.id}`, type: 'VISIT', date: v.startedAt!,
      title: `Visit ${v.visitId ?? ''}`,
      description: v.chiefComplaint ?? `Status: ${v.status}`,
      metadata: { status: v.status, visitId: v.visitId }
    }));
    appointments.forEach(a => events.push({
      id: `a-${a.id}`, type: 'APPOINTMENT', date: a.date,
      title: `Appointment ${a.type}`,
      description: `${a.status}${a.reason ? ' • ' + a.reason : ''}`,
      metadata: { status: a.status, timeSlot: a.timeSlot }
    }));
    invoices.forEach(i => events.push({
      id: `i-${i.id}`, type: 'INVOICE', date: i.createdAt!,
      title: `Invoice ${i.invoiceId ?? ''}`,
      description: `${i.status} • ${i.totalAmount ?? 0}`,
      metadata: { status: i.status, total: i.totalAmount }
    }));
    diagnoses.forEach(d => events.push({
      id: `d-${d.id}`, type: 'DIAGNOSIS', date: new Date(),
      title: `${d.type} Diagnosis`,
      description: d.description,
      metadata: { code: d.code }
    }));

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    return events;
  }

  static async listPatients(params: { skip?: number; take?: number; search?: string; branchId?: string }) {
    const { skip = 0, take = 50, search, branchId } = params;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (branchId) where.branchId = branchId;
    where.deletedAt = null;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { patientId: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
      ];
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: { select: { id: true, name: true, code: true } },
        },
      })
    ]);

    return { total, patients };
  }

  static async updatePatient(data: UpdatePatientInput, executorId?: string) {
    const { id, ...updateData } = data;
    
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new AppError('Patient not found', 'NOT_FOUND', 404);

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
      },
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId,
        userRole: 'SYSTEM',
        action: 'PATIENT_UPDATED',
        resource: 'PATIENT',
        resourceId: id,
        branchId: existing.branchId,
      }).catch(() => {});
    }

    return updated;
  }

  static async deletePatient(id: string, executorId?: string) {
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    if (existing.deletedAt) throw new AppError('Patient already deactivated', 'BAD_REQUEST', 400);

    const result = await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId,
        userRole: 'SYSTEM',
        action: 'PATIENT_DEACTIVATED',
        resource: 'PATIENT',
        resourceId: id,
        branchId: existing.branchId,
      }).catch(() => {});
    }

    return result;
  }

  /**
   * Reactivate a previously deactivated (soft-deleted) patient record.
   */
  static async activatePatient(id: string, executorId?: string) {
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    if (!existing.deletedAt) throw new AppError('Patient is already active', 'BAD_REQUEST', 400);

    const result = await prisma.patient.update({
      where: { id },
      data: { deletedAt: null },
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId,
        userRole: 'SYSTEM',
        action: 'PATIENT_ACTIVATED',
        resource: 'PATIENT',
        resourceId: id,
        branchId: existing.branchId,
      }).catch(() => {});
    }

    return result;
  }
}
