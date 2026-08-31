import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/api/errors';

// Note: Ensure CLOUDINARY_URL is set in .env
cloudinary.config({
  secure: true,
});

export class FileService {
  /**
   * Upload a base64 or file path to Cloudinary.
   * Throws an AppError on failure instead of silently returning `undefined`,
   * so callers get a real, catchable failure.
   */
  static async uploadFile(fileStr: string, folder: string = 'accurate-medical/general') {
    try {
      const result = await cloudinary.uploader.upload(fileStr, {
        folder,
        resource_type: 'auto',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
      };
    } catch (error) {
      logger.error('Cloudinary upload failed', {
        error: error instanceof Error ? error.message : String(error),
        folder,
      });
      throw new AppError('File upload failed', 'INTERNAL_SERVER_ERROR', 500);
    }
  }

  /**
   * Delete a file from Cloudinary.
   * Throws an AppError on failure instead of silently returning `undefined`,
   * so callers get a real, catchable failure.
   */
  static async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      logger.error('Cloudinary delete failed', {
        error: error instanceof Error ? error.message : String(error),
        publicId,
      });
      throw new AppError('File deletion failed', 'INTERNAL_SERVER_ERROR', 500);
    }
  }
}
