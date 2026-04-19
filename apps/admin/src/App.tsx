import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/LoginPage';
import { TenantsPage } from './pages/TenantsPage';
import { TenantDetailPage } from './pages/TenantDetailPage';

export function App() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tenants" replace />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenants/:id" element={<TenantDetailPage />} />
        {/* Unknown routes: back to list */}
        <Route path="*" element={<Navigate to="/tenants" replace />} />
      </Routes>
    </BrowserRouter>
  );
}