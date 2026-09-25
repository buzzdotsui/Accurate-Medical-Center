export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string;
  image?: string;
  emailVerified: boolean;
}

export interface Session {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  genotype?: string;
  address?: string;
  branch?: { name: string; code: string };
  createdAt: string;
}

export interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId?: string;
  branchId: string;
  date: string;
  timeSlot?: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  type: 'IN_PERSON' | 'ONLINE';
  reason?: string;
  notes?: string;
  patient?: Patient;
  doctor?: { user: { name: string }; specialization?: string };
  createdAt: string;
}

export interface Visit {
  id: string;
  visitId: string;
  patientId: string;
  appointmentId?: string;
  doctorId?: string;
  vitals?: Record<string, unknown>;
  chiefComplaint?: string;
  startedAt: string;
  endedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  diagnoses?: Diagnosis[];
  prescriptions?: Prescription[];
  labRequests?: LabRequest[];
}

export interface Diagnosis {
  id: string;
  visitId: string;
  code?: string;
  description: string;
  type: 'PRIMARY' | 'SECONDARY';
  notes?: string;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  visitId: string;
  doctorId: string;
  status: 'PENDING' | 'PARTIAL' | 'DISPENSED';
  notes?: string;
  createdAt: string;
  items: MedicationItem[];
  doctor?: { user: { name: string } };
}

export interface MedicationItem {
  id: string;
  medicineId: string;
  medicine: { name: string; genericName?: string; unit: string };
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispensedQty: number;
  instructions?: string;
}

export interface LabRequest {
  id: string;
  requestId: string;
  visitId: string;
  doctorId: string;
  categoryId: string;
  testName: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  status: 'REQUESTED' | 'SAMPLED' | 'ANALYZING' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  result?: LabResult;
  category?: { name: string };
}

export interface LabResult {
  id: string;
  requestId: string;
  findings: string;
  conclusion?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  performedBy?: string;
  verifiedBy?: string;
  createdAt: string;
  attachments?: LabAttachment[];
}

export interface LabAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  patientId: string;
  branchId: string;
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'VOID';
  dueDate?: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reference?: string;
}

export interface DoctorQueueItem {
  id: string;
  appointmentId: string;
  timeSlot?: string;
  status: string;
  patient: Patient;
  doctor?: { user: { name: string } };
}

export interface DashboardStats {
  appointmentCount: number;
  labRequestCount: number;
  prescriptionCount: number;
  pendingInvoiceTotal: number;
}

export interface DoctorStats {
  todayAppointments: number;
  myPatientsCount: number;
  consultationsDone: number;
}

export interface AuthResponse {
  data?: Session;
  error?: { message: string };
}

export interface ApiError {
  message: string;
  status?: number;
}