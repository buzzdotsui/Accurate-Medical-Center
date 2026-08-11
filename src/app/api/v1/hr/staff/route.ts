import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { HrService } from '@/services/hr.service';
import { ok } from '@/lib/api/response';

export const GET = withAuth(async () => {
  const staff = await HrService.getStaffDirectory();
  return ok(staff);
});
