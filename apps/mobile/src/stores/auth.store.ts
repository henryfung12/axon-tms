import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: async (user, accessToken) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setAuthToken(accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    setAuthToken(null);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    const userStr = await SecureStore.getItemAsync('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthToken(token);
      set({ user, accessToken: token, isAuthenticated: true });
    }
  },
}));