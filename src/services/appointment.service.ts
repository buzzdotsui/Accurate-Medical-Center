import { prisma } from '@/lib/db/client';
import { CreateAppointmentInput, UpdateAppointmentStatusInput } from '@/lib/validations/appointment';
import { generateVisitId, IdGeneratorService } from '@/lib/utils/generate-id';

import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { ROLES } from '@/config/roles';

const VALID_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['ARRIVED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN'],
  CHECKED_IN: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export type ResolvedAppointmentInput = Omit<CreateAppointmentInput, 'branchId'> & { branchId: string };

export class AppointmentService {
  static async createAppointment(data: ResolvedAppointmentInput, executorId: string) {
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

    const appointment = await prisma.$transaction(async (tx) => {
      const appointmentId = await IdGeneratorService.generateAppointmentId(tx);
      return tx.appointment.create({
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
    });

    await AuditService.log({
      userId: executorId, userRole: 'SYSTEM', action: 'APPOINTMENT_CREATED',
      resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
      details: { patientId: data.patientId, date: data.date, timeSlot: data.timeSlot }
    }).catch(() => {});

    // Notify the assigned doctor, the patient, and other front-desk staff.
    // Best-effort: a notification failure must never block appointment
    // creation.
    if (data.doctorId) {
      this.notifyDoctorOfAppointment(data.doctorId, patient, appointment.date, appointment.id).catch(() => {});
    }
    this.notifyPatientOfAppointment(
      data.patientId,
      'Appointment booked',
      `Your appointment on ${new Date(appointment.date).toLocaleString()} has been booked.`,
      appointment.id,
    ).catch(() => {});
    NotificationService.notifyRoleInBranch({
      roles: [ROLES.RECEPTIONIST, ROLES.ADMIN],
      branchId: data.branchId,
      type: 'APPOINTMENT',
      title: 'New appointment scheduled',
      body: `${patient.firstName} ${patient.lastName} has a new appointment on ${new Date(appointment.date).toLocaleString()}.`,
      link: '/reception/appointments',
      resource: 'APPOINTMENT',
      resourceId: appointment.id,
      excludeUserId: executorId,
    }).catch(() => {});

    return appointment;
  }

  /**
   * Look up the assigned doctor's User.id (Notification.userId references
   * User, not Staff) and create an in-app notification.
   */
  private static async notifyDoctorOfAppointment(
    doctorId: string,
    patient: { firstName: string; lastName: string },
    date: Date,
    appointmentId: string,
  ) {
    const doctor = await prisma.staff.findUnique({ where: { id: doctorId }, select: { userId: true } });
    if (!doctor) return;
    await NotificationService.createNotification({
      userId: doctor.userId,
      type: 'APPOINTMENT',
      title: 'New appointment scheduled',
      body: `${patient.firstName} ${patient.lastName} has been scheduled for ${new Date(date).toLocaleString()}.`,
      link: '/doctor/queue',
      resource: 'APPOINTMENT',
      resourceId: appointmentId,
    });
  }

  /**
   * Notify the patient's own portal account, if one exists (patients
   * created via public booking/walk-in never have a linked User, so this
   * is a no-op for them — never an error).
   */
  private static async notifyPatientOfAppointment(
    patientId: string,
    title: string,
    body: string,
    appointmentId: string,
  ) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { userId: true } });
    if (!patient?.userId) return;
    await NotificationService.createNotification({
      userId: patient.userId,
      type: 'APPOINTMENT',
      title,
      body,
      link: '/patient',
      resource: 'APPOINTMENT',
      resourceId: appointmentId,
    });
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
    // We import PatientService lazily to avoid circular dependencies if any
    const { PatientService } = await import('./patient.service');

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
        // Create new patient inside transaction via the single authoritative
        // patient-creation routine (PatientService). This guarantees the
        // same Patient ID generation and audit trail as every other
        // registration path, instead of duplicating patient.create() here.
        const newPatient = await PatientService.createPatientInTx(tx, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          branchId: data.branchId,
          auditContext: {
            userId: 'PUBLIC',
            userRole: 'SYSTEM',
            source: 'PUBLIC_APPOINTMENT_BOOKING',
          },
        });
        currentPatientId = newPatient.id;
      }

      // Create appointment
      const appointmentId = await IdGeneratorService.generateAppointmentId(tx);
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
      userId: 'PUBLIC', userRole: 'SYSTEM', action: 'APPOINTMENT_CREATED',
      resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
      details: { patientId: appointment.patientId, service: data.service }
    }).catch(() => {});

    // Reception/admin need to know about unattended online bookings —
    // nobody on staff actively created this one.
    NotificationService.notifyRoleInBranch({
      roles: [ROLES.RECEPTIONIST, ROLES.ADMIN],
      branchId: data.branchId,
      type: 'APPOINTMENT',
      title: 'New online appointment request',
      body: `${data.firstName} ${data.lastName} requested an appointment for ${data.service} on ${new Date(data.preferredDate).toLocaleString()}.`,
      link: '/reception/appointments',
      resource: 'APPOINTMENT',
      resourceId: appointment.id,
    }).catch(() => {});

    return appointment;
  }

  static async createWalkIn(data: { patientId: string; branchId: string; doctorId?: string; reason?: string; type?: string }, executorId: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const appointmentId = await IdGeneratorService.generateAppointmentId(tx);
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
        userId: executorId, userRole: 'SYSTEM', action: 'APPOINTMENT_CREATED',
        resource: 'APPOINTMENT', resourceId: appointment.id, branchId: data.branchId,
        details: { patientId: data.patientId, visitId: visit.id }
      }).catch(() => {});

      return { appointment, visit };
    }).then((result) => {
      // Walk-in patients go straight into the clinical queue — the nursing
      // team (and the assigned doctor, if any) need to know immediately.
      // Fire-and-forget: never blocks the walk-in itself.
      NotificationService.notifyRoleInBranch({
        roles: [ROLES.NURSE],
        branchId: data.branchId,
        type: 'APPOINTMENT',
        title: 'New walk-in patient in queue',
        body: 'A walk-in patient has checked in and is waiting for triage.',
        link: '/nurse/queue',
        resource: 'VISIT',
        resourceId: result.visit.id,
        excludeUserId: executorId,
      }).catch(() => {});

      if (data.doctorId) {
        prisma.staff.findUnique({ where: { id: data.doctorId }, select: { userId: true } }).then((doctor) => {
          if (!doctor) return;
          NotificationService.createNotification({
            userId: doctor.userId,
            type: 'APPOINTMENT',
            title: 'Patient checked in',
            body: 'A walk-in patient assigned to you has checked in.',
            link: '/doctor/queue',
            resource: 'VISIT',
            resourceId: result.visit.id,
          }).catch(() => {});
        }).catch(() => {});
      }

      return result;
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

    let createdNewVisit = false;
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
          createdNewVisit = true;
        }
      }
      return result;
    });

    const action = data.status === 'COMPLETED' ? 'APPOINTMENT_COMPLETED' : 
                   data.status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 
                   'APPOINTMENT_UPDATED';

    await AuditService.log({
      userId: executorId, userRole: 'SYSTEM', action,
      resource: 'APPOINTMENT', resourceId: updated.id, branchId: appointment.branchId,
      details: { oldStatus: appointment.status, newStatus: data.status }
    }).catch(() => {});

    // Notification side-effects, gated on the actual state transition that
    // just happened — never on a mere GET/refetch.
    if (data.status === 'ARRIVED' && createdNewVisit) {
      NotificationService.notifyRoleInBranch({
        roles: [ROLES.NURSE],
        branchId: appointment.branchId,
        type: 'APPOINTMENT',
        title: 'Patient checked in',
        body: 'A patient has checked in and is waiting for triage.',
        link: '/nurse/queue',
        resource: 'APPOINTMENT',
        resourceId: updated.id,
        excludeUserId: executorId,
      }).catch(() => {});

      if (appointment.doctorId) {
        prisma.staff.findUnique({ where: { id: appointment.doctorId }, select: { userId: true } }).then((doctor) => {
          if (!doctor) return;
          NotificationService.createNotification({
            userId: doctor.userId,
            type: 'APPOINTMENT',
            title: 'Patient checked in',
            body: 'Your patient has checked in and is waiting.',
            link: '/doctor/queue',
            resource: 'APPOINTMENT',
            resourceId: updated.id,
          }).catch(() => {});
        }).catch(() => {});
      }
    }

    if (data.status === 'CANCELLED') {
      this.notifyPatientOfAppointment(
        appointment.patientId,
        'Appointment cancelled',
        'Your appointment has been cancelled.',
        updated.id,
      ).catch(() => {});

      NotificationService.notifyRoleInBranch({
        roles: [ROLES.RECEPTIONIST, ROLES.ADMIN],
        branchId: appointment.branchId,
        type: 'APPOINTMENT',
        title: 'Appointment cancelled',
        body: 'An appointment has been cancelled.',
        link: '/reception/appointments',
        resource: 'APPOINTMENT',
        resourceId: updated.id,
        excludeUserId: executorId,
      }).catch(() => {});

      if (appointment.doctorId) {
        prisma.staff.findUnique({ where: { id: appointment.doctorId }, select: { userId: true } }).then((doctor) => {
          if (!doctor) return;
          NotificationService.createNotification({
            userId: doctor.userId,
            type: 'APPOINTMENT',
            title: 'Appointment cancelled',
            body: 'One of your appointments has been cancelled.',
            link: '/doctor/queue',
            resource: 'APPOINTMENT',
            resourceId: updated.id,
          }).catch(() => {});
        }).catch(() => {});
      }
    }

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
        userId: executorId, userRole: 'SYSTEM', action: 'APPOINTMENT_UPDATED',
        resource: 'APPOINTMENT', resourceId: id, branchId: appointment.branchId,
        details: { newDate, newTimeSlot }
      }).catch(() => {});
    }

    this.notifyPatientOfAppointment(
      appointment.patientId,
      'Appointment rescheduled',
      `Your appointment has been rescheduled to ${new Date(newDate).toLocaleString()}.`,
      updated.id,
    ).catch(() => {});

    NotificationService.notifyRoleInBranch({
      roles: [ROLES.RECEPTIONIST, ROLES.ADMIN],
      branchId: appointment.branchId,
      type: 'APPOINTMENT',
      title: 'Appointment rescheduled',
      body: `An appointment has been rescheduled to ${new Date(newDate).toLocaleString()}.`,
      link: '/reception/appointments',
      resource: 'APPOINTMENT',
      resourceId: updated.id,
      excludeUserId: executorId,
    }).catch(() => {});

    if (appointment.doctorId) {
      prisma.staff.findUnique({ where: { id: appointment.doctorId }, select: { userId: true } }).then((doctor) => {
        if (!doctor) return;
        NotificationService.createNotification({
          userId: doctor.userId,
          type: 'APPOINTMENT',
          title: 'Appointment rescheduled',
          body: `An appointment has been rescheduled to ${new Date(newDate).toLocaleString()}.`,
          link: '/doctor/queue',
          resource: 'APPOINTMENT',
          resourceId: updated.id,
        }).catch(() => {});
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
