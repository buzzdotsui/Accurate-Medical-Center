import { withRole, parseBody } from '@/lib/api/middleware';
import { FileService } from '@/services/file.service';
import { ok } from '@/lib/api/response';
import { STAFF_ROLES } from '@/config/roles';
import { UploadFileSchema } from '@/lib/validations/document';

/**
 * POST /api/v1/files/upload
 * Generic, authenticated file upload endpoint. Uploads a base64 data URI (or
 * remote URL) to Cloudinary via `FileService` and returns the resulting
 * asset metadata. This is the ONLY place uploads happen server-side —
 * Cloudinary credentials/env vars are never exposed to the client.
 *
 * Authorization: staff roles only (not PATIENT). Callers use the returned
 * `url` to persist metadata elsewhere (e.g. `POST /api/v1/patients/:id/documents`).
 */
export const POST = withRole(STAFF_ROLES, async (req) => {
  const { file, folder } = await parseBody(req, UploadFileSchema);

  const result = await FileService.uploadFile(file, folder);

  return ok(result);
});
