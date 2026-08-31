import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api/middleware';
import { prisma } from '@/lib/db/client';
import { ok } from '@/lib/api/response';
import { ROLES } from '@/config/roles';

/**
 * GET /api/v1/laboratory/categories
 * Lookup list of lab test categories, used to populate the lab-request
 * picker in the doctor consultation UI and the lab queue filters.
 *
 * Read-only reference data (no patient/branch data involved), so any
 * clinical/administrative staff role may read it.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.LAB_SCIENTIST],
  async () => {
    const categories = await prisma.labCategory.findMany({ orderBy: { name: 'asc' } });
    return ok(categories);
  }
);
