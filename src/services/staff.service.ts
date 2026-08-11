import { prisma } from '@/lib/db/client';
import { CreateStaffInput } from '@/lib/validations/staff';
import { generateStaffId } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { auth } from '@/lib/auth/config';

export class StaffService {
  /**
   * Create a new staff member (Admin only action).
   * Registers the user in the authentication system and creates the Staff profile.
   */
  static async createStaff(data: CreateStaffInput, adminUserId: string) {
    // 1. Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    
    if (!branch) {
      throw new AppError('Invalid branch ID provided.', 'BAD_REQUEST', 400);
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 'CONFLICT', 409);
    }

    // 3. Register user via Better Auth (Server-side API)
    // Note: Better Auth handles the password hashing and User record creation
    const authResponse = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        role: data.role,
        branchId: data.branchId,
      },
    });

    if (!authResponse?.user) {
      throw new AppError('Failed to create user authentication record.', 'INTERNAL_SERVER_ERROR', 500);
    }

    // 4. Wrap the remaining profile creation in a transaction
    return await prisma.$transaction(async (tx) => {
      const totalStaff = await tx.staff.count();
      const nextSequence = totalStaff + 1;
      
      // Determine department code for the ID (e.g., DOC, NRS, LAB)
      let prefix = 'STF';
      if (data.role === 'DOCTOR') prefix = 'DOC';
      if (data.role === 'NURSE') prefix = 'NRS';
      if (data.role === 'LAB_SCIENTIST') prefix = 'LAB';
      if (data.role === 'PHARMACIST') prefix = 'RXS';
      
      const staffId = generateStaffId(prefix, nextSequence);

      const staff = await tx.staff.create({
        data: {
          staffId,
          userId: authResponse.user.id,
          branchId: data.branchId,
          departmentId: data.departmentId || null,
          specialization: data.specialization || null,
          licenseNumber: data.licenseNumber || null,
          phone: data.phone || null,
          address: data.address || null,
        },
      });

      // 5. Audit Log the creation
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          userRole: 'ADMIN', // This should be dynamic based on the actual executor
          action: 'CREATE_STAFF',
          resource: 'STAFF',
          resourceId: staff.id,
          details: JSON.stringify({ role: data.role, email: data.email }),
          branchId: data.branchId,
        }
      });

      return staff;
    });
  }
}
