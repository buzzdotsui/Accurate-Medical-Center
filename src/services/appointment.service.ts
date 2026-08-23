import { prisma } from '@/lib/db/client';
import { CreateAppointmentInput, UpdateAppointmentStatusInput } from '@/lib/validations/appointment';
import { generateAppointmentId, generateVisitId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['ARRIVED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN'],
  CHECKED_IN: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export class AppointmentService {
  static async createAppointment(data: CreateAppointmentInput, executorId: string) {
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient) throw new AppError('Patient not found', 'NOT_FOUND', 404);

    if (data.doctorId && data.timeSlot) {
      const dateObj = new Date(data.date);
      const startOfDay = new Date(dateObj); startOfDay.setUTCHours(0,0,0,0);
      const endOfDay = new Date(dateObj); endOfDay.setUTCHours(23,59,59,999);
      const conflict = await prisma.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          date: { gte: startOfDay, lte: endOfDay },
          timeSlot: data.timeSlot,
          status: { in: ['SCHEDULED', 'CHECKED_IN', 'ARRIVED', 'IN_PROGRESS'] },
        }
      });
      if (conflict) throw new AppError('Doctor already has an appointment at this time slot', 'BAD_REQUEST', 400);
    }

    const appointmentId = generateAppointmentId();
    const appointment = await prisma.appointment.create({
      data: {
        appointmentId,
        patientId: data.patientId,
        branchId: data.branchId,
        doctorId: data.doctorId || null,
        date: new Date(data.date),
        timeSlot: data.timeSlot || null,
        type: data.type,
        reason: data.reason || null,
        notes: data.notes || null,
        status: 'SCHEDULED',
      },
    });

    await AuditService.log({
      userId: executorId, userRole: 'SYSTEM', action: 'CREATE_APPOINTMENT',
      resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
      details: { patientId: data.patientId, date: data.date, timeSlot: data.timeSlot }
    }).catch(() => {});

    return appointment;
  }

  static async requestPublicAppointment(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    service: string;
    preferredDate: string;
    notes?: string;
    branchId: string;
  }) {
    // We import PatientService and generatePatientId lazily to avoid circular dependencies if any
    const { PatientService } = await import('./patient.service');
    const { generatePatientId } = await import('@/lib/utils/generate-id');

    // 1. Deduplicate patient safely (non-transactional read is fine here)
    let patient = await PatientService.findExistingPatient({
      phone: data.phone,
      email: data.email,
      branchId: data.branchId,
    });

    // 2. Transaction for atomic creation
    const appointment = await prisma.$transaction(async (tx) => {
      let currentPatientId = patient?.id;
      
      if (!currentPatientId) {
        // Create new patient inside transaction
        const totalPatients = await tx.patient.count({ where: { branchId: data.branchId, deletedAt: null } });
        const newPatientIdStr = generatePatientId(totalPatients + 1);
        
        const newPatient = await tx.patient.create({
          data: {
            patientId: newPatientIdStr,
            branchId: data.branchId,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email || null,
          }
        });
        currentPatientId = newPatient.id;
      }

      // Create appointment
      const appointmentId = generateAppointmentId();
      return tx.appointment.create({
        data: {
          appointmentId,
          patientId: currentPatientId,
          branchId: data.branchId,
          date: new Date(data.preferredDate),
          type: 'IN_PERSON',
          reason: data.service,
          notes: data.notes || null,
          status: 'SCHEDULED',
        }
      });
    });

    // Audit log (we log with 'PUBLIC' role to identify the source)
    await AuditService.log({
      userId: 'PUBLIC', userRole: 'SYSTEM', action: 'REQUEST_PUBLIC_APPOINTMENT',
      resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
      details: { patientId: appointment.patientId, service: data.service }
    }).catch(() => {});

    return appointment;
  }

  static async createWalkIn(data: { patientId: string; branchId: string; doctorId?: string; reason?: string; type?: string }, executorId: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const appointmentId = generateAppointmentId();
      const appointment = await tx.appointment.create({
        data: {
          appointmentId,
          patientId: data.patientId,
          branchId: data.branchId,
          doctorId: data.doctorId || null,
          date: now,
          type: data.type ?? 'IN_PERSON',
          reason: data.reason || null,
          status: 'CHECKED_IN',
        }
      });

      const visit = await tx.visit.create({
        data: {
          visitId: generateVisitId(),
          patientId: data.patientId,
          doctorId: data.doctorId || null,
          appointmentId: appointment.id,
          status: 'IN_PROGRESS',
          startedAt: now,
          chiefComplaint: data.reason || null,
        }
      });

      await AuditService.log({
        userId: executorId, userRole: 'SYSTEM', action: 'CREATE_WALKIN',
        resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
        details: { patientId: data.patientId, visitId: visit.id }
      }).catch(() => {});

      return { appointment, visit };
    });
  }

  static async listAppointments(params: {
    branchId?: string;
    doctorId?: string;
    date?: string;
    status?: string;
    skip?: number;
    take?: number;
    patientId?: string;
  }) {
    const { skip = 0, take = 50 } = params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (params.branchId) where.branchId = params.branchId;
    if (params.doctorId) where.doctorId = params.doctorId;
    if (params.status) where.status = params.status;
    if (params.patientId) where.patientId = params.patientId;
    
    if (params.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where, skip, take,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientId: true, phone: true } },
          staff: { select: { id: true, department: true, user: { select: { name: true } } } },
        },
        orderBy: { date: 'asc' },
      })
    ]);

    return { total, appointments };
  }

  static async getAppointment(id: string) {
    const apt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: { include: { user: { select: { name: true } } } },
      }
    });
    if (!apt) throw new AppError('Appointment not found', 'NOT_FOUND', 404);
    return apt;
  }

  static async updateStatus(id: string, data: UpdateAppointmentStatusInput, executorId: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError('Appointment not found', 'NOT_FOUND', 404);

    const allowed = VALID_TRANSITIONS[appointment.status] ?? [];
    if (!allowed.includes(data.status) && appointment.status !== data.status) {
      throw new AppError(`Invalid status transition from ${appointment.status} to ${data.status}`, 'BAD_REQUEST', 400);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status: data.status };
    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.appointment.update({ where: { id }, data: updateData });

      if (data.status === 'ARRIVED') {
        const existingVisit = await tx.visit.findFirst({ where: { appointmentId: id } });
        if (!existingVisit) {
          await tx.visit.create({
            data: {
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              status: 'IN_PROGRESS',
              startedAt: now,
              visitId: generateVisitId(),
              appointmentId: appointment.id,
              chiefComplaint: appointment.reason ?? undefined,
            }
          });
        }
      }
      return result;
    });

    await AuditService.log({
      userId: executorId, userRole: 'SYSTEM', action: 'UPDATE_APPOINTMENT_STATUS',
      resource: 'APPOINTMENT', resourceId: updated.id, branchId: appointment.branchId,
      details: { oldStatus: appointment.status, newStatus: data.status }
    }).catch(() => {});

    return updated;
  }

  static async reschedule(id: string, newDate: string, newTimeSlot?: string, executorId?: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError('Appointment not found', 'NOT_FOUND', 404);
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      throw new AppError('Cannot reschedule a completed or cancelled appointment', 'BAD_REQUEST', 400);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: new Date(newDate),
        timeSlot: newTimeSlot ?? appointment.timeSlot,
        status: 'SCHEDULED',
      }
    });

    if (executorId) {
      await AuditService.log({
        userId: executorId, userRole: 'SYSTEM', action: 'RESCHEDULE_APPOINTMENT',
        resource: 'APPOINTMENT', resourceId: id, branchId: appointment.branchId,
        details: { newDate, newTimeSlot }
      }).catch(() => {});
    }

    return updated;
  }

  static async getDashboardStats(branchId?: string) {
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(today); endOfDay.setUTCHours(23,59,59,999);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereToday: any = { date: { gte: startOfDay, lte: endOfDay } };
    if (branchId) whereToday.branchId = branchId;

    const [totalToday, checkedIn, waiting, arrived, noShow] = await Promise.all([
      prisma.appointment.count({ where: whereToday }),
      prisma.appointment.count({ where: { ...whereToday, status: { in: ['CHECKED_IN', 'ARRIVED'] } } }),
      prisma.visit.count({
        where: {
          status: 'IN_PROGRESS',
          ...(branchId ? { patient: { branchId } } : {}),
        }
      }),
      prisma.appointment.count({ where: { ...whereToday, status: { notIn: ['SCHEDULED', 'CANCELLED', 'NO_SHOW'] } } }),
      prisma.appointment.count({ where: { ...whereToday, status: 'NO_SHOW' } }),
    ]);

    return {
      todayTotal: totalToday,
      todayCheckedIn: checkedIn,
      inQueue: waiting,
      arrivedCount: arrived,
      noShowCount: noShow,
    };
  }
}
