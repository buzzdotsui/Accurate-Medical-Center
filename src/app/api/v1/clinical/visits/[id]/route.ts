import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { ClinicalService } from '@/services/clinical.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/clinical/visits/:id
 * Full visit detail (patient summary, diagnoses, prescriptions, lab/rad
 * requests) used by the vitals-entry screen and the consultation room.
 *
 * Authorization: `verifyVisitAccess` enforces branch isolation for staff
 * and restricts patients to their own visits.
 */
export const GET = withAuth(async (req, session, ctx: RouteContext) => {
  const visitId = await getParam(ctx, 'id');
  await verifyVisitAccess(session.user, visitId, 'READ');
  const visit = await ClinicalService.getVisitDetails(visitId);
  return ok(visit);
});
