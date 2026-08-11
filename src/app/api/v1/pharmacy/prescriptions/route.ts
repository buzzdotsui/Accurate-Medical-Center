import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';

/**
 * GET /api/v1/pharmacy/prescriptions
 * List all pending and partial prescriptions
 */
export const GET = withAuth(async () => {
  const prescriptions = await PharmacyService.getPendingPrescriptions();
  return ok(prescriptions);
});
