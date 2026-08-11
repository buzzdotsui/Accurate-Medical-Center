import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const wards = await InpatientService.getWardsOverview();
  return ok(wards);
});
