import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Tenant } from '@/types';

interface AuthState {
  user: AuthUser | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, tenant: Tenant, accessToken: string) => void;
  setTenant: (tenant: Tenant) => void;
  clearAuth: () => void;
  updateToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, tenant, accessToken) =>
        set({ user, tenant, accessToken, isAuthenticated: true }),
      setTenant: (tenant) => set({ tenant }),
      clearAuth: () =>
        set({ user: null, tenant: null, accessToken: null, isAuthenticated: false }),
      updateToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'axon-auth',
      // Persist user + tenant for instant boot; access token is short-lived
      // and re-issued via the refresh cookie on app init if needed.
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);