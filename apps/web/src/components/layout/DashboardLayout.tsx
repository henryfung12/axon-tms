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
import { CFSWarehouse } from '@/pages/cfs/CFSWarehouse';
import { CFSBilling } from '@/pages/cfs/CFSBilling';
import { CFSCustoms } from '@/pages/cfs/CFSCustoms';
import { CFSDispatch } from '@/pages/cfs/CFSDispatch';

type Module = 'carrier' | 'brokerage' | 'cfs' | 'billing';

type CarrierPage =
  | 'dashboard' | 'loads' | 'dispatch' | 'drivers' | 'assets'
  | 'carriers' | 'maintenance' | 'safety' | 'accounting' | 'reports'
  | 'companies' | 'map' | 'fleet_intel' | 'settings';

type BrokeragePage =
  | 'dashboard' | 'shipments' | 'accounting' | 'customers'
  | 'carriers' | 'rates' | 'reports' | 'sales' | 'portal' | 'claims' | 'fuel_calc' | 'audit';

type CFSPage =
  | 'dashboard' | 'imports' | 'exports' | 'warehouse' | 'customs' | 'dispatch';

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
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showUnifiedHome, setShowUnifiedHome] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  // ── Notifications / Alerts ─────────────────────────────
  const ALERTS = [
    { id: 'a1', type: 'URGENT', category: 'Insurance', title: 'Insurance Expiring — Lone Star Logistics', message: 'Auto liability insurance expires in 5 days (Apr 20, 2026). Contact carrier immediately.', time: '12 min ago', module: 'brokerage', read: false },
    { id: 'a2', type: 'WARNING', category: 'Delivery', title: 'Late Delivery — SH-10421', message: 'Shipment SH-10421 is 2 hours past scheduled delivery. Carrier: Eagle Freight Lines. Last location: Bowling Green, KY.', time: '35 min ago', module: 'brokerage', read: false },
    { id: 'a3', type: 'ALERT', category: 'HOS', title: 'HOS Violation Risk — Marcus Johnson', message: 'Driver Marcus Johnson has 1.5 hours driving time remaining on 14-hour clock. Current load ETA requires 2h 22m.', time: '1 hr ago', module: 'carrier', read: false },
    { id: 'a4', type: 'INFO', category: 'CargoWise', title: 'CW Sync Error — BL-ACC-4432', message: 'CargoWise sync failed for carrier bill BL-ACC-4432: missing carrier SCAC code. Retry scheduled.', time: '1 hr ago', module: 'carrier', read: false },
    { id: 'a5', type: 'WARNING', category: 'Invoice', title: 'Invoice Overdue — INV-20260115', message: 'Invoice INV-20260115 for Acme Manufacturing is 59 days past due. Balance: $3,100.', time: '2 hr ago', module: 'brokerage', read: true },
    { id: 'a6', type: 'ALERT', category: 'Claim', title: 'New Claim Filed — CLM-2026-0041', message: 'Cargo damage claim filed for SH-10421. Amount: $4,200. Carrier: Eagle Freight Lines. Assigned to Mike Santos.', time: '3 hr ago', module: 'brokerage', read: true },
    { id: 'a7', type: 'INFO', category: 'EDI', title: 'EDI 204 Tender Received', message: 'New load tender received from Acme Manufacturing — Detroit, MI → Columbus, OH. Auto-accepted.', time: '4 hr ago', module: 'brokerage', read: true },
    { id: 'a8', type: 'WARNING', category: 'DTC', title: 'Engine Alert — T-1055', message: 'DTC code P0420 (Catalyst System Efficiency Below Threshold) on truck T-1055. Driver: James Williams.', time: '5 hr ago', module: 'carrier', read: true },
    { id: 'a9', type: 'URGENT', category: 'Compliance', title: 'DOT Inspection Due — T-1082', message: 'Annual DOT inspection for T-1082 expired Mar 31, 2026. Vehicle is OUT OF SERVICE until inspected.', time: '6 hr ago', module: 'carrier', read: true },
    { id: 'a10', type: 'INFO', category: 'Factoring', title: 'Quick Pay Funded — Eagle Freight', message: 'RTS Financial funded $2,134.00 for BL-EFL-4521. Quick pay completed in 2 hours.', time: '8 hr ago', module: 'brokerage', read: true },
    { id: 'a11', type: 'WARNING', category: 'Credit', title: 'Credit Limit Alert — SE Steel', message: 'Southeastern Steel credit utilization at 93% ($55,800 of $60,000). Approaching limit.', time: '12 hr ago', module: 'brokerage', read: true },
    { id: 'a12', type: 'INFO', category: 'Tracking', title: 'Tracking Link Expired', message: 'Shareable tracking link for LD-4518 has expired (48-hour duration). Load delivered.', time: '1 day ago', module: 'carrier', read: true },
  ];
  const unreadCount = ALERTS.filter(a => !a.read).length;
  const ALERT_TYPE_STYLE: Record<string, { bg: string; dot: string; icon: string }> = {
    URGENT: { bg: 'bg-red-50', dot: 'bg-red-500', icon: '🔴' },
    WARNING: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', icon: '🟡' },
    ALERT: { bg: 'bg-orange-50', dot: 'bg-orange-500', icon: '🟠' },
    INFO: { bg: 'bg-blue-50', dot: 'bg-blue-500', icon: '🔵' },
  };
  const [expandedNav, setExpandedNav] = useState<string | null>('loads');
  const { user, clearAuth } = useAuthStore();

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

        {/* Logo */}
        <div className="px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">Gemini Express</span>
          <p className="text-xs text-gray-400 mt-0.5">Transport Corp</p>
        </div>

        {/* Module Switcher */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
            <button
              onClick={() => switchModule('carrier')}
              className={`flex-1 py-1.5 transition-colors ${
                activeModule === 'carrier'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Carrier
            </button>
            <button
              onClick={() => switchModule('brokerage')}
              className={`flex-1 py-1.5 transition-colors ${
                activeModule === 'brokerage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Brokerage
            </button>
            <button
              onClick={() => switchModule('cfs')}
              className={`flex-1 py-1.5 transition-colors ${
                activeModule === 'cfs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              CFS
            </button>
            <button
              onClick={() => switchModule('billing')}
              className={`flex-1 py-1.5 transition-colors ${
                activeModule === 'billing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Billing
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          {activeModule === 'carrier' && (
            <>
              {/* Quick action */}
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
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        carrierPage === item.id && !item.children
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
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
              <button
                onClick={() => setBillingPage('unified')}
                className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                <span>+</span> Generate Invoice
              </button>
              {BILLING_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setBillingPage(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    billingPage === item.id
                      ? 'bg-amber-50 text-amber-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Sources</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">Carrier</span><span className="text-gray-400">Loads & invoices</span></div>
                  <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Brokerage</span><span className="text-gray-400">Shipments & AR/AP</span></div>
                  <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 font-medium">CFS</span><span className="text-gray-400">Import/Export/WH</span></div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-200">
          <div
            className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
            onClick={() => { switchModule('carrier'); setCarrierPage('settings'); }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white ${activeModule === 'carrier' ? 'bg-blue-600' : activeModule === 'brokerage' ? 'bg-emerald-600' : activeModule === 'billing' ? 'bg-amber-600' : 'bg-violet-600'}`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                {user?.role === 'ADMIN' ? 'Full Admin' : user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase() || 'Admin'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => { switchModule('carrier'); setCarrierPage('settings'); }}
              className="text-xs text-gray-400 hover:text-blue-600 text-left py-0.5"
            >
              Settings
            </button>
            <span className="text-gray-200">·</span>
            <button
              onClick={clearAuth}
              className="text-xs text-gray-400 hover:text-gray-600 text-left py-0.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className={`h-10 flex items-center justify-between px-6 border-b border-gray-200 ${activeModule === 'carrier' ? 'bg-white' : activeModule === 'brokerage' ? 'bg-gray-900' : activeModule === 'billing' ? 'bg-amber-900' : 'bg-violet-900'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${activeModule === 'carrier' ? 'text-blue-600' : activeModule === 'brokerage' ? 'text-emerald-400' : activeModule === 'billing' ? 'text-amber-300' : 'text-violet-300'}`}>
              {activeModule === 'carrier' ? '🚛 Carrier TMS' : activeModule === 'brokerage' ? '📦 Brokerage Dashboard' : activeModule === 'billing' ? '💰 Unified Billing' : '✈ CFS / Air Cargo'}
            </span>
            <span className={`text-xs ${activeModule === 'carrier' ? 'text-gray-300' : 'text-gray-600'}`}>/</span>
            <span className={`text-xs ${activeModule === 'carrier' ? 'text-gray-500' : 'text-gray-400'}`}>
              {activeModule === 'carrier'
                ? CARRIER_NAV.find(n => n.id === carrierPage)?.label || carrierPage
                : activeModule === 'brokerage'
                ? BROKERAGE_NAV.find(n => n.id === brokeragePage)?.label || brokeragePage
                : activeModule === 'billing'
                ? BILLING_NAV.find(n => n.id === billingPage)?.label || billingPage
                : CFS_NAV.find(n => n.id === cfsPage)?.label || cfsPage
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <div className="relative">
              <button onClick={() => setShowGlobalSearch(!showGlobalSearch)} className={`p-1 rounded-lg transition-colors ${activeModule === 'carrier' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}><span className="text-lg">🔍</span></button>
            </div>
            {/* Unified Home */}
            <button onClick={() => setShowUnifiedHome(true)} className={`p-1 rounded-lg transition-colors ${activeModule === 'carrier' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}><span className="text-lg">🏠</span></button>
            {/* Audit Trail */}
            <button onClick={() => setShowAuditTrail(true)} className={`p-1 rounded-lg transition-colors ${activeModule === 'carrier' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}><span className="text-lg">📋</span></button>
            {/* Alert Settings */}
            <button onClick={() => setShowAlertSettings(true)} className={`p-1 rounded-lg transition-colors ${activeModule === 'carrier' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}><span className="text-lg">⚙</span></button>
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-1 rounded-lg transition-colors ${activeModule === 'carrier' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}>
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-9 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden" style={{ maxHeight: '80vh' }}>
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount} new</span>}
                    </div>
                    <button className="text-xs text-blue-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 90px)' }}>
                    {ALERTS.map(a => {
                      const style = ALERT_TYPE_STYLE[a.type];
                      return (
                        <div key={a.id} onClick={() => { setShowNotifications(false); if (a.module === 'carrier') { switchModule('carrier'); setCarrierPage(a.category === 'Safety' ? 'safety' : a.category === 'Fleet' ? 'assets' : a.category === 'Compliance' ? 'assets' : a.category === 'Accounting' ? 'accounting' : 'dashboard'); } else { switchModule('brokerage'); setBrokeragePage(a.category === 'AR/AP' ? 'accounting' : a.category === 'Operations' ? 'shipments' : 'dashboard'); } }} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!a.read ? style.bg : ''}`}>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {!a.read && <div className={`w-2 h-2 rounded-full ${style.dot}`} />}
                              {a.read && <div className="w-2 h-2 rounded-full bg-transparent" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs">{style.icon}</span>
                                <span className="text-xs font-bold text-gray-900 truncate">{a.title}</span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{a.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{a.time}</span>
                                <span className="text-xs text-gray-300">·</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.module === 'carrier' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{a.module === 'carrier' ? 'Carrier' : 'Brokerage'}</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{a.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-center">
                    <button className="text-xs text-blue-600 hover:underline font-medium">View All Notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeModule === 'carrier' ? renderCarrierPage() : activeModule === 'brokerage' ? renderBrokeragePage() : activeModule === 'billing' ? renderBillingPage() : renderCFSPage()}
          </div>
        </div>
      </main>

      {/* ── #33 Unified Home Screen ──────────────────────── */}
      {showUnifiedHome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUnifiedHome(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-900">🏠 Gemini Express — Unified Dashboard</h2><button onClick={() => setShowUnifiedHome(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-xs text-blue-600 font-semibold mb-1">🚛 Carrier</p><p className="text-2xl font-bold text-gray-900">$486,720</p><p className="text-xs text-gray-500 mt-1">Revenue MTD</p><div className="flex gap-2 mt-2 text-xs"><span className="text-green-600 font-medium">12 active loads</span><span className="text-gray-300">·</span><span className="text-gray-500">8 drivers on road</span></div></div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-xs text-emerald-600 font-semibold mb-1">📦 Brokerage</p><p className="text-2xl font-bold text-gray-900">$312,400</p><p className="text-xs text-gray-500 mt-1">Revenue MTD</p><div className="flex gap-2 mt-2 text-xs"><span className="text-green-600 font-medium">18 shipments</span><span className="text-gray-300">·</span><span className="text-gray-500">22.1% avg margin</span></div></div>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4"><p className="text-xs text-violet-600 font-semibold mb-1">✈ CFS / Air Cargo</p><p className="text-2xl font-bold text-gray-900">$127,600</p><p className="text-xs text-gray-500 mt-1">Revenue MTD</p><div className="flex gap-2 mt-2 text-xs"><span className="text-red-600 font-medium">4 holds</span><span className="text-gray-300">·</span><span className="text-gray-500">1 exam pending</span></div></div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-xs text-amber-600 font-semibold mb-1">💰 Billing</p><p className="text-2xl font-bold text-gray-900">$27,635</p><p className="text-xs text-gray-500 mt-1">Outstanding</p><div className="flex gap-2 mt-2 text-xs"><span className="text-yellow-600 font-medium">$8,150 unbilled</span><span className="text-gray-300">·</span><span className="text-gray-500">6 CW orgs</span></div></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h4 className="text-sm font-bold text-gray-900 mb-3">⚠ Action Items</h4>
                  <div className="space-y-2 text-xs">{[
                    { text: '4 customs holds need attention', module: 'CFS', color: 'text-red-600' },
                    { text: '3 partial pickups pending follow-up', module: 'CFS', color: 'text-yellow-600' },
                    { text: '$8,150 unbilled across modules', module: 'Billing', color: 'text-amber-600' },
                    { text: '1 VACIS exam scheduled tomorrow 9 AM', module: 'CFS', color: 'text-orange-600' },
                    { text: '3 credit applications pending review', module: 'Brokerage', color: 'text-blue-600' },
                    { text: '2 insurance cards expiring in 30 days', module: 'Carrier', color: 'text-gray-600' },
                  ].map((a, i) => <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded"><span className={`${a.color} font-medium`}>{a.text}</span><span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">{a.module}</span></div>)}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h4 className="text-sm font-bold text-gray-900 mb-3">📊 Today's Activity</h4>
                  <div className="space-y-2 text-xs">{[
                    { time: '2:30 PM', text: 'TRP-0414-001 en route to JFK Bldg 75', module: 'CFS' },
                    { time: '1:25 PM', text: 'Robert Brown arrived at MIA Terminal N', module: 'CFS' },
                    { time: '12:05 PM', text: 'INV-2026-1042 paid by Acme Manufacturing', module: 'Billing' },
                    { time: '10:50 AM', text: 'Sarah Chen delivered to Edison, NJ', module: 'Carrier' },
                    { time: '9:50 AM', text: 'JFK-IMP-0902 arrived at CFS warehouse', module: 'CFS' },
                    { time: '8:30 AM', text: 'SH-10422 posted to DAT + Truckstop', module: 'Brokerage' },
                  ].map((a, i) => <div key={i} className="flex items-center gap-3 py-1.5"><span className="text-gray-400 w-16 flex-shrink-0">{a.time}</span><span className="text-gray-700 flex-1">{a.text}</span><span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{a.module}</span></div>)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── #34 Global Search ────────────────────────────── */}
      {showGlobalSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 pt-20" onClick={() => setShowGlobalSearch(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200"><input type="text" value={globalSearchQuery} onChange={e => setGlobalSearchQuery(e.target.value)} placeholder="Search across all modules — MAWB, load #, invoice, customer, driver, VIN..." className="w-full text-sm border-none outline-none" autoFocus /></div>
            {globalSearchQuery.length > 0 && (
              <div className="max-h-96 overflow-y-auto p-2">
                {[
                  { type: 'Load', id: 'LD-4521', desc: 'Memphis → Nashville · Marcus Johnson', module: 'Carrier', icon: '🚛' },
                  { type: 'Shipment', id: 'SH-10421', desc: 'Detroit → Nashville · Acme Manufacturing', module: 'Brokerage', icon: '📦' },
                  { type: 'Import', id: 'JFK-IMP-0901', desc: 'MAWB 176-82445521 · Samsung Electronics', module: 'CFS', icon: '✈' },
                  { type: 'Invoice', id: 'INV-2026-1042', desc: 'Acme Manufacturing · $3,200', module: 'Billing', icon: '💰' },
                  { type: 'Driver', id: 'Marcus Johnson', desc: 'T-1042 · Memphis, TN · Active', module: 'Carrier', icon: '👤' },
                  { type: 'Customer', id: 'ACME-US', desc: 'Acme Manufacturing · Detroit, MI', module: 'All', icon: '🏢' },
                ].filter(r => r.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) || r.desc.toLowerCase().includes(globalSearchQuery.toLowerCase())).map((r, i) => (
                  <button key={i} onClick={() => setShowGlobalSearch(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left">
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1"><p className="text-sm font-medium text-gray-900">{r.id}</p><p className="text-xs text-gray-500">{r.desc}</p></div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{r.module}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">Press Esc to close · Search loads, shipments, MAWBs, invoices, customers, drivers, VINs</div>
          </div>
        </div>
      )}

      {/* ── #37 Audit Trail ──────────────────────────────── */}
      {showAuditTrail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAuditTrail(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-900">📋 Audit Trail — All Modules</h2><button onClick={() => setShowAuditTrail(false)} className="text-gray-400 hover:text-gray-600">×</button></div>
            <div className="px-6 py-4">
              <div className="flex gap-2 mb-4">
                {['All', 'Carrier', 'Brokerage', 'CFS', 'Billing', 'Settings'].map(f => <button key={f} className={`px-3 py-1 text-xs rounded font-medium ${f === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>)}
              </div>
              <div className="space-y-1">
                {[
                  { time: '2:30 PM', user: 'Jake Martinez', action: 'Dispatched trip TRP-0414-001 to Marcus Johnson', module: 'CFS', type: 'DISPATCH' },
                  { time: '2:15 PM', user: 'Karen Liu', action: 'Filed ISF for MAWB 297-88100345', module: 'CFS', type: 'CUSTOMS' },
                  { time: '1:25 PM', user: 'System', action: 'Auto-dunning email sent to Heartland Foods (30-day notice)', module: 'Brokerage', type: 'BILLING' },
                  { time: '12:30 PM', user: 'Henry Fung', action: 'Approved credit application for Westbrook Electronics ($75,000)', module: 'Brokerage', type: 'CREDIT' },
                  { time: '11:45 AM', user: 'Priya Patel', action: 'Updated carrier Eagle Freight Lines insurance — verified current', module: 'Brokerage', type: 'CARRIER' },
                  { time: '10:50 AM', user: 'System', action: 'CargoWise sync completed — 3 invoices pushed, 0 errors', module: 'Carrier', type: 'SYNC' },
                  { time: '10:15 AM', user: 'Mike Santos', action: 'Created rate card for Samsung Electronics (SAMSUNG-KR)', module: 'Billing', type: 'RATE' },
                  { time: '9:30 AM', user: 'Tom Garcia', action: 'Received cargo JFK-IMP-0902 — 48 pcs, no damage', module: 'CFS', type: 'WAREHOUSE' },
                  { time: '9:00 AM', user: 'Jake Martinez', action: 'Changed user role: Rachel Thompson → Operations (ORD)', module: 'Settings', type: 'USER' },
                  { time: '8:30 AM', user: 'Linda Kim', action: 'Generated invoice INV-2026-1042 for Acme Manufacturing ($3,200)', module: 'Billing', type: 'INVOICE' },
                ].map((e, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-gray-50">
                    <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">{e.time}</span>
                    <div className="flex-1"><p className="text-xs text-gray-800"><strong>{e.user}</strong> — {e.action}</p></div>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${e.module === 'Carrier' ? 'bg-blue-100 text-blue-800' : e.module === 'Brokerage' ? 'bg-emerald-100 text-emerald-800' : e.module === 'CFS' ? 'bg-violet-100 text-violet-800' : e.module === 'Billing' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{e.module}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── #36 Alert Delivery Settings ──────────────────── */}
      {showAlertSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAlertSettings(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">⚙ Alert & Notification Delivery</h2><p className="text-xs text-gray-400 mt-0.5">Configure how and where alerts are delivered</p></div>
            <div className="px-6 py-4 space-y-3">
              {[
                { event: 'Customs Hold', inApp: true, email: true, sms: true },
                { event: 'Insurance Expiry (30d)', inApp: true, email: true, sms: false },
                { event: 'Late Delivery', inApp: true, email: true, sms: true },
                { event: 'Payment Received', inApp: true, email: true, sms: false },
                { event: 'Invoice Overdue', inApp: true, email: true, sms: false },
                { event: 'Driver HOS Violation', inApp: true, email: true, sms: true },
                { event: 'CBP Exam Scheduled', inApp: true, email: true, sms: true },
                { event: 'CargoWise Sync Error', inApp: true, email: true, sms: false },
                { event: 'New Load Posted', inApp: true, email: false, sms: false },
                { event: 'Carrier Scorecard Drop', inApp: true, email: true, sms: false },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-800 flex-1">{a.event}</span>
                  <div className="flex gap-3">{[{ label: 'In-App', checked: a.inApp }, { label: 'Email', checked: a.email }, { label: 'SMS', checked: a.sms }].map((ch, j) => (
                    <label key={j} className="flex items-center gap-1 text-xs text-gray-600"><input type="checkbox" defaultChecked={ch.checked} className="rounded text-blue-600" />{ch.label}</label>
                  ))}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200"><button onClick={() => setShowAlertSettings(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={() => setShowAlertSettings(false)} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">Save Settings</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
