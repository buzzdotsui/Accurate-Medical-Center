import { prisma } from '@/lib/db/client';
import { ROLES, type Role } from '@/config/roles';

export type SearchResultType = 'PATIENT' | 'STAFF' | 'APPOINTMENT' | 'INVOICE';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  displayId: string;
  title: string;
  subtitle: string;
  /** Present only when the requesting role has a real page to view this
   * record on. Absent (not fabricated) when no such page exists yet. */
  url?: string;
}

/**
 * Roles allowed to search each entity type. This is deliberately
 * conservative:
 * - Every staff role can search Patients and Appointments (needed for
 *   day-to-day clinical/front-desk work), branch-scoped.
 * - Staff directory (Staff) and financial records (Invoice) are
 *   administrative/financial and restricted to ADMIN/SUPER_ADMIN
 *   (Invoice additionally to ACCOUNTANT).
 * - PATIENT gets no entity types at all — see `SearchService.search`.
 */
const ENTITY_ROLES: Record<SearchResultType, Role[]> = {
  PATIENT: [
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST,
    ROLES.PHARMACIST, ROLES.LAB_SCIENTIST, ROLES.RADIOGRAPHER, ROLES.ACCOUNTANT,
    ROLES.THEATRE_STAFF, ROLES.MATERNAL_STAFF, ROLES.MENTAL_HEALTH,
  ],
  APPOINTMENT: [
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST,
  ],
  STAFF: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  INVOICE: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
};

/** Where a result of this type can actually be viewed, per role. Only
 * populated when a real page exists — never a fabricated/dead link. */
function resolveUrl(type: SearchResultType, id: string, role: Role): string | undefined {
  switch (type) {
    case 'PATIENT':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN ? `/admin/patients/${id}` : undefined;
    case 'STAFF':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN ? `/admin/staff` : undefined;
    case 'APPOINTMENT':
      if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) return `/admin/appointments`;
      if (role === ROLES.RECEPTIONIST) return `/reception/appointments`;
      return undefined;
    case 'INVOICE':
      return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.ACCOUNTANT
        ? `/billing/invoices/${id}`
        : undefined;
    default:
      return undefined;
  }
}

export class SearchService {
  /**
   * Global search across the entities the caller's role is permitted to
   * see, scoped to their branch (SUPER_ADMIN searches every branch).
   *
   * Security invariants:
   * - PATIENT sessions always get an empty result set — a patient must
   *   never be able to search the hospital's patient/staff/appointment/
   *   invoice records, including their own via this endpoint (they have a
   *   dedicated, scoped profile/timeline for that).
   * - Every other role only ever sees rows within their own branch (via
   *   `branchId`), never cross-branch data, and only entity types their
   *   role is explicitly allowed to search (`ENTITY_ROLES`).
   * - Results never include password/auth fields — only the specific
   *   display fields selected below are read from the database.
   */
  static async search(params: { query: string; role: Role; branchId?: string; take?: number }): Promise<SearchResult[]> {
    const { query, role, branchId, take = 8 } = params;
    const q = query.trim();

    if (role === ROLES.PATIENT || q.length < 2) {
      return [];
    }

    const perTypeTake = Math.max(1, Math.ceil(take / 4));
    const results: SearchResult[] = [];

    const canSearch = (type: SearchResultType) => ENTITY_ROLES[type].includes(role);

    if (canSearch('PATIENT')) {
      const patients = await prisma.patient.findMany({
        where: {
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
          OR: [
            { patientId: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        },
        select: { id: true, patientId: true, firstName: true, lastName: true, phone: true, email: true },
        take: perTypeTake,
      });
      for (const p of patients) {
        results.push({
          type: 'PATIENT',
          id: p.id,
          displayId: p.patientId,
          title: `${p.firstName} ${p.lastName}`,
          subtitle: [p.patientId, p.phone, p.email].filter(Boolean).join(' · '),
          url: resolveUrl('PATIENT', p.id, role),
        });
      }
    }

    if (canSearch('STAFF')) {
      const staff = await prisma.staff.findMany({
        where: {
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
          OR: [
            { staffId: { contains: q, mode: 'insensitive' } },
            { user: { name: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { specialization: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, staffId: true, specialization: true, user: { select: { name: true, email: true, role: true } } },
        take: perTypeTake,
      });
      for (const s of staff) {
        results.push({
          type: 'STAFF',
          id: s.id,
          displayId: s.staffId,
          title: s.user.name,
          subtitle: [s.staffId, s.user.role, s.user.email].filter(Boolean).join(' · '),
          url: resolveUrl('STAFF', s.id, role),
        });
      }
    }

    if (canSearch('APPOINTMENT')) {
      const appointments = await prisma.appointment.findMany({
        where: {
          ...(branchId ? { branchId } : {}),
          OR: [
            { appointmentId: { contains: q, mode: 'insensitive' } },
            { reason: { contains: q, mode: 'insensitive' } },
            { patient: { firstName: { contains: q, mode: 'insensitive' } } },
            { patient: { lastName: { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true, appointmentId: true, date: true, status: true,
          patient: { select: { firstName: true, lastName: true } },
        },
        take: perTypeTake,
        orderBy: { date: 'desc' },
      });
      for (const a of appointments) {
        results.push({
          type: 'APPOINTMENT',
          id: a.id,
          displayId: a.appointmentId,
          title: `${a.patient.firstName} ${a.patient.lastName}`,
          subtitle: `${a.appointmentId} · ${a.status} · ${new Date(a.date).toLocaleDateString()}`,
          url: resolveUrl('APPOINTMENT', a.id, role),
        });
      }
    }

    if (canSearch('INVOICE')) {
      const invoices = await prisma.invoice.findMany({
        where: {
          ...(branchId ? { branchId } : {}),
          OR: [
            { invoiceId: { contains: q, mode: 'insensitive' } },
            { patient: { firstName: { contains: q, mode: 'insensitive' } } },
            { patient: { lastName: { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true, invoiceId: true, status: true, totalAmount: true,
          patient: { select: { firstName: true, lastName: true } },
        },
        take: perTypeTake,
        orderBy: { createdAt: 'desc' },
      });
      for (const inv of invoices) {
        results.push({
          type: 'INVOICE',
          id: inv.id,
          displayId: inv.invoiceId,
          title: `${inv.patient.firstName} ${inv.patient.lastName}`,
          subtitle: `${inv.invoiceId} · ${inv.status} · ${Number(inv.totalAmount).toLocaleString()}`,
          url: resolveUrl('INVOICE', inv.id, role),
        });
      }
    }

    return results.slice(0, take);
  }
}
