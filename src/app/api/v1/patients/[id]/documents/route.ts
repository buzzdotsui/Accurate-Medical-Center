import { withAuth, parseBody } from '@/lib/api/middleware';
import { DocumentService } from '@/services/document.service';
import { ok, created } from '@/lib/api/response';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { CreateDocumentSchema } from '@/lib/validations/document';

/**
 * GET /api/v1/patients/:id/documents
 * List all documents for a patient.
 *
 * Authorization: staff in the patient's branch, or the patient themselves,
 * via `verifyPatientAccess` (branch isolation + patient self-access).
 */
export const GET = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');
  await verifyPatientAccess(session.user, patientId, 'READ');

  const documents = await DocumentService.listForPatient(patientId);
  return ok(documents);
});

/**
 * POST /api/v1/patients/:id/documents
 * Persist a Document record for a patient. The file must already have been
 * uploaded via `POST /api/v1/files/upload` — this only stores the resulting
 * `fileUrl`/metadata, avoiding a giant base64 payload going through
 * validation twice.
 *
 * Authorization: staff in the patient's branch, or the patient themselves,
 * via `verifyPatientAccess`.
 */
export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');
  const patient = await verifyPatientAccess(session.user, patientId, 'UPDATE');

  const body = await parseBody(req, CreateDocumentSchema);

  const document = await DocumentService.create(patientId, body, {
    userId: session.user.id,
    userRole: session.user.role,
    branchId: patient.branchId,
  });

  return created(document, 'Document uploaded successfully');
});
