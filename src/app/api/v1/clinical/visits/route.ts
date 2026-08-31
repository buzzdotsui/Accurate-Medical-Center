import { NextRequest } from 'next/server';
import { withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { StartVisitSchema } from '@/lib/validations/clinical';
import { ClinicalService } from '@/services/clinical.service';
import { created, ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

const ListVisitsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
  status: z.string().optional(),
  hasVitals: z.coerce.boolean().optional(),
  mine: z.coerce.boolean().optional(),
});

/**
 * GET /api/v1/clinical/visits
 * List visits for the operational queues (nurse triage queue, doctor
 * queue). Scoped to the caller's branch. When `mine=true` and the caller
 * is a DOCTOR, results are further restricted to visits assigned to that
 * doctor (their own `Staff.id`, resolved server-side — never a
 * client-supplied doctorId).
 *
 * Authorization: NURSE, DOCTOR, RECEPTIONIST, ADMIN, SUPER_ADMIN. This is
 * an operational staff queue; PATIENT is intentionally excluded (patients
 * see their own visits via their profile/timeline).
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NURSE, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  async (req: NextRequest, session) => {
    const query = parseQuery(req, ListVisitsQuerySchema);
    const branchFilter = buildBranchFilter(session.user);

    let doctorId: string | undefined;
    if (query.mine && session.user.role === ROLES.DOCTOR) {
      const staff = await prisma.staff.findUnique({ where: { userId: session.user.id }, select: { id: true } });
      doctorId = staff?.id;
    }

    const result = await ClinicalService.listVisits({
      skip: query.skip,
      take: query.take,
      status: query.status,
      hasVitals: query.hasVitals,
      doctorId,
      branchId: branchFilter.branchId,
    });
    return ok(result);
  }
);

/**
 * POST /api/v1/clinical/visits
 * Start a new clinical visit for a patient (check-in at triage/front desk
 * or directly by a clinician).
 *
 * Authorization: RECEPTIONIST (check-in), NURSE (triage), DOCTOR
 * (starting a consult), ADMIN/SUPER_ADMIN.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE, ROLES.DOCTOR],
  async (req: NextRequest, session) => {
    const body = await parseBody(req, StartVisitSchema);
    const visit = await ClinicalService.startVisit(body, session.user.id, session.user.role);
    return created(visit);
  }
);
