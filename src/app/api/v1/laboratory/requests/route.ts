import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { LaboratoryService } from '@/services/laboratory.service';
import { ok } from '@/lib/api/response';

/**
 * GET /api/v1/laboratory/requests
 * List all active lab requests
 */
export const GET = withAuth(async () => {
  const requests = await LaboratoryService.getActiveRequests();
  return ok(requests);
});
