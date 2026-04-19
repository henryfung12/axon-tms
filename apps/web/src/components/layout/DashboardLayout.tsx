import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

// Carrier pages
import { CarrierDashboard } from '@/pages/carrier/CarrierDashboard';
import { CarrierLoadBoard } from '@/pages/carrier/CarrierLoadBoard';
import { DriversPage } from '@/pages/carrier/DriversPage';
import { CarriersPage } from '@/pages/carrier/CarriersPage';
import { LiveMapPage } from '@/pages/carrier/LiveMapPage';
import { DispatchPlanner } from '@/pages/carrier/DispatchPlanner';
import { AssetsPage } from '@/pages/carrier/AssetsPage';
import { CompaniesPage } from '@/pages/carrier/CompaniesPage';
import { MaintenancePage } from '@/pages/carrier/MaintenancePage';
import { SafetyPage } from '@/pages/carrier/SafetyPage';
import { CarrierAccountingPage } from '@/pages/carrier/CarrierAccountingPage';
import { ReportsPage } from '@/pages/carrier/ReportsPage';
import { FleetIntelligencePage } from '@/pages/carrier/FleetIntelligencePage';
import { SettingsPage } from '@/pages/carrier/SettingsPage';
import { RateCalculatorPage } from '@/pages/RateCalculatorPage';

// Brokerage pages
import { BrokerageDashboard } from '@/pages/brokerage/BrokerageDashboard';
import { BrokerageShipments } from '@/pages/brokerage/BrokerageShipments';
import { BrokerageAccounting } from '@/pages/brokerage/BrokerageAccounting';
import { BrokerageCustomers } from '@/pages/brokerage/BrokerageCustomers';
import { BrokerageCarriers } from '@/pages/brokerage/BrokerageCarriers';
import { BrokerageRates } from '@/pages/brokerage/BrokerageRates';
import { BrokerageReports } from '@/pages/brokerage/BrokerageReports';
import { BrokerageSales } from '@/pages/brokerage/BrokerageSales';
import { CustomerPortal } from '@/pages/brokerage/CustomerPortal';
import { BrokerageClaims } from '@/pages/brokerage/BrokerageClaims';
import { FuelSurchargeCalculator } from '@/pages/brokerage/FuelSurchargeCalculator';
import { AuditTrail } from '@/pages/brokerage/AuditTrail';

// CFS / Air Cargo pages
import { CFSDashboard } from '@/pages/cfs/CFSDashboard';
import { CFSImportOrders } from '@/pages/cfs/CFSImportOrders';
import { CFSExportOrders } from '@/pages/cfs/CFSExportOrders';
import { CFSExportReceiving } from '@/pages/cfs/CFSExportReceiving';
import { CFSWarehouse } from '@/pages/cfs/CFSWarehouse';
import { CFSBilling } from '@/pages/cfs/CFSBilling';
import { CFSCustoms } from '@/pages/cfs/CFSCustoms';
import { CFSDispatch } from '@/pages/cfs/CFSDispatch';

type Module = 'carrier' | 'brokerage' | 'cfs' | 'billing';

type CarrierPage =
  | 'dashboard' | 'loads' | 'dispatch' | 'drivers' | 'assets'
  | 'carriers' | 'maintenance' | 'safety' | 'accounting' | 'reports'
  | 'companies' | 'map' | 'cpm_calculator' | 'fleet_intel' | 'settings';

type BrokeragePage =
  | 'dashboard' | 'shipments' | 'accounting' | 'customers'
  | 'carriers' | 'rates' | 'reports' | 'sales' | 'portal' | 'claims' | 'fuel_calc' | 'audit';

type CFSPage =
  | 'dashboard' | 'imports' | 'exports' | 'export_receiving' | 'warehouse' | 'customs' | 'dispatch';

type BillingPage = 'unified';

