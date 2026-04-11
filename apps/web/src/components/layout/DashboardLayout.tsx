import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoadBoardPage } from '@/pages/LoadBoardPage';
import { DriversPage } from '@/pages/DriversPage';
import { CarriersPage } from '@/pages/CarriersPage';
import { BrokerLoadsPage } from '@/pages/BrokerLoadsPage';
import { LiveMapPage } from '@/pages/LiveMapPage';

type Page = 'dashboard' | 'loads' | 'drivers' | 'carriers' | 'broker-loads' | 'map' | 'billing' | 'documents' | 'reports';

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'loads',        label: 'Load board' },
  { id: 'broker-loads', label: 'Broker loads' },
  { id: 'drivers',      label: 'Drivers' },
  { id: 'carriers',     label: 'Carrier network' },
  { id: 'map',          label: 'Live map' },
  { id: 'billing',      label: 'Billing' },
  { id: 'documents',    label: 'Documents' },
  { id: 'reports',      label: 'Reports' },
];

export function DashboardLayout() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <span className="text-base font-semibold text-gray-900">Gemini Express</span>
          <p className="text-xs text-gray-400 mt-0.5">TMS Platform</p>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={clearAuth}
            className="w-full text-xs text-gray-400 hover:text-gray-600 text-left py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activePage === 'dashboard'    && <DashboardPage />}
            {activePage === 'loads'        && <LoadBoardPage />}
            {activePage === 'broker-loads' && <BrokerLoadsPage />}
            {activePage === 'drivers'      && <DriversPage />}
            {activePage === 'carriers'     && <CarriersPage />}
            {activePage === 'map'          && <LiveMapPage />}
          </div>
        </div>
      </main>
    </div>
  );
}