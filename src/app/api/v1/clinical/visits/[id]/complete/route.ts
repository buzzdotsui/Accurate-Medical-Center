import { NextRequest, NextResponse } from 'next/server';
import { withRole, parseBody, parseQuery, AuthApiHandler } from '@/lib/api/middleware';
import { ClinicalService } from '@/services/clinical.service';
import { ok, created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

const CompleteConsultationSchema = z.object({
  diagnoses: z.array(z.object({
    description: z.string(),
    code: z.string().optional(),
    type: z.enum(['PRIMARY', 'SECONDARY']).default('PRIMARY'),
    notes: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
  treatmentPlan: z.string().optional(),
  vitals: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/v1/clinical/visits/:id/complete
 * Complete a consultation (change visit status to COMPLETED).
 * 
 * Authorization: DOCTOR, ADMIN, SUPER_ADMIN
 */
const completeHandler: AuthApiHandler = async (req, session, ctx: RouteContext) => {
  const visitId = await getParam(ctx, 'id');
  const body = await parseBody(req, CompleteConsultationSchema);

  await verifyVisitAccess(session.user, visitId, 'UPDATE');
  const visit = await ClinicalService.completeConsultation(visitId, body, session.user.id);
  return created(visit);
};

export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR],
  completeHandler
);

export const runtime = 'nodejs';