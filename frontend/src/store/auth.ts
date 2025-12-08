import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithStellar: (publicKey: string, challenge: string, signature: string) => Promise<void>;
  register: (data: {
    stellarPublicKey: string;
    email?: string;
    password?: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    affiliation?: string;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await api.login(email, password);
          api.setTokens(response.accessToken, response.refreshToken);
          set({
            user: response.user as User,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginWithStellar: async (publicKey: string, challenge: string, signature: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await api.authenticateWithStellar(
            publicKey,
            challenge,
            signature
          );
          api.setTokens(response.accessToken, response.refreshToken);
          set({
            user: response.user as User,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Stellar authentication failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.register(data);
          // After registration, user needs to log in
          set({ isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch {
          // Ignore logout errors
        } finally {
          api.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        if (!api.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await api.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          api.clearTokens();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          const updatedUser = await api.updateProfile(user.id, data);
          set({ user: updatedUser, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Profile update failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
