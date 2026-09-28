import { withAuth, parseBody } from '@/lib/api/middleware';
import { ok } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  dateOfBirth: z.union([z.date(), z.string()]).optional().nullable().transform(d => (d && !isNaN(new Date(d).getTime())) ? new Date(d) : null),
  gender: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
});

/**
 * PATCH /api/v1/users/profile
 * Update the authenticated user's profile (name, email, phone, image).
 */
export const PATCH = withAuth(async (req, session) => {
  const body = await parseBody(req, UpdateProfileSchema);

  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { staffProfile: true, patientProfile: true }
  });

  const updateData: Record<string, unknown> = {
    name: body.name,
    email: body.email,
    image: body.image !== undefined ? body.image : undefined,
  };

  const isStaffRole = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "LAB_TECH", "RECEPTIONIST"].includes(existingUser?.role || "");

  if (isStaffRole) {
    if (existingUser?.staffProfile) {
      updateData.staffProfile = {
        update: {
          phone: body.phone !== undefined ? body.phone : existingUser.staffProfile.phone,
          dateOfBirth: body.dateOfBirth !== undefined ? body.dateOfBirth : existingUser.staffProfile.dateOfBirth,
          gender: body.gender !== undefined ? body.gender : existingUser.staffProfile.gender,
          bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : existingUser.staffProfile.bloodGroup,
          maritalStatus: body.maritalStatus !== undefined ? body.maritalStatus : existingUser.staffProfile.maritalStatus,
          emergencyContactName: body.emergencyContactName !== undefined ? body.emergencyContactName : existingUser.staffProfile.emergencyContactName,
          emergencyContactPhone: body.emergencyContactPhone !== undefined ? body.emergencyContactPhone : existingUser.staffProfile.emergencyContactPhone,
          bio: body.bio !== undefined ? body.bio : existingUser.staffProfile.bio,
        }
      };
    } else {
      // Create staff profile if it doesn't exist
      let branchIdToUse = existingUser?.branchId;
      if (!branchIdToUse) {
        const hq = await prisma.branch.findUnique({ where: { code: 'HQ' } });
        if (hq) branchIdToUse = hq.id;
      }
      
      if (branchIdToUse) {
        const staffId = `STF-${Math.floor(100000 + Math.random() * 900000)}`;
        updateData.staffProfile = {
          create: {
            staffId,
            branchId: branchIdToUse,
            phone: body.phone ?? null,
            dateOfBirth: body.dateOfBirth ?? null,
            gender: body.gender ?? null,
            bloodGroup: body.bloodGroup ?? null,
            maritalStatus: body.maritalStatus ?? null,
            emergencyContactName: body.emergencyContactName ?? null,
            emergencyContactPhone: body.emergencyContactPhone ?? null,
            bio: body.bio ?? null,
          }
        };
      }
    }
  } else {
    // Patient role
    if (existingUser?.patientProfile) {
      updateData.patientProfile = {
        update: {
          phone: body.phone !== undefined ? body.phone : existingUser.patientProfile.phone,
          dateOfBirth: body.dateOfBirth !== undefined ? body.dateOfBirth : existingUser.patientProfile.dateOfBirth,
          gender: body.gender !== undefined ? body.gender : existingUser.patientProfile.gender,
          bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : existingUser.patientProfile.bloodGroup,
          maritalStatus: body.maritalStatus !== undefined ? body.maritalStatus : existingUser.patientProfile.maritalStatus,
          emergencyContactName: body.emergencyContactName !== undefined ? body.emergencyContactName : existingUser.patientProfile.emergencyContactName,
          emergencyContactPhone: body.emergencyContactPhone !== undefined ? body.emergencyContactPhone : existingUser.patientProfile.emergencyContactPhone,
          occupation: body.occupation !== undefined ? body.occupation : existingUser.patientProfile.occupation,
        }
      };
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, updatedAt: true },
  });

  return ok(user);
});

/**
 * GET /api/v1/users/profile
 * Get the authenticated user's profile.
 */
export const GET = withAuth(async (_req, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { staffProfile: true, patientProfile: true }
  });

  if (!user) {
    return ok(null);
  }

  // Flatten the profile data for the frontend
  let profileData: Record<string, unknown> = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.staffProfile) {
    profileData = {
      ...profileData,
      phone: user.staffProfile.phone,
      dateOfBirth: user.staffProfile.dateOfBirth,
      gender: user.staffProfile.gender,
      bloodGroup: user.staffProfile.bloodGroup,
      maritalStatus: user.staffProfile.maritalStatus,
      emergencyContactName: user.staffProfile.emergencyContactName,
      emergencyContactPhone: user.staffProfile.emergencyContactPhone,
      bio: user.staffProfile.bio,
    };
  } else if (user.patientProfile) {
    profileData = {
      ...profileData,
      phone: user.patientProfile.phone,
      dateOfBirth: user.patientProfile.dateOfBirth,
      gender: user.patientProfile.gender,
      bloodGroup: user.patientProfile.bloodGroup,
      maritalStatus: user.patientProfile.maritalStatus,
      emergencyContactName: user.patientProfile.emergencyContactName,
      emergencyContactPhone: user.patientProfile.emergencyContactPhone,
      occupation: user.patientProfile.occupation,
    };
  }

  return ok(profileData);
});