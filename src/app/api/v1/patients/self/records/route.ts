import { NextRequest } from 'next/server';
import { withAuth, parseQuery } from '@/lib/api/middleware';
import { ClinicalService } from '@/services/clinical.service';
import { ok } from '@/lib/api/response';
import { z } from 'zod';
import { ROLES } from '@/config/roles';
import { buildBranchFilter, verifyPatientAccess } from '@/lib/auth/resource-authorization';
import { PatientService } from '@/services/patient.service';

const ListSelfRecordsQuerySchema = z.object({
  skip: z.coerce.number().min(0).optional().default(0),
  take: z.coerce.number().min(1).max(100).optional().default(50),
});

/**
 * GET /api/v1/patients/self/records
 * List the authenticated patient's clinical records (visits).
 * 
 * Authorization: PATIENT only (self-access)
 */
export const GET = withAuth(async (req, session) => {
  const query = parseQuery(req, ListSelfRecordsQuerySchema);

  // Ensure patient profile exists
  const patient = await PatientService.ensureSelfProfile(session.user);

  const branchFilter = buildBranchFilter(session.user);
  const result = await ClinicalService.listVisits({
    skip: query.skip,
    take: query.take,
    patientId: patient.id,
    branchId: branchFilter.branchId,
  });

  return ok(result);
});

export const runtime = 'nodejs';