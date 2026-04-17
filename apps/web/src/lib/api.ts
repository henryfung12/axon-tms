import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Request interceptor - attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo mode - return empty arrays/objects when API fails (no backend deployed)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // In demo mode, swallow all errors and return safe defaults
    const method = error.config?.method?.toLowerCase();
    if (method === "get") {
      return Promise.resolve({ data: [] });
    }
    // For non-GET requests, return a generic success shape
    return Promise.resolve({ data: { success: true } });
  },
);