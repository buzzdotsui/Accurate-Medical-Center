import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { PharmacyService } from '@/services/pharmacy.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/pharmacy/prescriptions
 * List all pending and partial prescriptions (the pharmacy work queue).
 *
 * RBAC:
 * - SUPER_ADMIN: See all prescriptions
 * - PHARMACIST, DOCTOR, ADMIN: See prescriptions in their branch only
 *
 * This is an operational staff queue, not a patient-facing endpoint —
 * PATIENT is intentionally excluded. A patient viewing this endpoint
 * previously received every pending prescription in the hospital (across
 * all branches, all patients) because `buildBranchFilter` does not scope
 * PATIENT callers and this service performs no patient-level filtering.
 * Patients see their own prescriptions via their patient profile/timeline.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.ADMIN],
  async (req, session) => {
    const branchFilter = buildBranchFilter(session.user);
    const prescriptions = await PharmacyService.getPendingPrescriptions(branchFilter.branchId);
    return ok(prescriptions);
  }
);
