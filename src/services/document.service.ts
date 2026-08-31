import { prisma } from '@/lib/db/client';
import { AppError } from '@/lib/api/errors';
import { CreateDocumentInput } from '@/lib/validations/document';
import { AuditService } from './audit.service';
import { FileService } from './file.service';
import { logger } from '@/lib/utils/logger';

export interface DocumentAuditContext {
  userId: string;
  userRole: string;
  branchId?: string;
}

export class DocumentService {
  /**
   * List all documents for a patient, most recent first.
   */
  static async listForPatient(patientId: string) {
    return await prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Persist a Document record for a patient. The file itself must already
   * have been uploaded (via FileService/`/api/v1/files/upload`) — this only
   * stores the resulting URL/metadata.
   */
  static async create(patientId: string, data: CreateDocumentInput, ctx: DocumentAuditContext) {
    const document = await prisma.document.create({
      data: {
        patientId,
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        uploadedBy: ctx.userId,
      },
    });

    await AuditService.log({
      userId: ctx.userId,
      userRole: ctx.userRole,
      action: 'DOCUMENT_UPLOADED',
      resource: 'DOCUMENT',
      resourceId: document.id,
      details: { patientId, title: data.title, fileType: data.fileType },
      branchId: ctx.branchId,
    });

    return document;
  }

  /**
   * Delete a Document record, best-effort deleting the underlying Cloudinary
   * asset. Failing to derive/delete the Cloudinary asset never blocks the
   * DB deletion — it's just logged as a warning.
   */
  static async delete(patientId: string, documentId: string, ctx: DocumentAuditContext) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.patientId !== patientId) {
      throw new AppError('Document not found', 'NOT_FOUND', 404);
    }

    const publicId = extractCloudinaryPublicId(document.fileUrl);
    if (publicId) {
      try {
        await FileService.deleteFile(publicId);
      } catch (error) {
        logger.warn('Failed to delete underlying Cloudinary asset for document', {
          documentId,
          publicId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      logger.warn('Could not derive Cloudinary publicId from document fileUrl — underlying asset was not removed', {
        documentId,
        fileUrl: document.fileUrl,
      });
    }

    await prisma.document.delete({ where: { id: documentId } });

    await AuditService.log({
      userId: ctx.userId,
      userRole: ctx.userRole,
      action: 'DOCUMENT_DELETED',
      resource: 'DOCUMENT',
      resourceId: documentId,
      details: { patientId, title: document.title },
      branchId: ctx.branchId,
    });

    return document;
  }
}

/**
 * Best-effort extraction of a Cloudinary public_id from a delivery URL, e.g.
 * "https://res.cloudinary.com/<cloud>/image/upload/v1700000000/folder/name.png"
 * -> "folder/name"
 *
 * Returns null if the URL doesn't look like a Cloudinary delivery URL —
 * callers must treat that as "cannot clean up the remote asset" rather than
 * an error, since the Document model does not store the publicId directly.
 */
function extractCloudinaryPublicId(fileUrl: string): string | null {
  const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  if (!match || !match[1]) return null;
  return match[1];
}
