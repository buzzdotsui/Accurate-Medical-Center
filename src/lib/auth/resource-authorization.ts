import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';
import { SessionUser } from './session';
import { ROLES } from '@/config/roles';

/**
 * Resource Authorization Layer
 * 
 * Enforces:
 * - Resource ownership verification
 * - Branch isolation
 * - Clinical responsibility
 * - Patient-staff relationships
 * - Data visibility rules
 */

/**
 * Verify that a patient belongs to the user's branch (if user is staff).
 * Patients can access their own records. Staff can only access patients in their branch.
 */
export async function verifyPatientAccess(
  user: SessionUser,
  patientId: string,
  action: 'READ' | 'UPDATE' | 'DELETE' = 'READ'
): Promise<{ id: string; branchId: string }> {
  // SUPER_ADMIN can access any patient
  if (user.role === ROLES.SUPER_ADMIN) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError('Patient not found', 'NOT_FOUND', 404);
    return { id: patient.id, branchId: patient.branchId };
  }

  // Patients can only access their own records
  if (user.role === ROLES.PATIENT) {
    const patientUser = await prisma.patient.findFirst({
      where: { id: patientId, user: { id: user.id } },
    });
    if (!patientUser) {
      throw new AppError(
        'You do not have permission to access this patient record.',
        'FORBIDDEN',
        403
      );
    }
    return { id: patientUser.id, branchId: patientUser.branchId };
  }

  // Staff must have a branch assigned
  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  // Staff can only access patients in their branch
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new AppError('Patient not found', 'NOT_FOUND', 404);
  
  if (patient.branchId !== user.branchId) {
    throw new AppError(
      'Patient is not assigned to your branch.',
      'FORBIDDEN',
      403
    );
  }

  return { id: patient.id, branchId: patient.branchId };
}

/**
 * Verify that an appointment belongs to the user's branch and/or context.
 * Patients see their own appointments. Staff see appointments in their branch.
 */
