import { withAuth, parseQuery } from '@/lib/api/middleware';
import { PatientService } from '@/services/patient.service';
import { ok } from '@/lib/api/response';
import { verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { RouteContext, getParam } from '@/lib/utils/route-types';
import { ROLES, CLINICAL_ROLES } from '@/config/roles';
import { z } from 'zod';

const TimelineQuerySchema = z.object({
  take: z.coerce.number().min(1).max(200).optional().default(100),
});

/**
 * GET /api/v1/patients/[id]/timeline
 *
 * Returns an ordered timeline of clinical events for a patient.
 *
 * Data isolation:
 * - DIAGNOSIS events are stripped for non-clinical callers (Admin, Reception,
 *   Accountant, etc.) so that administrative roles can see visit/appointment
 *   history without seeing clinical findings.
 * - SUPER_ADMIN and clinical roles see everything.
 * - PATIENT role sees their own timeline (DIAGNOSIS events included — they are
 *   entitled to their own diagnoses).
 */
export const GET = withAuth(async (req, session, ctx: RouteContext) => {
  const patientId = await getParam(ctx, 'id');

  await verifyPatientAccess(session.user, patientId, 'READ');

  const query = parseQuery(req, TimelineQuerySchema);
  const events = await PatientService.getPatientTimeline(patientId);

  // Non-clinical, non-patient roles should not see DIAGNOSIS events.
  const isClinical =
    session.user.role === ROLES.SUPER_ADMIN ||
    session.user.role === ROLES.PATIENT ||
    (CLINICAL_ROLES as string[]).includes(session.user.role);

  const filtered = isClinical
    ? events
    : events.filter((e) => e.type !== 'DIAGNOSIS');

  return ok(filtered.slice(0, query.take));
});
