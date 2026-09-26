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
 * Phase 1 commercial scope: Patients, Staff, Doctors, Appointments,
 * Medical Records, Administrative Records, Dashboard/Operations,
 * Profiles, Settings, Authentication/RBAC.
 *
 * Future modules (Pharmacy, Laboratory, Radiology, Finance, Billing,
 * Lab Results) and their specialist roles are preserved in the codebase
 * but hidden from the active Phase 1 navigation.
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

  // Future Phase roles - preserved but not in active Phase 1 navigation
  [ROLES.PHARMACIST]: [],
  [ROLES.LAB_SCIENTIST]: [],
  [ROLES.RADIOGRAPHER]: [],
  [ROLES.ACCOUNTANT]: [],

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
  ],
};

/**
 * Role-to-dashboard-root mapping.
 * Used after login to redirect user to their home dashboard.
 *
 * Future Phase roles (PHARMACIST, LAB_SCIENTIST, RADIOGRAPHER, ACCOUNTANT)
 * are not part of active Phase 1 but their routes are preserved.
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
