import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/middleware';
import { DispensePrescriptionSchema } from '@/lib/validations/pharmacy';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';

/**
 * PATCH /api/v1/pharmacy/prescriptions/:id/dispense
 * Update status of a prescription to DISPENSED
 */
export const POST = withAuth(async (req, session, ctx: any) => {
  const params = await ctx.params;
  const body = await parseBody(req, DispensePrescriptionSchema);
  const result = await PharmacyService.dispensePrescription(params.id, body, session.user.id);
  return ok(result, { message: 'Prescription dispensed successfully' });
});
