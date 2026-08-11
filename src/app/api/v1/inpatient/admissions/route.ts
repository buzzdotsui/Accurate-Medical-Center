import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { InpatientService } from '@/services/inpatient.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const admissions = await InpatientService.getActiveAdmissions();
  return ok(admissions);
});