const CARRIER_NAV: { id: CarrierPage; label: string; icon: string; children?: { id: CarrierPage; label: string }[] }[] = [
  { id: 'dashboard', label: 'Home', icon: '⌂' },
  {
    id: 'loads', label: 'Loads & Trips', icon: '📦',
    children: [
      { id: 'loads', label: 'Loads' },
      { id: 'dispatch', label: 'Dispatch Planner' },
    ]
  },
  { id: 'drivers', label: 'Drivers', icon: '👤' },
  { id: 'assets', label: 'Assets', icon: '🚛' },
  { id: 'carriers', label: 'Carriers', icon: '🏢' },
  { id: 'companies', label: 'Companies', icon: '🏭' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'safety', label: 'Safety', icon: '🛡' },
  { id: 'accounting', label: 'Accounting', icon: '💰' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'fleet_intel', label: 'Fleet Intelligence', icon: '📡' },
  { id: 'map', label: 'Live Map', icon: '🗺' },
  { id: 'cpm_calculator', label: 'CPM Calc', icon: '🧮' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

const BROKERAGE_NAV: { id: BrokeragePage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: '⌂' },
  { id: 'shipments', label: 'Shipments', icon: '📦' },
  { id: 'accounting', label: 'Accounting', icon: '💰' },
  { id: 'customers', label: 'Customers', icon: '🏢' },
  { id: 'carriers', label: 'LSP / Carriers', icon: '🚛' },
  { id: 'rates', label: 'Rates', icon: '📋' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'sales', label: 'Sales', icon: '📈' },
  { id: 'portal', label: 'Customer Portal', icon: '🌐' },
  { id: 'claims', label: 'Claims', icon: '⚠' },
  { id: 'fuel_calc', label: 'Fuel Surcharge', icon: '⛽' },
  { id: 'audit', label: 'Audit Trail', icon: '📜' },
];

const CFS_NAV: { id: CFSPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'imports', label: 'Import Orders', icon: '📥' },
  { id: 'exports', label: 'Export Orders', icon: '📤' },
  { id: 'export_receiving', label: 'Export Receiving', icon: '📦' },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { id: 'customs', label: 'Customs & Compliance', icon: '🛃' },
  { id: 'dispatch', label: 'Dispatch', icon: '🚛' },
];

const BILLING_NAV: { id: BillingPage; label: string; icon: string }[] = [
  { id: 'unified', label: 'Unified Billing', icon: '💰' },
];

