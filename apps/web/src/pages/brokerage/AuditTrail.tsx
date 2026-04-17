import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

// Ã¢ââ¬Ã¢â€ Types Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢â€
interface AuditEntry {
  id: string; timestamp: string; user: string; userRole: string;
  module: 'CARRIER' | 'BROKERAGE' | 'DRIVER_APP' | 'SYSTEM' | 'EDI' | 'CARGOWISE';
  category: 'LOAD' | 'SHIPMENT' | 'INVOICE' | 'CARRIER' | 'CUSTOMER' | 'DRIVER' | 'ASSET' | 'SETTINGS' | 'USER' | 'DOCUMENT' | 'CLAIM' | 'RATE' | 'PAYMENT' | 'TRACKING' | 'AUTH';
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UPLOADED' | 'SYNCED' | 'SENT' | 'APPROVED' | 'REJECTED' | 'LOGIN' | 'EXPORTED';
  entity: string; entityId: string;
  description: string; details: string;
  ipAddress: string;
}

// Ã¢ââ¬Ã¢â€ Mock Data Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢â€
const MOCK_AUDIT: AuditEntry[] = [
  { id: 'au1', timestamp: '2026-04-14T14:22:00Z', user: 'Karen Liu', userRole: 'Operations', module: 'BROKERAGE', category: 'SHIPMENT', action: 'STATUS_CHANGED', entity: 'SH-10421', entityId: 's1', description: 'Shipment status changed to In Transit', details: 'Status: DISPATCHED Ã¢â  IN_TRANSIT. Carrier: Eagle Freight Lines. Driver confirmed pickup at Acme Detroit.', ipAddress: '10.0.1.42' },
  { id: 'au2', timestamp: '2026-04-14T14:18:00Z', user: 'System (Trucker Tools)', userRole: 'System', module: 'SYSTEM', category: 'TRACKING', action: 'UPDATED', entity: 'SH-10421', entityId: 's1', description: 'GPS location updated via Trucker Tools', details: 'Location: Bowling Green, KY 42101. Speed: 62 mph. Heading: South.', ipAddress: 'Ã¢â¬â' },
  { id: 'au3', timestamp: '2026-04-14T14:05:00Z', user: 'Mike Santos', userRole: 'Manager', module: 'BROKERAGE', category: 'CLAIM', action: 'CREATED', entity: 'CLM-2026-0041', entityId: 'cl1', description: 'New cargo damage claim filed', details: 'Load: SH-10421. Amount: $4,200. Type: Cargo Damage. 3 pallets water damaged. Assigned to Mike Santos.', ipAddress: '10.0.1.38' },
  { id: 'au4', timestamp: '2026-04-14T13:50:00Z', user: 'Karen Liu', userRole: 'Operations', module: 'BROKERAGE', category: 'SHIPMENT', action: 'ASSIGNED', entity: 'SH-10422', entityId: 's2', description: 'Carrier assigned to shipment', details: 'Carrier: Arctic Cold Carriers (MC-554321). Rate: $2,800. Equipment: Reefer. Payment: Net 15.', ipAddress: '10.0.1.42' },
  { id: 'au5', timestamp: '2026-04-14T13:30:00Z', user: 'System (CargoWise)', userRole: 'System', module: 'CARGOWISE', category: 'INVOICE', action: 'SYNCED', entity: 'INV-20260401', entityId: 'cw1', description: 'Invoice synced to CargoWise', details: 'CW Job: CW-BRK-20260401. Status: INVOICE_MATCHED. Amount: $2,800.', ipAddress: 'Ã¢â¬â' },
  { id: 'au6', timestamp: '2026-04-14T13:15:00Z', user: 'System (EDI)', userRole: 'System', module: 'EDI', category: 'SHIPMENT', action: 'CREATED', entity: 'SH-10428', entityId: 's8', description: 'EDI 204 Load Tender received and auto-accepted', details: 'Partner: Acme Manufacturing (ISA: ACME001). Route: Detroit, MI Ã¢â  Columbus, OH. Weight: 45,000 lbs.', ipAddress: 'Ã¢â¬â' },
  { id: 'au7', timestamp: '2026-04-14T12:45:00Z', user: 'Priya Patel', userRole: 'Sales', module: 'BROKERAGE', category: 'RATE', action: 'UPDATED', entity: 'Rate: DETÃ¢â CHI', entityId: 'r1', description: 'Contract rate updated', details: 'Customer: Acme Manufacturing. Old rate: $2,600. New rate: $2,800. Effective: 2026-01-01.', ipAddress: '10.0.1.55' },
  { id: 'au8', timestamp: '2026-04-14T12:30:00Z', user: 'Marcus Johnson', userRole: 'Driver', module: 'DRIVER_APP', category: 'LOAD', action: 'STATUS_CHANGED', entity: 'LD-4521', entityId: 'L001', description: 'Driver updated load status: At Delivery', details: 'Status: IN_TRANSIT Ã¢â  AT_DELIVERY. Location: Nashville, TN. Via Driver Mobile App.', ipAddress: '72.84.102.55' },
  { id: 'au9', timestamp: '2026-04-14T12:15:00Z', user: 'Marcus Johnson', userRole: 'Driver', module: 'DRIVER_APP', category: 'DOCUMENT', action: 'UPLOADED', entity: 'BOL_SH10421', entityId: 'doc2', description: 'Driver uploaded BOL via mobile app', details: 'File: BOL_SH10421_Signed.pdf. Size: 1.2 MB. Load: LD-4521.', ipAddress: '72.84.102.55' },
  { id: 'au10', timestamp: '2026-04-14T11:45:00Z', user: 'Jake Martinez', userRole: 'Full Admin', module: 'CARRIER', category: 'SETTINGS', action: 'UPDATED', entity: 'Integration: Truckstop', entityId: 'int7', description: 'Integration status changed to Connected', details: 'Truckstop.com load board integration activated. API key configured.', ipAddress: '10.0.1.10' },
  { id: 'au11', timestamp: '2026-04-14T11:30:00Z', user: 'Karen Liu', userRole: 'Operations', module: 'BROKERAGE', category: 'SHIPMENT', action: 'EXPORTED', entity: 'Shipments Export', entityId: '', description: 'Shipment data exported to Excel', details: 'Exported 12 shipments. Filter: All statuses. Format: XLSX.', ipAddress: '10.0.1.42' },
  { id: 'au12', timestamp: '2026-04-14T11:00:00Z', user: 'Jake Martinez', userRole: 'Full Admin', module: 'CARRIER', category: 'USER', action: 'CREATED', entity: 'User: Emily Taylor', entityId: 'u6', description: 'New user account created', details: 'Role: Operations. Email: emily.t@axontms.com. Access: Loads, Dispatch, Drivers, Assets.', ipAddress: '10.0.1.10' },
  { id: 'au13', timestamp: '2026-04-14T10:30:00Z', user: 'System (RMIS)', userRole: 'System', module: 'SYSTEM', category: 'CARRIER', action: 'UPDATED', entity: 'Carrier: Eagle Freight Lines', entityId: 'cr1', description: 'RMIS monitoring alert Ã¢â¬â insurance updated', details: 'Auto Liability policy renewed. New expiry: 2027-02-15. Carrier: Progressive Commercial.', ipAddress: 'Ã¢â¬â' },
  { id: 'au14', timestamp: '2026-04-14T10:00:00Z', user: 'System (RTS Financial)', userRole: 'System', module: 'SYSTEM', category: 'PAYMENT', action: 'APPROVED', entity: 'Quick Pay: BL-EFL-4521', entityId: 'f1', description: 'Quick pay funded via RTS Financial', details: 'Amount: $2,200. Fee: $66 (3%). Net: $2,134. Funded in 2 hours.', ipAddress: 'Ã¢â¬â' },
  { id: 'au15', timestamp: '2026-04-14T09:30:00Z', user: 'Sarah Chen', userRole: 'Driver', module: 'DRIVER_APP', category: 'AUTH', action: 'LOGIN', entity: 'Driver Login', entityId: 'd2', description: 'Driver logged into mobile app', details: 'Device: iPhone 15. OS: iOS 19.2. App: v1.0.4. IP: 72.84.110.88.', ipAddress: '72.84.110.88' },
  { id: 'au16', timestamp: '2026-04-14T09:15:00Z', user: 'Karen Liu', userRole: 'Operations', module: 'BROKERAGE', category: 'SHIPMENT', action: 'CREATED', entity: 'SH-10432', entityId: 's12', description: 'New shipment created', details: 'Customer: Heartland Foods. Route: Omaha, NE Ã¢â  Denver, CO. Rate: $3,100. Equipment: Reefer.', ipAddress: '10.0.1.42' },
  { id: 'au17', timestamp: '2026-04-14T09:00:00Z', user: 'Mike Santos', userRole: 'Manager', module: 'BROKERAGE', category: 'CUSTOMER', action: 'UPDATED', entity: 'Customer: Acme Manufacturing', entityId: 'c1', description: 'Customer credit limit updated', details: 'Credit limit: $75,000 Ã¢â  $100,000. Approved by Mike Santos.', ipAddress: '10.0.1.38' },
  { id: 'au18', timestamp: '2026-04-14T08:45:00Z', user: 'Jake Martinez', userRole: 'Full Admin', module: 'CARRIER', category: 'ASSET', action: 'UPDATED', entity: 'Asset: T-1042', entityId: 'a4', description: 'Toll tag assigned to vehicle', details: 'I-PASS tag IP-44213 linked. E-ZPass NY tag EZ-NY-88202 linked.', ipAddress: '10.0.1.10' },
  { id: 'au19', timestamp: '2026-04-14T08:30:00Z', user: 'System (DOE)', userRole: 'System', module: 'SYSTEM', category: 'RATE', action: 'UPDATED', entity: 'DOE Diesel Index', entityId: '', description: 'DOE National Average Diesel price updated', details: 'New price: $3.824/gal. Change: -$0.012. FSC/mile: $0.30. Week ending 4/14/2026.', ipAddress: 'Ã¢â¬â' },
  { id: 'au20', timestamp: '2026-04-14T08:00:00Z', user: 'Karen Liu', userRole: 'Operations', module: 'BROKERAGE', category: 'DOCUMENT', action: 'APPROVED', entity: 'Rate_Con_SH10421.pdf', entityId: 'doc1', description: 'Document approved', details: 'Type: Rate Confirmation. Load: SH-10421. Customer: Acme Manufacturing.', ipAddress: '10.0.1.42' },
];

