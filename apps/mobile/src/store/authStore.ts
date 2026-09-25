import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, User } from '../types';
import { apiClient } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await apiClient.login(email, password);
          set({ 
            session, 
            user: session.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } finally {
          set({ 
            session: null, 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },

      restoreSession: async () => {
        set({ isLoading: true });
        try {
          const session = await apiClient.getSession();
          if (session?.user) {
            set({ 
              session, 
              user: session.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              session: null, 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch {
          set({ 
            session: null, 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const value = await SecureStore.getItemAsync(name);
            return value;
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            await SecureStore.setItemAsync(name, value);
          } catch {
            // Ignore errors in secure store
          }
        },
        removeItem: async (name: string) => {
          try {
            await SecureStore.deleteItemAsync(name);
          } catch {
            // Ignore errors
          }
        },
      })),
      partialize: (state) => ({ 
        session: state.session,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);