export async function verifyAppointmentAccess(
  user: SessionUser,
  appointmentId: string,
  action: 'READ' | 'UPDATE' | 'DELETE' = 'READ'
): Promise<{ id: string; branchId: string; patientId: string; doctorId: string | null }> {
  // SUPER_ADMIN can access any appointment
  if (user.role === ROLES.SUPER_ADMIN) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, branchId: true, patientId: true, doctorId: true },
    });
    if (!appointment) throw new AppError('Appointment not found', 'NOT_FOUND', 404);
    return appointment;
  }

  // Patients can only see their own appointments
  if (user.role === ROLES.PATIENT) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patient: { user: { id: user.id } },
      },
      select: { id: true, branchId: true, patientId: true, doctorId: true },
    });
    if (!appointment) {
      throw new AppError(
        'You do not have permission to access this appointment.',
        'FORBIDDEN',
        403
      );
    }
    return appointment;
  }

  // Staff must have a branch assigned
  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  // Staff can only access appointments in their branch
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, branchId: true, patientId: true, doctorId: true },
  });
  if (!appointment) throw new AppError('Appointment not found', 'NOT_FOUND', 404);

  if (appointment.branchId !== user.branchId) {
    throw new AppError(
      'Appointment is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return appointment;
}

/**
 * Verify that a clinical visit belongs to the user's context.
 * Doctors/nurses can see visits in their branch. Patients can see visits for their appointments.
 */
export async function verifyVisitAccess(
  user: SessionUser,
  visitId: string,
  action: 'READ' | 'UPDATE' = 'READ'
): Promise<{ id: string; patientId: string; doctorId: string | null }> {
  if (user.role === ROLES.SUPER_ADMIN) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true, patientId: true, doctorId: true },
    });
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    return visit;
  }

  if (user.role === ROLES.PATIENT) {
    const visit = await prisma.visit.findFirst({
      where: {
        id: visitId,
        patient: { user: { id: user.id } },
      },
      select: { id: true, patientId: true, doctorId: true },
    });
    if (!visit) {
      throw new AppError(
        'You do not have permission to access this visit.',
        'FORBIDDEN',
        403
      );
    }
    return visit;
  }

  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { patient: true },
  });
  if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);

  if (visit.patient.branchId !== user.branchId) {
    throw new AppError(
      'Visit is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return { id: visit.id, patientId: visit.patientId, doctorId: visit.doctorId };
}

/**
 * Verify invoice access. Only staff/patients who own the data can see it.
 */
export async function verifyInvoiceAccess(
  user: SessionUser,
  invoiceId: string,
  action: 'READ' | 'UPDATE' = 'READ'
): Promise<{ id: string; branchId: string; patientId: string }> {
  if (user.role === ROLES.SUPER_ADMIN) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, branchId: true, patientId: true },
    });
    if (!invoice) throw new AppError('Invoice not found', 'NOT_FOUND', 404);
    return invoice;
  }

  if (user.role === ROLES.PATIENT) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        patient: { user: { id: user.id } },
      },
      select: { id: true, branchId: true, patientId: true },
    });
    if (!invoice) {
      throw new AppError(
        'You do not have permission to access this invoice.',
        'FORBIDDEN',
        403
      );
    }
    return invoice;
  }

  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, branchId: true, patientId: true },
  });
  if (!invoice) throw new AppError('Invoice not found', 'NOT_FOUND', 404);

  if (invoice.branchId !== user.branchId) {
    throw new AppError(
      'Invoice is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return invoice;
}

/**
 * Verify prescription access.
 */
export async function verifyPrescriptionAccess(
  user: SessionUser,
  prescriptionId: string,
  action: 'READ' | 'UPDATE' = 'READ'
): Promise<{ id: string; visitId: string; doctorId: string }> {
  if (user.role === ROLES.SUPER_ADMIN) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { id: true, visitId: true, doctorId: true },
    });
    if (!prescription) throw new AppError('Prescription not found', 'NOT_FOUND', 404);
    return prescription;
  }

  if (user.role === ROLES.PATIENT) {
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        visit: { patient: { user: { id: user.id } } },
      },
      select: { id: true, visitId: true, doctorId: true },
    });
    if (!prescription) {
      throw new AppError(
        'You do not have permission to access this prescription.',
        'FORBIDDEN',
        403
      );
    }
    return prescription;
  }

  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { visit: { include: { patient: true } } },
  });
  if (!prescription) throw new AppError('Prescription not found', 'NOT_FOUND', 404);

  if (prescription.visit.patient.branchId !== user.branchId) {
    throw new AppError(
      'Prescription is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return { id: prescription.id, visitId: prescription.visitId, doctorId: prescription.doctorId };
}

/**
 * Verify lab request access.
 */
export async function verifyLabRequestAccess(
  user: SessionUser,
  requestId: string,
  action: 'READ' | 'UPDATE' = 'READ'
): Promise<{ id: string; visitId: string }> {
  if (user.role === ROLES.SUPER_ADMIN) {
    const request = await prisma.labRequest.findUnique({
      where: { id: requestId },
      select: { id: true, visitId: true },
    });
    if (!request) throw new AppError('Lab request not found', 'NOT_FOUND', 404);
    return request;
  }

  if (user.role === ROLES.PATIENT) {
    const request = await prisma.labRequest.findFirst({
      where: {
        id: requestId,
        visit: { patient: { user: { id: user.id } } },
      },
      select: { id: true, visitId: true },
    });
    if (!request) {
      throw new AppError(
        'You do not have permission to access this lab request.',
        'FORBIDDEN',
        403
      );
    }
    return request;
  }

  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  const request = await prisma.labRequest.findUnique({
    where: { id: requestId },
    include: { visit: { include: { patient: true } } },
  });
  if (!request) throw new AppError('Lab request not found', 'NOT_FOUND', 404);

  if (request.visit.patient.branchId !== user.branchId) {
    throw new AppError(
      'Lab request is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return { id: request.id, visitId: request.visitId };
}

/**
 * Filter query results to only include resources the user can access.
 * This is used for list operations where we return multiple items.
 */
export function buildBranchFilter(user: SessionUser): { branchId?: string } {
  if (user.role === ROLES.SUPER_ADMIN) {
    return {};
  }

  if (user.role === ROLES.PATIENT) {
    // Patients don't need filtering here; they'll see their own items at application level
    return {};
  }

  // Staff can only see data from their branch
  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  return { branchId: user.branchId };
}

/**
 * Verify staff member access (can view another staff member's profile).
 */
export async function verifyStaffAccess(
  user: SessionUser,
  staffId: string,
  action: 'READ' | 'UPDATE' = 'READ'
): Promise<{ id: string; branchId: string }> {
  if (user.role === ROLES.SUPER_ADMIN) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { id: true, branchId: true },
    });
    if (!staff) throw new AppError('Staff member not found', 'NOT_FOUND', 404);
    return staff;
  }

  if (!user.branchId) {
    throw new AppError('User is not assigned to a branch.', 'FORBIDDEN', 403);
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { id: true, branchId: true },
  });
  if (!staff) throw new AppError('Staff member not found', 'NOT_FOUND', 404);

  if (staff.branchId !== user.branchId) {
    throw new AppError(
      'Staff member is not in your branch.',
      'FORBIDDEN',
      403
    );
  }

  return staff;
}
