import { NextRequest } from 'next/server';
import { withRole, parseBody } from '@/lib/api/middleware';
import { DispensePrescriptionSchema } from '@/lib/validations/pharmacy';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES } from '@/config/roles';
import { verifyPrescriptionAccess } from '@/lib/auth/resource-authorization';

/**
 * POST /api/v1/pharmacy/prescriptions/:id/dispense
 * Update status of a prescription to DISPENSED.
 *
 * Authorization: PHARMACIST or SUPER_ADMIN only. Previously open to any
 * authenticated user (including PATIENT), allowing anyone to mark their
 * own or another patient's prescription as dispensed.
 */
export const POST = withRole([ROLES.SUPER_ADMIN, ROLES.PHARMACIST], async (req, session, ctx: RouteContext) => {
  const prescriptionId = await getParam(ctx, 'id');
  await verifyPrescriptionAccess(session.user, prescriptionId, 'UPDATE');
  const body = await parseBody(req, DispensePrescriptionSchema);
  const result = await PharmacyService.dispensePrescription(prescriptionId, body, session.user.id);
  return ok(result, { message: 'Prescription dispensed successfully' });
});