// Ã¢ââ¬Ã¢â€ Helpers Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢â€
const MODULE_BADGE: Record<string, { bg: string; label: string }> = {
  CARRIER: { bg: 'bg-blue-100 text-blue-800', label: 'Carrier' },
  BROKERAGE: { bg: 'bg-emerald-100 text-emerald-800', label: 'Brokerage' },
  DRIVER_APP: { bg: 'bg-orange-100 text-orange-800', label: 'Driver App' },
  SYSTEM: { bg: 'bg-gray-100 text-gray-700', label: 'System' },
  EDI: { bg: 'bg-purple-100 text-purple-800', label: 'EDI' },
  CARGOWISE: { bg: 'bg-indigo-100 text-indigo-800', label: 'CargoWise' },
};

const ACTION_BADGE: Record<string, { bg: string; icon: string }> = {
  CREATED: { bg: 'bg-green-100 text-green-800', icon: '+' },
  UPDATED: { bg: 'bg-blue-100 text-blue-800', icon: 'âœŽ' },
  DELETED: { bg: 'bg-red-100 text-red-800', icon: 'Ã¢Å' },
  STATUS_CHANGED: { bg: 'bg-yellow-100 text-yellow-800', icon: 'âŸ³' },
  ASSIGNED: { bg: 'bg-purple-100 text-purple-800', icon: 'Ã¢â ' },
  UPLOADED: { bg: 'bg-teal-100 text-teal-800', icon: 'Ã¢â ' },
  SYNCED: { bg: 'bg-indigo-100 text-indigo-800', icon: 'â‡„' },
  SENT: { bg: 'bg-cyan-100 text-cyan-800', icon: 'Ã¢â ' },
  APPROVED: { bg: 'bg-green-100 text-green-800', icon: 'Ã¢Å' },
  REJECTED: { bg: 'bg-red-100 text-red-800', icon: 'Ã¢Å' },
  LOGIN: { bg: 'bg-gray-100 text-gray-700', icon: 'Ã°Å¸â' },
  EXPORTED: { bg: 'bg-orange-100 text-orange-800', icon: 'â¬‡' },
};

