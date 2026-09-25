import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { PrescriptionService } from '@/services/prescription.service';
import { created } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { verifyVisitAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';

const CreatePrescriptionSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    quantity: z.number().int().positive(),
    instructions: z.string().optional(),
  })).min(1),
});

/**
 * POST /api/v1/visits/:id/prescriptions
 * Create a prescription for a visit.
 * 
 * Authorization: DOCTOR, ADMIN, SUPER_ADMIN
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR],
  async (req, session, ctx: RouteContext) => {
    const visitId = await getParam(ctx, 'id');
    const body = await parseBody(req, CreatePrescriptionSchema);

    await verifyVisitAccess(session.user, visitId, 'UPDATE');
    const prescription = await PrescriptionService.createPrescriptionFromVisit(visitId, body, session.user.id);
    return created(prescription);
  }
);

export const runtime = 'nodejs';