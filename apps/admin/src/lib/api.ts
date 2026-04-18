import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

// In dev, Vite reads VITE_API_URL from .env. In prod, Vercel injects it.
// Fallback is the Railway API so a freshly-deployed admin panel still works
// even before env vars are configured.
const API_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://axon-tms-production.up.railway.app/api/v1';

// The admin panel always acts as the axon-internal tenant. Backend only
// requires this header on /auth/login (for initial tenant lookup); for
// authenticated calls it reads tenantId from the JWT.
const TENANT_SLUG = 'axon-internal';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Tenant-Slug'] = TENANT_SLUG;
  return config;
});

// On 401, clear auth and force re-login. Admin sessions are short anyway;
// no need for the full refresh-token dance the tenant app does.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);