export function DashboardLayout() {
  const [activeModule, setActiveModule] = useState<Module>('carrier');
  const [carrierPage, setCarrierPage] = useState<CarrierPage>('dashboard');
  const [brokeragePage, setBrokeragePage] = useState<BrokeragePage>('dashboard');
  const [cfsPage, setCfsPage] = useState<CFSPage>('dashboard');
  const [billingPage, setBillingPage] = useState<BillingPage>('unified');

  const [showNotifications, setShowNotifications] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const ALERTS = [
    { id: 1, type: 'URGENT', message: 'CBP exam scheduled for JFK-IMP-0902', time: '5 min ago', read: false },
    { id: 2, type: 'WARNING', message: 'TRP-0414-001 delayed — ETA pushed 2 hours', time: '12 min ago', read: false },
    { id: 3, type: 'ALERT', message: 'Marcus Johnson approaching HOS limit (1hr remaining)', time: '25 min ago', read: true },
    { id: 4, type: 'INFO', message: 'CargoWise sync completed — 3 invoices pushed, 0 errors', time: '1 hr ago', read: true },
    { id: 5, type: 'URGENT', message: 'Westbrook Electronics invoice overdue (45 days)', time: '2 hrs ago', read: false },
    { id: 6, type: 'WARNING', message: 'Eagle Freight Lines insurance expires 03/15', time: '4 hrs ago', read: true },
    { id: 7, type: 'ALERT', message: 'Sarah Chen delivered to Edison, NJ — POD received', time: '6 hrs ago', read: true },
    { id: 8, type: 'INFO', message: 'New customer registered: Heartland Foods (HEART-US)', time: '8 hrs ago', read: true },
  ];
  const unreadCount = ALERTS.filter(a => !a.read).length;
  const ALERT_TYPE_STYLE: Record<string, { bg: string; dot: string; icon: string }> = {
    URGENT: { bg: 'bg-red-50', dot: 'bg-red-500', icon: '🔴' },
    WARNING: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', icon: '🟡' },
    ALERT: { bg: 'bg-orange-50', dot: 'bg-orange-500', icon: '🟠' },
    INFO: { bg: 'bg-blue-50', dot: 'bg-blue-500', icon: '🔵' },
  };
  const [expandedNav, setExpandedNav] = useState<string | null>('loads');
  const { user, tenant, clearAuth } = useAuthStore();

  const switchModule = (mod: Module) => {
    setActiveModule(mod);
  };

  const renderCarrierPage = () => {
    switch (carrierPage) {
      case 'dashboard': return <CarrierDashboard />;
      case 'loads': return <CarrierLoadBoard />;
      case 'dispatch': return <DispatchPlanner />;
      case 'drivers': return <DriversPage />;
      case 'assets': return <AssetsPage />;
      case 'carriers': return <CarriersPage />;
      case 'companies': return <CompaniesPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'safety': return <SafetyPage />;
      case 'accounting': return <CarrierAccountingPage />;
      case 'reports': return <ReportsPage />;
      case 'fleet_intel': return <FleetIntelligencePage />;
      case 'settings': return <SettingsPage />;
      case 'map': return <LiveMapPage />;
      case 'cpm_calculator': return <RateCalculatorPage onBack={() => setCarrierPage('dashboard')} />;
      default: return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <p className="text-2xl mb-2">🚧</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      );
    }
  };

  const renderBrokeragePage = () => {
    switch (brokeragePage) {
      case 'dashboard': return <BrokerageDashboard />;
      case 'shipments': return <BrokerageShipments />;
      case 'accounting': return <BrokerageAccounting />;
      case 'customers': return <BrokerageCustomers />;
      case 'carriers': return <BrokerageCarriers />;
      case 'rates': return <BrokerageRates />;
      case 'reports': return <BrokerageReports />;
      case 'sales': return <BrokerageSales />;
      case 'portal': return <CustomerPortal />;
      case 'claims': return <BrokerageClaims />;
      case 'fuel_calc': return <FuelSurchargeCalculator />;
      case 'audit': return <AuditTrail />;
      default: return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <p className="text-2xl mb-2">🚧</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      );
    }
  };

  const renderCFSPage = () => {
    switch (cfsPage) {
      case 'dashboard': return <CFSDashboard />;
      case 'imports': return <CFSImportOrders />;
      case 'exports': return <CFSExportOrders />;
      case 'export_receiving': return <CFSExportReceiving />;
      case 'warehouse': return <CFSWarehouse />;
      case 'customs': return <CFSCustoms />;
      case 'dispatch': return <CFSDispatch />;
      default: return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <p className="text-2xl mb-2">🚧</p>
            <p className="text-sm">Coming soon — {CFS_NAV.find(n => n.id === cfsPage)?.label}</p>
          </div>
        </div>
      );
    }
  };

  const renderBillingPage = () => {
    switch (billingPage) {
      case 'unified': return <CFSBilling />;
      default: return <CFSBilling />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Tenant Logo + Name */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={`${tenant.companyName} logo`}
              className="w-7 h-7 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
              style={{ background: tenant?.primaryColor ?? '#4f46e5' }}
            >
              {(tenant?.companyName ?? 'AX').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">
              {tenant?.companyName ?? 'AXON TMS'}
            </div>
            <p className="text-xs text-gray-400 -mt-0.5 truncate">Enterprise Platform</p>
          </div>
        </div>

        {/* Module Switcher - TWO ROWS */}
        <div className="px-3 py-2 border-b border-gray-100">
          {/* Row 1: Carrier & Brokerage */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium mb-2">
            <button
              onClick={() => switchModule('carrier')}
              className={`flex-1 py-2 px-3 transition-colors ${
                activeModule === 'carrier' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Carrier
            </button>
            <button
              onClick={() => switchModule('brokerage')}
              className={`flex-1 py-2 px-3 transition-colors ${
                activeModule === 'brokerage' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Brokerage
            </button>
          </div>
          
          {/* Row 2: CFS & Billing */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
            <button
              onClick={() => switchModule('cfs')}
              className={`flex-1 py-2 px-3 transition-colors ${
                activeModule === 'cfs' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              CFS
            </button>
            <button
              onClick={() => switchModule('billing')}
              className={`flex-1 py-2 px-3 transition-colors ${
                activeModule === 'billing' 
                  ? 'bg-amber-200 text-black font-medium' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Billing
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {activeModule === 'carrier' && (
            <>
              {/* New Load Button */}
              <button
                onClick={() => setCarrierPage('loads')}
                className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <span>+</span> New Load
              </button>

              <div className="space-y-0.5 mt-1">
                {CARRIER_NAV.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (item.children) {
                          setExpandedNav(expandedNav === item.id ? null : item.id);
                          setCarrierPage(item.children[0].id);
                        } else {
                          setCarrierPage(item.id);
                          setExpandedNav(null);
                        }
                      }}
                      className={`w-full flex items-center gap-2 rounded-lg transition-colors ${
                        carrierPage === item.id && !item.children
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      } ${
                        item.id === 'cpm_calculator' 
                          ? 'px-2 py-0.5 text-xs' 
                          : 'px-3 py-1.5 text-xs'
                      }`}
                    >
                      <span className="w-4 text-center">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.children && (
                        <span className="text-gray-400">{expandedNav === item.id ? '▾' : '▸'}</span>
                      )}
                    </button>
                    {item.children && expandedNav === item.id && (
                      <div className="ml-6 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setCarrierPage(child.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              carrierPage === child.id
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeModule === 'brokerage' && (
            <div className="space-y-0.5">
              <button
                onClick={() => setBrokeragePage('shipments')}
                className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <span>+</span> New Shipment
              </button>
              {BROKERAGE_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setBrokeragePage(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    brokeragePage === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {activeModule === 'cfs' && (
            <div className="space-y-0.5">
              <button
                onClick={() => setCfsPage('imports')}
                className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
              >
                <span>+</span> New Import Order
              </button>
              {CFS_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCfsPage(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    cfsPage === item.id
                      ? 'bg-violet-50 text-violet-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {activeModule === 'billing' && (
            <div className="space-y-0.5">
              {BILLING_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setBillingPage(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    billingPage === item.id
                      ? 'bg-amber-50 text-amber-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={clearAuth}
            className="w-full text-xs text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium" style={{ color: tenant?.primaryColor ?? '#2563eb' }}>🏠 {tenant?.companyName ?? 'AXON TMS'}</span>
                {carrierPage !== 'dashboard' && (
                  <>
                    <span>/</span>
                    <span className="capitalize">{carrierPage.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setShowGlobalSearch(true)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Global Search (⌘K)"
              >
                🔍
              </button>

              {/* Quick Actions */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Quick Actions"
              >
                ⚡
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors relative"
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowAlertSettings(true)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Settings"
              >
                ⚙
              </button>

              {/* Audit Trail */}
              <button
                onClick={() => setShowAuditTrail(true)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Audit Trail"
              >
                📋
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {activeModule === 'carrier' && renderCarrierPage()}
          {activeModule === 'brokerage' && renderBrokeragePage()}
          {activeModule === 'cfs' && renderCFSPage()}
          {activeModule === 'billing' && renderBillingPage()}
        </div>
      </main>

      {/* All the overlay modals remain the same... */}
      {/* [Previous overlay code would go here - notifications, search, etc.] */}
    </div>
  );
}