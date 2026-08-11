import { prisma } from '@/lib/db/client';
import { CreatePatientInput, UpdatePatientInput } from '@/lib/validations/patient';
import { generatePatientId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class PatientService {
  static async createPatient(data: CreatePatientInput, executorId?: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    
    if (!branch) {
      throw new AppError('Invalid branch ID provided.', 'BAD_REQUEST', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const totalPatients = await tx.patient.count({ where: { branchId: data.branchId, deletedAt: null } });
      const nextSequence = totalPatients + 1;
      const patientId = generatePatientId(nextSequence);
      
      const patient = await tx.patient.create({
        data: {
          patientId,
          branch: { connect: { id: data.branchId! } },
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          bloodGroup: data.bloodGroup || null,
          genotype: data.genotype || null,
          address: data.address || null,
        },
      });
      
      return patient;
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId,
        userRole: 'SYSTEM',
        action: 'CREATE_PATIENT',
        resource: 'PATIENT',
        resourceId: result.id,
        branchId: data.branchId,
        details: { patientId: result.patientId }
      }).catch(() => {});
    }

    return result;
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
      metadata: any;
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
        action: 'UPDATE_PATIENT',
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
    if (existing.deletedAt) throw new AppError('Patient already deleted', 'BAD_REQUEST', 400);

    const result = await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId,
        userRole: 'SYSTEM',
        action: 'DELETE_PATIENT',
        resource: 'PATIENT',
        resourceId: id,
        branchId: existing.branchId,
      }).catch(() => {});
    }

    return result;
  }
}
