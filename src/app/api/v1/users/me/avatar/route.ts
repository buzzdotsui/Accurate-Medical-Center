import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { prisma } from '@/lib/db/client';
import { ok } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';
import { z } from 'zod';

const UploadAvatarSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
});

/**
 * POST /api/v1/users/me/avatar
 * Upload a new profile picture for the current user.
 * Stores the image in Cloudinary and updates the user's image field.
 */
export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, UploadAvatarSchema);

  // Upload to Cloudinary
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({ secure: true });

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(body.image, {
      folder: 'accurate-medical/avatars',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    throw new AppError('Failed to upload avatar', 'INTERNAL_SERVER_ERROR', 500);
  }

  // Update user's image field
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: uploadResult.secure_url },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return ok(updatedUser);
});

/**
 * DELETE /api/v1/users/me/avatar
 * Remove the current user's profile picture (revert to initials).
 */
export const DELETE = withAuth(async (req, session) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (currentUser?.image) {
    // Extract public_id from Cloudinary URL
    const urlParts = currentUser.image.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `accurate-medical/avatars/${filename.split('.')[0]}`;

    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({ secure: true });
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.warn('Failed to delete old avatar from Cloudinary:', error);
    }
  }

  // Clear the image field
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return ok(updatedUser);
});