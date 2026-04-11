import { useAuthStore } from '@/stores/auth.store';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
}
