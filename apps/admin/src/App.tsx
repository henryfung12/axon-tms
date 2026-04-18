import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/LoginPage';
import { TenantsPage } from './pages/TenantsPage';

export function App() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <TenantsPage /> : <LoginPage />;
}