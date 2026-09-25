import { create } from 'zustand';
import { Patient, Appointment, Visit, LabRequest, Prescription, Invoice, DashboardStats } from '../types';
import { apiClient } from '../api/client';

interface PatientState {
  dashboardStats: DashboardStats | null;
  appointments: Appointment[];
  records: Visit[];
  labResults: LabRequest[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  fetchLabResults: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  dashboardStats: null,
  appointments: [],
  records: [],
  labResults: [],
  prescriptions: [],
  invoices: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiClient.getPatientDashboard();
      set({ dashboardStats: stats, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard';
      set({ error: message, isLoading: false });
    }
  },

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const appointments = await apiClient.getPatientAppointments();
      set({ appointments, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load appointments';
      set({ error: message, isLoading: false });
    }
  },

  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await apiClient.getPatientRecords();
      set({ records, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load medical records';
      set({ error: message, isLoading: false });
    }
  },

  fetchLabResults: async () => {
    set({ isLoading: true, error: null });
    try {
      const labResults = await apiClient.getPatientLabResults();
      set({ labResults, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load lab results';
      set({ error: message, isLoading: false });
    }
  },

  fetchPrescriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const prescriptions = await apiClient.getPatientPrescriptions();
      set({ prescriptions, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load prescriptions';
      set({ error: message, isLoading: false });
    }
  },

  fetchInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await apiClient.getPatientInvoices();
      set({ invoices, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load bills';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    dashboardStats: null,
    appointments: [],
    records: [],
    labResults: [],
    prescriptions: [],
    invoices: [],
    isLoading: false,
    error: null,
  }),
}));