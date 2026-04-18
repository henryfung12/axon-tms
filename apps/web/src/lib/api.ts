import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "https://axon-tms-production.up.railway.app/api/v1";

/**
 * Read the tenant slug from the current subdomain.
 *   axon-demo.axon-tms.com → "axon-demo"
 *   gemini.axon-tms.com    → "gemini"
 *   localhost, *.vercel.app, axon-tms.com (apex) → "axon-demo" (dev fallback)
 *
 * Sent as the `X-Tenant-Slug` header on every request so the backend can
 * resolve the current tenant before auth.
 */
function getTenantSlug(): string {
  if (typeof window === "undefined") return "axon-demo";
  const host = window.location.hostname;

  // Dev / preview environments — always fall back to axon-demo.
  if (host === "localhost" || host.endsWith(".vercel.app")) return "axon-demo";

  // Apex domain (axon-tms.com with no subdomain) — no tenant context.
  // Fall back so the login form still works; user will see a helpful error
  // if they try to log in with a tenant that doesn't match.
  if (host === "axon-tms.com" || host === "www.axon-tms.com") return "axon-demo";

  // Normal case: first label of the hostname is the slug.
  // "axon-demo.axon-tms.com" → ["axon-demo", "axon-tms", "com"] → "axon-demo"
  return host.split(".")[0];
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor - attach access token and tenant slug
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Tenant-Slug"] = getTenantSlug();
  return config;
});

// Response interceptor - handle 401 and refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { "X-Tenant-Slug": getTenantSlug() },
          },
        );
        const { accessToken } = response.data;
        useAuthStore.getState().updateToken(accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);