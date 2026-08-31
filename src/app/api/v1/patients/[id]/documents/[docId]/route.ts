import { withAuth } from '@/lib/api/middleware';
import { DocumentService } from '@/services/document.service';
import { ok } from '@/lib/api/response';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * DELETE /api/v1/patients/:id/documents/:docId
 * Delete a Document record (and best-effort the underlying Cloudinary asset).
 *
 * Authorization: staff in the patient's branch, or the patient themselves,
 * via `verifyPatientAccess`. `DocumentService.delete` additionally verifies
 * the document actually belongs to the given patientId (404 otherwise).
 */
export const DELETE = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');
  const docId = await getParam(ctx, 'docId');

  const patient = await verifyPatientAccess(session.user, patientId, 'UPDATE');

  await DocumentService.delete(patientId, docId, {
    userId: session.user.id,
    userRole: session.user.role,
    branchId: patient.branchId,
  });

  return ok({ id: docId, deleted: true });
});
