import { create } from 'zustand';
import { DoctorStats, DoctorQueueItem, Patient, Prescription } from '../types';
import { apiClient } from '../api/client';

interface DoctorState {
  stats: DoctorStats | null;
  queue: DoctorQueueItem[];
  patients: Patient[];
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchPatients: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  startConsultation: (visitId: string) => Promise<void>;
  completeConsultation: (visitId: string, data: { diagnoses: string[]; notes: string; treatmentPlan: string }) => Promise<void>;
  createPrescription: (visitId: string, data: { items: Array<{ medicineId: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }> }) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  stats: null,
  queue: [],
  patients: [],
  prescriptions: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiClient.getDoctorStats();
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard stats';
      set({ error: message, isLoading: false });
    }
  },

  fetchQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const queue = await apiClient.getDoctorQueue();
      set({ queue, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load patient queue';
      set({ error: message, isLoading: false });
    }
  },

  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const patients = await apiClient.getDoctorPatients();
      set({ patients, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load patients';
      set({ error: message, isLoading: false });
    }
  },

  fetchPrescriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const prescriptions = await apiClient.getDoctorPrescriptions();
      set({ prescriptions, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load prescriptions';
      set({ error: message, isLoading: false });
    }
  },

  startConsultation: async (visitId: string) => {
    try {
      await apiClient.startConsultation(visitId);
      // Refresh queue after starting consultation
      get().fetchQueue();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start consultation';
      set({ error: message });
      throw error;
    }
  },

  completeConsultation: async (visitId: string, data: { diagnoses: string[]; notes: string; treatmentPlan: string }) => {
    try {
      await apiClient.completeConsultation(visitId, data);
      get().fetchQueue();
      get().fetchStats();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to complete consultation';
      set({ error: message });
      throw error;
    }
  },

  createPrescription: async (visitId: string, data: { items: Array<{ medicineId: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }> }) => {
    try {
      await apiClient.createPrescription(visitId, data);
      get().fetchPrescriptions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create prescription';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    stats: null,
    queue: [],
    patients: [],
    prescriptions: [],
    isLoading: false,
    error: null,
  }),
}));