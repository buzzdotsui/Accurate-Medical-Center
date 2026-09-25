import { NextRequest, NextResponse } from 'next/server';
import { withRole, parseBody, parseQuery, AuthApiHandler } from '@/lib/api/middleware';
import { ClinicalService } from '@/services/clinical.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

const StartConsultationSchema = z.object({
  chiefComplaint: z.string().optional(),
  vitals: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/v1/clinical/visits/:id/start
 * Start a consultation (change visit status to IN_PROGRESS).
 * 
 * Authorization: DOCTOR, NURSE, ADMIN, SUPER_ADMIN
 */
const startHandler: AuthApiHandler = async (req, session, ctx: RouteContext) => {
  const visitId = await getParam(ctx, 'id');
  const body = await parseBody(req, StartConsultationSchema);

  await verifyVisitAccess(session.user, visitId, 'UPDATE');
  const visit = await ClinicalService.startConsultation(visitId, body, session.user.id);
  return created(visit);
};

export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE],
  startHandler
);

export const runtime = 'nodejs';