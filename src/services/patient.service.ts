import { prisma } from '@/lib/db/client';
import { CreatePatientInput, UpdatePatientInput } from '@/lib/validations/patient';
import { generatePatientId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';

export class PatientService {
  /**
   * Register a new patient and generate a formatted PAT-ID.
   */
  static async createPatient(data: CreatePatientInput) {
    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    
    if (!branch) {
      throw new AppError('BAD_REQUEST', 'Invalid branch ID provided.', 400);
    }

    // Wrap in transaction to safely get sequence and insert
    return await prisma.$transaction(async (tx) => {
      // 1. Get total patients to calculate sequence
      const totalPatients = await tx.patient.count();
      const nextSequence = totalPatients + 1;
      
      // 2. Generate custom ID
      const patientId = generatePatientId(nextSequence);
      
      // 3. Create the patient
      const patient = await tx.patient.create({
        data: {
          patientId,
          branchId: data.branchId,
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
  }

  /**
   * Retrieve a patient by their Database ID or Custom Patient ID
   */
  static async getPatient(identifier: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: identifier },
          { patientId: identifier },
        ]
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
        allergies: true,
        chronicConditions: true,
      }
    });

    if (!patient) {
      throw new AppError('NOT_FOUND', 'Patient not found', 404);
    }

    return patient;
  }

  /**
   * List all patients with pagination and optional search
   */
  static async listPatients(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { patientId: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
      ]
    } : {};

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

  /**
   * Update an existing patient
   */
  static async updatePatient(data: UpdatePatientInput) {
    const { id, ...updateData } = data;
    
    // Check if patient exists
    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Patient not found', 404);
    }

    return await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
      },
    });
  }
}
