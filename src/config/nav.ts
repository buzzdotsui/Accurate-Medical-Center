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
 */
export const navConfig: Record<Role, NavItem[]> = {
  [ROLES.SUPER_ADMIN]: [
    { title: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
    { title: 'Patients', href: '/admin/patients', icon: 'users' },
    { title: 'Staff', href: '/admin/staff', icon: 'user-cog' },
    { title: 'Appointments', href: '/admin/appointments', icon: 'calendar-check' },
    { title: 'Pharmacy', href: '/admin/pharmacy', icon: 'pill' },
    { title: 'Laboratory', href: '/admin/laboratory', icon: 'flask-conical' },
    { title: 'Radiology', href: '/admin/radiology', icon: 'scan' },
    { title: 'Finance', href: '/admin/finance', icon: 'banknote' },
    { title: 'Settings', href: '/admin/settings', icon: 'settings' },
  ],

  [ROLES.ADMIN]: [
    { title: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
    { title: 'Patients', href: '/admin/patients', icon: 'users' },
    { title: 'Staff', href: '/admin/staff', icon: 'user-cog' },
    { title: 'Appointments', href: '/admin/appointments', icon: 'calendar-check' },
    { title: 'Settings', href: '/admin/settings', icon: 'settings' },
  ],

  [ROLES.DOCTOR]: [
    { title: 'Dashboard', href: '/doctor', icon: 'layout-dashboard' },
    { title: 'My Patients', href: '/doctor/patients', icon: 'users' },
    { title: 'Appointments', href: '/doctor/appointments', icon: 'calendar-check' },
    { title: 'Consultations', href: '/doctor/consultations', icon: 'stethoscope' },
    { title: 'Prescriptions', href: '/doctor/prescriptions', icon: 'pill' },
    { title: 'Lab Requests', href: '/doctor/lab-requests', icon: 'flask-conical' },
    { title: 'Radiology', href: '/doctor/radiology', icon: 'scan' },
  ],

  [ROLES.NURSE]: [
    { title: 'Dashboard', href: '/nurse', icon: 'layout-dashboard' },
    { title: 'Patients', href: '/nurse/patients', icon: 'users' },
    { title: 'Vitals & Triage', href: '/nurse/vitals', icon: 'activity' },
    { title: 'Ward Management', href: '/nurse/ward', icon: 'bed' },
    { title: 'Medications', href: '/nurse/medications', icon: 'pill' },
  ],

  [ROLES.RECEPTIONIST]: [
    { title: 'Dashboard', href: '/receptionist', icon: 'layout-dashboard' },
    { title: 'Register Patient', href: '/receptionist/register', icon: 'user-plus' },
    { title: 'Appointments', href: '/receptionist/appointments', icon: 'calendar-check' },
    { title: 'Queue Management', href: '/receptionist/queue', icon: 'list-ordered' },
    { title: 'Billing', href: '/receptionist/billing', icon: 'receipt' },
  ],

  [ROLES.PHARMACIST]: [
    { title: 'Dashboard', href: '/pharmacist', icon: 'layout-dashboard' },
    { title: 'Prescriptions', href: '/pharmacist/prescriptions', icon: 'pill' },
    { title: 'Dispense', href: '/pharmacist/dispense', icon: 'package-check' },
    { title: 'Inventory', href: '/pharmacist/inventory', icon: 'package' },
    { title: 'Purchase Orders', href: '/pharmacist/orders', icon: 'truck' },
  ],

  [ROLES.LAB_SCIENTIST]: [
    { title: 'Dashboard', href: '/lab', icon: 'layout-dashboard' },
    { title: 'Pending Requests', href: '/lab/requests', icon: 'clipboard-list' },
    { title: 'Samples', href: '/lab/samples', icon: 'droplets' },
    { title: 'Enter Results', href: '/lab/results', icon: 'flask-conical' },
  ],

  [ROLES.RADIOGRAPHER]: [
    { title: 'Dashboard', href: '/radiology', icon: 'layout-dashboard' },
    { title: 'Scan Requests', href: '/radiology/requests', icon: 'scan' },
    { title: 'Draft Reports', href: '/radiology/reports', icon: 'file-medical' },
    { title: 'Image Archive', href: '/radiology/archive', icon: 'archive' },
  ],

  [ROLES.ACCOUNTANT]: [
    { title: 'Dashboard', href: '/finance', icon: 'layout-dashboard' },
    { title: 'Invoices', href: '/finance/invoices', icon: 'receipt' },
    { title: 'Payments', href: '/finance/payments', icon: 'credit-card' },
    { title: 'Expenses', href: '/finance/expenses', icon: 'trending-down' },
    { title: 'Financial Reports', href: '/finance/reports', icon: 'bar-chart-3' },
  ],

  [ROLES.THEATRE_STAFF]: [
    { title: 'Dashboard', href: '/theatre', icon: 'layout-dashboard' },
    { title: 'Surgical Schedule', href: '/theatre/schedule', icon: 'calendar' },
    { title: 'Patient Prep', href: '/theatre/prep', icon: 'check-square' },
    { title: 'Post-Op Recovery', href: '/theatre/recovery', icon: 'bed' },
  ],

  [ROLES.MATERNAL_STAFF]: [
    { title: 'Dashboard', href: '/maternal', icon: 'layout-dashboard' },
    { title: 'ANC Visits', href: '/maternal/anc', icon: 'baby' },
    { title: 'Deliveries', href: '/maternal/deliveries', icon: 'activity' },
    { title: 'Postnatal Care', href: '/maternal/postnatal', icon: 'heart' },
  ],

  [ROLES.MENTAL_HEALTH]: [
    { title: 'Dashboard', href: '/psych', icon: 'layout-dashboard' },
    { title: 'Assessments', href: '/psych/assessments', icon: 'brain' },
    { title: 'Therapy Sessions', href: '/psych/sessions', icon: 'users' },
    { title: 'Recovery Tracking', href: '/psych/recovery', icon: 'line-chart' },
  ],

  [ROLES.AMBULANCE]: [
    { title: 'Dashboard', href: '/ambulance', icon: 'layout-dashboard' },
    { title: 'Dispatch Requests', href: '/ambulance/requests', icon: 'radio' },
    { title: 'Fleet Status', href: '/ambulance/fleet', icon: 'truck' },
  ],

  [ROLES.PATIENT]: [
    { title: 'Dashboard', href: '/patient', icon: 'layout-dashboard' },
    { title: 'My Appointments', href: '/patient/appointments', icon: 'calendar-check' },
    { title: 'Medical Records', href: '/patient/records', icon: 'file-medical' },
    { title: 'Lab Results', href: '/patient/lab-results', icon: 'flask-conical' },
    { title: 'Prescriptions', href: '/patient/prescriptions', icon: 'pill' },
    { title: 'Bills', href: '/patient/billing', icon: 'receipt' },
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
  RECEPTIONIST: '/receptionist',
  PHARMACIST: '/pharmacist',
  LAB_SCIENTIST: '/lab',
  RADIOGRAPHER: '/radiology',
  ACCOUNTANT: '/finance',
  THEATRE_STAFF: '/theatre',
  MATERNAL_STAFF: '/maternal',
  MENTAL_HEALTH: '/psych',
  AMBULANCE: '/ambulance',
  PATIENT: '/patient',
};
