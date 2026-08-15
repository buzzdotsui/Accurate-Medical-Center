import { v2 as cloudinary } from 'cloudinary';


// Note: Ensure CLOUDINARY_URL is set in .env
cloudinary.config({
  secure: true,
});

export class FileService {
  /**
   * Upload a base64 or file path to Cloudinary
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
    } catch (_error) {
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (_error) {
    }
  }
}
