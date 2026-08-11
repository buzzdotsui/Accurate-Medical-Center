import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { DispensePrescriptionSchema } from '@/lib/validations/pharmacy';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';

/**
 * PATCH /api/v1/pharmacy/prescriptions/:id/dispense
 * Update status of a prescription to DISPENSED
 */
export const POST = withAuth(async (req, session, ctx: RouteContext) => {
  const prescriptionId = await getParam(ctx, 'id');
  const body = await parseBody(req, DispensePrescriptionSchema);
  const result = await PharmacyService.dispensePrescription(prescriptionId, body, session.user.id);
  return ok(result, { message: 'Prescription dispensed successfully' });
});
