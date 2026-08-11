/**
 * Role & permission constants — the authoritative list of all roles
 * and their human-readable metadata. Used by auth, nav, and RBAC.
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  LAB_SCIENTIST: 'LAB_SCIENTIST',
  RADIOGRAPHER: 'RADIOGRAPHER',
  ACCOUNTANT: 'ACCOUNTANT',
  THEATRE_STAFF: 'THEATRE_STAFF',
  MATERNAL_STAFF: 'MATERNAL_STAFF',
  MENTAL_HEALTH: 'MENTAL_HEALTH',
  AMBULANCE: 'AMBULANCE',
  PATIENT: 'PATIENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Hospital Administrator',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  PHARMACIST: 'Pharmacist',
  LAB_SCIENTIST: 'Laboratory Scientist',
  RADIOGRAPHER: 'Radiographer',
  ACCOUNTANT: 'Accountant',
  THEATRE_STAFF: 'Theatre Staff',
  MATERNAL_STAFF: 'Maternal Care Staff',
  MENTAL_HEALTH: 'Mental Health Specialist',
  AMBULANCE: 'Ambulance Personnel',
  PATIENT: 'Patient',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: 'Full system access across all branches',
  ADMIN: 'Branch-level administrative access',
  DOCTOR: 'Clinical consultation, prescriptions, and patient management',
  NURSE: 'Patient care, vitals, and ward management',
  RECEPTIONIST: 'Patient registration, appointments, and front desk',
  PHARMACIST: 'Pharmacy stock, dispensing, and prescriptions',
  LAB_SCIENTIST: 'Laboratory tests, samples, and results',
  RADIOGRAPHER: 'X-Ray, ultrasound scans, and radiology reports',
  ACCOUNTANT: 'Billing, invoices, payments, and financial reports',
  THEATRE_STAFF: 'Surgical and operating theatre management',
  MATERNAL_STAFF: 'Antenatal, delivery, and postnatal care',
  MENTAL_HEALTH: 'Psychological therapy and addiction recovery',
  AMBULANCE: 'Emergency dispatch and medical transport',
  PATIENT: 'Self-service portal — view own records and appointments',
};

export const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-indigo-100 text-indigo-800',
  DOCTOR: 'bg-lemon-100 text-lemon-800',
  NURSE: 'bg-green-100 text-green-800',
  RECEPTIONIST: 'bg-blue-100 text-blue-800',
  PHARMACIST: 'bg-amber-100 text-amber-800',
  LAB_SCIENTIST: 'bg-orange-100 text-orange-800',
  RADIOGRAPHER: 'bg-cyan-100 text-cyan-800',
  ACCOUNTANT: 'bg-green-100 text-green-800',
  THEATRE_STAFF: 'bg-red-100 text-red-800',
  MATERNAL_STAFF: 'bg-pink-100 text-pink-800',
  MENTAL_HEALTH: 'bg-violet-100 text-violet-800',
  AMBULANCE: 'bg-yellow-100 text-yellow-800',
  PATIENT: 'bg-grey-100 text-grey-800',
};

export const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.RECEPTIONIST,
  ROLES.PHARMACIST,
  ROLES.LAB_SCIENTIST,
  ROLES.RADIOGRAPHER,
  ROLES.ACCOUNTANT,
  ROLES.THEATRE_STAFF,
  ROLES.MATERNAL_STAFF,
  ROLES.MENTAL_HEALTH,
  ROLES.AMBULANCE,
];

export const CLINICAL_ROLES: Role[] = [
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.LAB_SCIENTIST,
  ROLES.RADIOGRAPHER,
  ROLES.THEATRE_STAFF,
  ROLES.MATERNAL_STAFF,
  ROLES.MENTAL_HEALTH,
];

export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export const RESOURCES = {
  PATIENT: 'Patient',
  APPOINTMENT: 'Appointment',
  VISIT: 'Visit',
  DIAGNOSIS: 'Diagnosis',
  MEDICAL_RECORD: 'MedicalRecord',
  PRESCRIPTION: 'Prescription',
  LAB_REQUEST: 'LabRequest',
  LAB_RESULT: 'LabResult',
  RADIOLOGY_REQUEST: 'RadiologyRequest',
  RADIOLOGY_REPORT: 'RadiologyReport',
  ADMISSION: 'Admission',
  SURGERY: 'Surgery',
  MATERNAL_RECORD: 'MaternalRecord',
  PSYCH_ASSESSMENT: 'PsychAssessment',
  THERAPY_SESSION: 'TherapySession',
  INVOICE: 'Invoice',
  PAYMENT: 'Payment',
  MEDICINE: 'Medicine',
  INVENTORY: 'Inventory',
  STAFF: 'Staff',
  BRANCH: 'Branch',
  DEPARTMENT: 'Department',
  DOCUMENT: 'Document',
  AUDIT_LOG: 'AuditLog',
  ALL: 'all',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
