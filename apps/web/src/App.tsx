import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import type { MeResponse } from '@/types';

/**
 * Hydrates the latest tenant branding into the store on every app boot.
 * The user's access token is short-lived and not persisted, so api.ts will
 * auto-refresh via the HttpOnly refresh cookie on the first authenticated
 * request. That means /auth/me may 401 the first time and succeed after
 * the retry — react-query masks that latency for us.
 */
function TenantHydrator() {
  const setTenant = useAuthStore((s) => s.setTenant);

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<MeResponse>('/auth/me');
      return data;
    },
    // Fresh for 5 min — if staff update branding, a tab reload picks it up.
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (meQuery.data?.tenant) {
      setTenant(meQuery.data.tenant);
    }
  }, [meQuery.data, setTenant]);

  return null;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <TenantHydrator />
      <DashboardLayout />
    </>
  );
}