const CATEGORY_ICON: Record<string, string> = {
  LOAD: 'Ã°Å¸Â¦', SHIPMENT: 'ðŸšš', INVOICE: 'ðŸ§¾', CARRIER: 'Ã°Å¸Â¢', CUSTOMER: 'Ã°Å¸Â¥', DRIVER: 'Ã°Å¸Â¤',
  ASSET: 'ðŸš›', SETTINGS: 'âš™', USER: 'Ã°Å¸âÂ', DOCUMENT: 'Ã°Å¸â', CLAIM: 'âš ', RATE: 'Ã°Å¸°',
  PAYMENT: 'Ã°Å¸Â³', TRACKING: 'Ã°Å¸Â¡', AUTH: 'Ã°Å¸â',
};

function fmtDT(d: string) { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }); }

// Ã¢ââ¬Ã¢â€ Component Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢â€
export function AuditTrail() {
  const [moduleFilter, setModuleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [dateRange, setDateRange] = useState('today');

  const filtered = useMemo(() => MOCK_AUDIT.filter(e => {
    if (moduleFilter !== 'All' && e.module !== moduleFilter) return false;
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (actionFilter !== 'All' && e.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.description.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q) || e.user.toLowerCase().includes(q) || e.details.toLowerCase().includes(q);
    }
    return true;
  }), [moduleFilter, categoryFilter, actionFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: MOCK_AUDIT.length,
    byUser: MOCK_AUDIT.filter(e => !e.user.startsWith('System')).length,
    bySystem: MOCK_AUDIT.filter(e => e.user.startsWith('System')).length,
    creates: MOCK_AUDIT.filter(e => e.action === 'CREATED').length,
    updates: MOCK_AUDIT.filter(e => e.action === 'UPDATED' || e.action === 'STATUS_CHANGED').length,
  }), []);

  const exportAudit = () => {
    const data = filtered.map(e => ({ Timestamp: fmtDT(e.timestamp), User: e.user, Role: e.userRole, Module: MODULE_BADGE[e.module].label, Category: e.category, Action: e.action, Entity: e.entity, Description: e.description, Details: e.details, IP: e.ipAddress }));
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail');
    XLSX.writeFile(wb, `AXON_Audit_Trail_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
          <p className="text-xs text-gray-400 mt-0.5">All changes tracked across Carrier, Brokerage, Driver App, and System integrations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportAudit} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">â¬‡ Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Events (Today)</p><p className="text-xl font-bold text-gray-900">{stats.total}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">User Actions</p><p className="text-xl font-bold text-blue-600">{stats.byUser}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">System Events</p><p className="text-xl font-bold text-gray-600">{stats.bySystem}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Creates</p><p className="text-xl font-bold text-green-600">{stats.creates}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Updates</p><p className="text-xl font-bold text-yellow-600">{stats.updates}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Modules Active</p><p className="text-xl font-bold text-gray-900">{new Set(MOCK_AUDIT.map(e => e.module)).size}</p></div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Module:</label>
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option value="All">All Modules</option>
              {Object.entries(MODULE_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Category:</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option value="All">All Categories</option>
              {Object.keys(CATEGORY_ICON).map(k => <option key={k} value={k}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Action:</label>
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs">
              <option value="All">All Actions</option>
              {Object.keys(ACTION_BADGE).map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search user, entity, description..." className="w-full border border-gray-300 rounded px-3 py-1 text-xs" />
          </div>
          <div className="flex rounded overflow-hidden border border-gray-300 text-xs">
            {['today', '7d', '30d', 'all'].map(d => (
              <button key={d} onClick={() => setDateRange(d)} className={`px-2.5 py-1 font-medium ${dateRange === d ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{d === 'today' ? 'Today' : d === '7d' ? '7 Days' : d === '30d' ? '30 Days' : 'All'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 w-36">Timestamp</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">User</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Module</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 w-10">Cat</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Action</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Entity</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Description</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">No audit entries found matching filters.</td></tr>}
            {filtered.map(e => {
              const modBadge = MODULE_BADGE[e.module];
              const actBadge = ACTION_BADGE[e.action];
              return (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedEntry(e)}>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap font-mono">{fmtTime(e.timestamp)}</td>
                  <td className="px-3 py-2"><span className={`font-medium ${e.user.startsWith('System') ? 'text-gray-400 italic' : 'text-gray-800'}`}>{e.user}</span></td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${modBadge.bg}`}>{modBadge.label}</span></td>
                  <td className="px-3 py-2 text-center" title={e.category}>{CATEGORY_ICON[e.category] || 'Ã°Å¸Å'}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${actBadge.bg}`}>{actBadge.icon} {e.action.replace('_', ' ')}</span></td>
                  <td className="px-3 py-2 font-medium text-blue-600 whitespace-nowrap">{e.entity}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{e.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          <span>Showing {filtered.length} of {MOCK_AUDIT.length} entries</span>
          <span>Date: {dateRange === 'today' ? 'Today' : dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'All time'}</span>
        </div>
      </div>

      {/* Detail Flyout */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedEntry(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[460px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">Audit Entry Detail</h3>
                <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 text-lg">Ã</button>
              </div>
              <p className="text-xs text-gray-400 font-mono">{fmtDT(selectedEntry.timestamp)}</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Who */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Who</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEntry.user}</p>
                <p className="text-xs text-gray-500">{selectedEntry.userRole} Ã· IP: {selectedEntry.ipAddress}</p>
              </div>

              {/* What */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Module</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[selectedEntry.module].bg}`}>{MODULE_BADGE[selectedEntry.module].label}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Action</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_BADGE[selectedEntry.action].bg}`}>{ACTION_BADGE[selectedEntry.action].icon} {selectedEntry.action.replace('_', ' ')}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Category</p>
                  <span className="text-xs text-gray-700">{CATEGORY_ICON[selectedEntry.category]} {selectedEntry.category}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Entity</p>
                  <span className="text-xs font-semibold text-blue-600">{selectedEntry.entity}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selectedEntry.description}</p>
              </div>

              {/* Details */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Change Details</p>
                <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed font-mono whitespace-pre-wrap">{selectedEntry.details}</p>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-gray-400">Entry ID</span><span className="font-mono text-gray-600">{selectedEntry.id}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Timestamp</span><span className="font-mono text-gray-600">{selectedEntry.timestamp}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">IP Address</span><span className="font-mono text-gray-600">{selectedEntry.ipAddress}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Entity ID</span><span className="font-mono text-gray-600">{selectedEntry.entityId || 'Ã¢â¬â'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
