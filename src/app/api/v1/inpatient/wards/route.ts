import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';

/**
 * GET /api/v1/inpatient/wards
 * Ward/room/bed overview, scoped to the caller's branch (SUPER_ADMIN sees
 * every branch's wards). Available to any authenticated staff member —
 * ward occupancy is not itself sensitive clinical/financial data — but
 * PATIENT sessions receive no branch filter from `buildBranchFilter` and
 * therefore fall through to an empty result set here rather than seeing
 * other branches' wards (a PATIENT has no legitimate use for this endpoint).
 */
export const GET = withAuth(async (req, session) => {
  if (session.user.role === 'PATIENT') {
    return ok([]);
  }
  const branchFilter = buildBranchFilter(session.user);
  const wards = await InpatientService.getWardsOverview(branchFilter.branchId);
  return ok(wards);
});
