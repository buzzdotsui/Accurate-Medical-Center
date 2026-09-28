import { withAuth } from '@/lib/api/middleware';
import { FileService } from '@/services/file.service';
import { ok, badRequest } from '@/lib/api/response';

/**
 * POST /api/v1/files/upload
 * Generic, authenticated file upload endpoint. Accepts multipart/form-data
 * with a "file" field. Uploads to Cloudinary via `FileService` and returns
 * the resulting asset metadata.
 *
 * Authorization: all authenticated users.
 */
export const POST = withAuth(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string | null;

  if (!file) {
    return badRequest('File is required');
  }

  // Convert File to base64 data URI
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await FileService.uploadFile(dataUri, folder || 'accurate-medical/avatars');

  return ok(result);
});
