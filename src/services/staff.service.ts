import { prisma } from '@/lib/db/client';
import { CreateStaffInput, UpdateStaffInput } from '@/lib/validations/staff';
import { IdGeneratorService } from '@/lib/utils/generate-id';
import { AppError } from '@/lib/api/errors';
import { auth } from '@/lib/auth/config';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { Prisma } from '@prisma/client';

// ResolvedStaffInput is derived from CreateStaffInput but makes branchId
// required. The API route always resolves the correct branch from the session
// before calling this service, so by the time we reach here branchId is
// guaranteed to be a concrete string.
type ResolvedStaffInput = Omit<CreateStaffInput, 'branchId'> & { branchId: string };

export class StaffService {
  /**
   * Create a new staff member (Admin only action).
   * Registers the user in the authentication system and creates the Staff profile.
   *
   * @param data - Staff input with a resolved (non-null) branchId
   * @param adminUserId - The ID of the admin performing the action (for audit log)
   */
  static async createStaff(data: ResolvedStaffInput, adminUserId: string) {
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

    // 3. Register user via Better Auth (Server-side API).
    // Note: Better Auth handles password hashing and the base User record.
    // `role`/`branchId` are configured with `input: false` (see auth/config.ts)
    // so they are IGNORED here even though we're calling from the server —
    // Better Auth strips non-input additional fields at the endpoint level
    // regardless of caller. Every account is created as a plain PATIENT with
    // no branch; we deliberately elevate it to the real role/branch in step 4
    // below via a direct, authorization-gated Prisma write.
    const authResponse = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      },
    });

    if (!authResponse?.user) {
      throw new AppError('Failed to create user authentication record.', 'INTERNAL_SERVER_ERROR', 500);
    }

    // 4. Wrap role elevation + profile creation in a single transaction so
    // Better Auth user, User.role/branchId, and the Staff profile can never
    // drift out of sync with each other.
    try {
      return await prisma.$transaction(async (tx) => {
        // Elevate the account from the PATIENT default to its real staff
        // role/branch. This is a trusted, server-only write — it never goes
        // through the public Better Auth input surface — and only happens
        // here, reached exclusively via the ADMIN/SUPER_ADMIN-gated
        // `POST /api/v1/hr/staff` route.
        await tx.user.update({
          where: { id: authResponse.user.id },
          data: {
            role: data.role,
            branchId: data.branchId,
          },
        });

        const staffId = await IdGeneratorService.generateStaffId(tx);

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
            userRole: 'ADMIN',
            action: 'STAFF_CREATED',
            resource: 'STAFF',
            resourceId: staff.id,
            details: { role: data.role, email: data.email, departmentId: data.departmentId } as Prisma.InputJsonValue,
            branchId: data.branchId,
          }
        });

        return staff;
      }).then((staff) => {
        // Organization-wide visibility for SUPER_ADMIN when any staff is
        // created (mirrors the SUPER_ADMIN cross-branch override used
        // throughout the RBAC layer). Best-effort: never blocks staff creation.
        NotificationService.notifySuperAdmins({
          type: 'STAFF',
          title: 'New staff member created',
          body: `${data.firstName} ${data.lastName} (${data.role}) was added to the team.`,
          link: '/admin/staff',
          resource: 'STAFF',
          resourceId: staff.id,
          excludeUserId: adminUserId,
        }).catch(() => {});

        return staff;
      });
    } catch (error) {
      // Rollback the Better Auth user creation to avoid orphaned auth accounts
      try {
        await prisma.user.delete({ where: { id: authResponse.user.id } });
      } catch (cleanupError) {
        console.error('Failed to clean up orphaned auth user:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Update a staff member's profile details (department, specialization,
   * license, contact info). Does NOT touch authentication credentials —
   * email/password changes go through the auth system, never through here.
   */
  static async updateStaff(staffId: string, data: UpdateStaffInput, executorId: string) {
    const existing = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!existing) throw new AppError('Staff member not found', 'NOT_FOUND', 404);

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        departmentId: data.departmentId,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        phone: data.phone,
        address: data.address,
      },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'ADMIN',
      action: 'STAFF_UPDATED',
      resource: 'STAFF',
      resourceId: staffId,
      branchId: existing.branchId,
      details: { changedFields: Object.keys(data) },
    }).catch(() => {});

    return updated;
  }

  /**
   * Activate or deactivate a staff member's access. Deactivated staff keep
   * their historical clinical/administrative records intact but can no
   * longer authenticate or be assigned new work (enforced elsewhere via
   * `isActive`/session checks).
   */
  static async setActive(staffId: string, isActive: boolean, executorId: string) {
    const existing = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!existing) throw new AppError('Staff member not found', 'NOT_FOUND', 404);

    if (existing.isActive === isActive) {
      // No-op: avoid writing a misleading duplicate audit event.
      return existing;
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: { isActive },
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'ADMIN',
      action: isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      resource: 'STAFF',
      resourceId: staffId,
      branchId: existing.branchId,
    }).catch(() => {});

    return updated;
  }
}
