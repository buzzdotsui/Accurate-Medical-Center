import { type Role, ROLES } from './roles';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
  description?: string;
}

/**
 * Navigation structure per role. Each role gets its own sidebar
 * navigation tree. Items are rendered in order.
 *
 * Phase 1 commercial scope (invoice TTI/2026/HMS-P1-002):
 * auth, patients, staff, appointments, records, operational dashboards,
 * settings. Future modules (pharmacy, laboratory, radiology, finance,
 * billing, lab results) are preserved in code but hidden from Phase 1 UI.
 */
export const navConfig: Record<Role, NavItem[]> = {
  [ROLES.SUPER_ADMIN]: [
    { title: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
    { title: 'Patients', href: '/admin/patients', icon: 'users' },
    { title: 'Staff', href: '/admin/staff', icon: 'user-cog' },
    { title: 'Appointments', href: '/admin/appointments', icon: 'calendar-check' },
    { title: 'Settings', href: '/settings', icon: 'settings' },
  ],

  [ROLES.ADMIN]: [
    { title: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
    { title: 'Patients', href: '/admin/patients', icon: 'users' },
    { title: 'Staff', href: '/admin/staff', icon: 'user-cog' },
    { title: 'Appointments', href: '/admin/appointments', icon: 'calendar-check' },
    { title: 'Settings', href: '/settings', icon: 'settings' },
  ],

  [ROLES.DOCTOR]: [
    { title: 'Dashboard', href: '/doctor', icon: 'layout-dashboard' },
    { title: 'Clinical Queue', href: '/doctor/queue', icon: 'list-ordered' },
    { title: 'My Patients', href: '/doctor/patients', icon: 'users' },
    { title: 'Prescriptions', href: '/doctor/prescriptions', icon: 'pill' },
  ],

  [ROLES.NURSE]: [
    { title: 'Dashboard', href: '/nurse', icon: 'layout-dashboard' },
    { title: 'Triage Queue', href: '/nurse/queue', icon: 'list-ordered' },
    { title: 'Ward Management', href: '/nurse/ward', icon: 'bed' },
  ],

  [ROLES.RECEPTIONIST]: [
    { title: 'Dashboard', href: '/reception', icon: 'layout-dashboard' },
    { title: 'Register Patient', href: '/reception/patients/new', icon: 'user-plus' },
    { title: 'Appointments', href: '/reception/appointments', icon: 'calendar-check' },
    { title: 'Patients', href: '/reception/patients', icon: 'users' },
  ],

  // Future Phase 1+ roles — preserved but not exposed in active Phase 1 navigation
  [ROLES.PHARMACIST]: [
    { title: 'Dashboard', href: '/pharmacy', icon: 'layout-dashboard' },
    { title: 'Prescriptions', href: '/pharmacy/prescriptions', icon: 'pill' },
    { title: 'Inventory', href: '/pharmacy/inventory', icon: 'package' },
  ],

  [ROLES.LAB_SCIENTIST]: [
    { title: 'Dashboard', href: '/laboratory', icon: 'layout-dashboard' },
    { title: 'Lab Requests', href: '/laboratory/requests', icon: 'clipboard-list' },
  ],

  [ROLES.RADIOGRAPHER]: [
    { title: 'Dashboard', href: '/radiology', icon: 'layout-dashboard' },
    { title: 'Scan Requests', href: '/radiology/requests', icon: 'scan' },
  ],

  [ROLES.ACCOUNTANT]: [
    { title: 'Dashboard', href: '/billing', icon: 'layout-dashboard' },
    { title: 'Invoices', href: '/billing/invoices', icon: 'receipt' },
  ],

  // Deferred specialty roles: dashboard root only (no unfinished sub-flows in nav).
  [ROLES.THEATRE_STAFF]: [
    { title: 'Dashboard', href: '/theatre', icon: 'layout-dashboard' },
  ],

  [ROLES.MATERNAL_STAFF]: [
    { title: 'Dashboard', href: '/maternal', icon: 'layout-dashboard' },
  ],

  [ROLES.MENTAL_HEALTH]: [
    { title: 'Dashboard', href: '/psych', icon: 'layout-dashboard' },
  ],

  [ROLES.AMBULANCE]: [
    { title: 'Dashboard', href: '/ambulance', icon: 'layout-dashboard' },
  ],

  [ROLES.PATIENT]: [
    { title: 'Dashboard', href: '/patient', icon: 'layout-dashboard' },
    { title: 'My Appointments', href: '/patient/appointments', icon: 'calendar-check' },
    { title: 'Medical Records', href: '/patient/records', icon: 'file-medical' },
    { title: 'Prescriptions', href: '/patient/prescriptions', icon: 'pill' },
  ],
};

/**
 * Role-to-dashboard-root mapping.
 * Used after login to redirect user to their home dashboard.
 */
export const ROLE_DASHBOARD_ROOTS: Record<Role, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  NURSE: '/nurse',
  RECEPTIONIST: '/reception',
  PHARMACIST: '/pharmacy',
  LAB_SCIENTIST: '/laboratory',
  RADIOGRAPHER: '/radiology',
  ACCOUNTANT: '/billing',
  THEATRE_STAFF: '/theatre',
  MATERNAL_STAFF: '/maternal',
  MENTAL_HEALTH: '/psych',
  AMBULANCE: '/ambulance',
  PATIENT: '/patient',
};
