import { prisma } from '@/lib/db/client';
import { CreateAppointmentInput, UpdateAppointmentStatusInput } from '@/lib/validations/appointment';
import { generateAppointmentId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export class AppointmentService {
  /**
   * Schedule a new appointment
   */
  static async createAppointment(data: CreateAppointmentInput, executorId: string) {
    // Verify patient
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    
    if (!patient) throw new AppError('NOT_FOUND', 'Patient not found', 404);

    // Create the appointment
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
      userId: executorId,
      userRole: 'SYSTEM', // Context-dependent in reality
      action: 'CREATE_APPOINTMENT',
      resource: 'APPOINTMENT',
      resourceId: appointment.id,
      branchId: data.branchId,
      details: { patientId: data.patientId, date: data.date }
    });

    return appointment;
  }

  /**
   * Retrieve list of appointments (e.g. for a specific doctor, branch, or date)
   */
  static async listAppointments(params: {
    branchId?: string;
    doctorId?: string;
    date?: string;
    status?: string;
  }) {
    const where: any = {};
    
    if (params.branchId) where.branchId = params.branchId;
    if (params.doctorId) where.doctorId = params.doctorId;
    if (params.status) where.status = params.status;
    
    if (params.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientId: true } },
        staff: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Update appointment status (e.g., SCHEDULED -> ARRIVED)
   */
  static async updateStatus(id: string, data: UpdateAppointmentStatusInput, executorId: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError('NOT_FOUND', 'Appointment not found', 404);

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: data.status },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'SYSTEM',
      action: 'UPDATE_APPOINTMENT_STATUS',
      resource: 'APPOINTMENT',
      resourceId: updated.id,
      details: { oldStatus: appointment.status, newStatus: data.status }
    });

    // Automated workflow: Add to Clinical Queue if the patient arrived
    if (data.status === 'ARRIVED') {
      await prisma.visit.create({
        data: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          visitId: "VST-" + Date.now(),
          appointmentId: appointment.id,
        }
      });
    }

    return updated;
  }
}
