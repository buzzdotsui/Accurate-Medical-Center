import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Session, ApiError } from '../types';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl 
  || (__DEV__ ? 'http://10.0.2.2:3000' : 'https://accuratemedicalcentre.com');

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch {
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refreshToken');
    } catch {
      return null;
    }
  }

  private async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch {
            // Refresh failed, clear tokens and redirect to login
            await this.clearTokens();
            // Navigation will be handled by the auth store
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      await this.setTokens(accessToken, newRefreshToken);
      return accessToken;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<Session> {
    const response = await axios.post<{ data: Session }>(
      `${API_BASE_URL}/api/auth/sign-in/email`,
      { email, password }
    );
    const session = response.data.data;
    if (session?.accessToken && session?.refreshToken) {
      await this.setTokens(session.accessToken, session.refreshToken);
    }
    return session;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/sign-out');
    } finally {
      await this.clearTokens();
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const response = await this.client.get<{ data: Session }>('/auth/session');
      return response.data.data;
    } catch {
      return null;
    }
  }

  // Patient endpoints
  async getPatientDashboard(): Promise<DashboardStats> {
    const response = await this.client.get<{ data: DashboardStats }>('/patients/self/dashboard');
    return response.data.data;
  }

  async getPatientAppointments(): Promise<Appointment[]> {
    const response = await this.client.get<{ data: { appointments: Appointment[] } }>('/appointments');
    return response.data.data.appointments;
  }

  async getPatientRecords(): Promise<Visit[]> {
    const response = await this.client.get<{ data: Visit[] }>('/patients/self/records');
    return response.data.data;
  }

  async getPatientLabResults(): Promise<LabRequest[]> {
    const response = await this.client.get<{ data: LabRequest[] }>('/patient/lab-results');
    return response.data.data;
  }

  async getPatientPrescriptions(): Promise<Prescription[]> {
    const response = await this.client.get<{ data: Prescription[] }>('/patient/prescriptions');
    return response.data.data;
  }

  async getPatientInvoices(): Promise<Invoice[]> {
    const response = await this.client.get<{ data: Invoice[] }>('/patients/self/invoices');
    return response.data.data;
  }

  // Doctor endpoints
  async getDoctorStats(): Promise<DoctorStats> {
    const response = await this.client.get<{ data: DoctorStats }>('/appointments/stats');
    return response.data.data;
  }

  async getDoctorQueue(): Promise<DoctorQueueItem[]> {
    const response = await this.client.get<{ data: DoctorQueueItem[] }>('/appointments/queue');
    return response.data.data;
  }

  async getDoctorPatients(): Promise<Patient[]> {
    const response = await this.client.get<{ data: Patient[] }>('/doctor/patients');
    return response.data.data;
  }

  async getDoctorPrescriptions(): Promise<Prescription[]> {
    const response = await this.client.get<{ data: Prescription[] }>('/doctor/prescriptions');
    return response.data.data;
  }

  async startConsultation(visitId: string): Promise<Visit> {
    const response = await this.client.post<{ data: Visit }>(`/clinical/visits/${visitId}/start`);
    return response.data.data;
  }

  async completeConsultation(visitId: string, data: { diagnoses: string[]; notes: string; treatmentPlan: string }): Promise<Visit> {
    const response = await this.client.post<{ data: Visit }>(`/clinical/visits/${visitId}/complete`, data);
    return response.data.data;
  }

  async createPrescription(visitId: string, data: { items: Array<{ medicineId: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }> }): Promise<Prescription> {
    const response = await this.client.post<{ data: Prescription }>(`/visits/${visitId}/prescriptions`, data);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;