import { NextRequest } from 'next/server';
import { withRole, parseBody, parseQuery } from '@/lib/api/middleware';
import { CreateTherapySessionSchema } from '@/lib/validations/psych';
import { PsychService } from '@/services/psych.service';
import { ok, created } from '@/lib/api/response';
import { ROLES } from '@/config/roles';
import { buildBranchFilter, verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { AppError } from '@/lib/api/errors';
import { isDeferredModuleEnabled } from '@/lib/config/deferred-modules';
import { z } from 'zod';

const ListQuerySchema = z.object({
  take: z.coerce.number().min(1).max(100).optional().default(50),
});

function assertDeferredEnabled() {
  if (!isDeferredModuleEnabled()) {
    throw new AppError(
      'This module is not included in the current Phase 1 release.',
      'FORBIDDEN',
      403,
    );
  }
}

/**
 * GET /api/v1/psych/sessions
 * DEFERRED — not part of paid Phase 1.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MENTAL_HEALTH, ROLES.DOCTOR],
  async (req: NextRequest, session) => {
    assertDeferredEnabled();
    const { take } = parseQuery(req, ListQuerySchema);
    const branchFilter = buildBranchFilter(session.user);
    const sessions = await PsychService.listSessions(branchFilter.branchId, take);
    return ok(sessions);
  },
);

/**
 * POST /api/v1/psych/sessions
 * DEFERRED — not part of paid Phase 1.
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MENTAL_HEALTH],
  async (req: NextRequest, session) => {
    assertDeferredEnabled();
    const body = await parseBody(req, CreateTherapySessionSchema);
    await verifyPatientAccess(session.user, body.patientId, 'UPDATE');
    const branchFilter = buildBranchFilter(session.user);
    const sessionRecord = await PsychService.createSession(
      body,
      session.user.id,
      session.user.role,
      branchFilter.branchId,
    );
    return created(sessionRecord, 'Therapy session recorded');
  },
);
