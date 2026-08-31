import { z } from 'zod';

/**
 * Generic file upload — body accepted by POST /api/v1/files/upload.
 * `file` must be a base64 data URI (e.g. "data:image/png;base64,...") or a
 * remote URL that Cloudinary can fetch. Kept intentionally simple: the
 * client uploads first to get a `fileUrl`, then persists metadata via the
 * patient documents endpoints below.
 */
export const UploadFileSchema = z.object({
  file: z.string().min(1, 'File is required'),
  folder: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof UploadFileSchema>;

/**
 * Create a Document record for a patient. The file itself has already been
 * uploaded via /api/v1/files/upload — this just persists the resulting URL.
 */
export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  fileUrl: z.string().min(1, 'fileUrl is required'),
  fileType: z.string().min(1, 'fileType is required'),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
