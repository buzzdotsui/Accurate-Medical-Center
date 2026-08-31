import { NextRequest } from 'next/server';
import { withAuth, parseQuery } from '@/lib/api/middleware';
import { SearchService } from '@/services/search.service';
import { ok } from '@/lib/api/response';
import { buildBranchFilter } from '@/lib/auth/resource-authorization';
import type { Role } from '@/config/roles';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  q: z.string().max(200).optional().default(''),
  take: z.coerce.number().min(1).max(20).optional().default(8),
});

/**
 * GET /api/v1/search?q=...&take=8
 * Global search across patients, staff, appointments, and invoices.
 *
 * Security: authenticated (`withAuth`) + role/branch-scoped inside
 * `SearchService.search` (see that file for the full authorization
 * rationale). PATIENT sessions always receive an empty result set — a
 * patient must never be able to search the hospital's records via this
 * endpoint. Every other role is restricted to their own branch (SUPER_ADMIN
 * searches across all branches) and only to the entity types their role is
 * permitted to view.
 */
export const GET = withAuth(async (req, session) => {
  const { q, take } = parseQuery(req, SearchQuerySchema);
  const branchFilter = buildBranchFilter(session.user);
  const results = await SearchService.search({
    query: q,
    role: session.user.role as Role,
    branchId: branchFilter.branchId,
    take,
  });
  return ok(results);
});
