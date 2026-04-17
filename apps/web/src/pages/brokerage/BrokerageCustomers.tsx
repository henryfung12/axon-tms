import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface Customer {
  id: string; companyName: string; shortCode: string; type: 'SHIPPER' | 'CONSIGNEE' | 'BOTH';
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'; creditLimit: number; creditUsed: number;
  paymentTerms: string; avgDaysToPay: number; primaryContact: string; primaryEmail: string; primaryPhone: string;
  city: string; state: string; totalLoads: number; revenueYTD: number; lastLoadDate: string; notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', companyName: 'Acme Manufacturing', shortCode: 'ACME', type: 'SHIPPER', status: 'ACTIVE', creditLimit: 100000, creditUsed: 42000, paymentTerms: 'Net 30', avgDaysToPay: 28, primaryContact: 'John Reynolds', primaryEmail: 'john.r@acmemfg.com', primaryPhone: '(555) 200-1001', city: 'Detroit', state: 'MI', totalLoads: 124, revenueYTD: 248000, lastLoadDate: '2026-04-12', notes: 'Top account  weekly volume commitment' },
  { id: 'c2', companyName: 'Heartland Foods Inc.', shortCode: 'HTFD', type: 'SHIPPER', status: 'ACTIVE', creditLimit: 75000, creditUsed: 18500, paymentTerms: 'Net 30', avgDaysToPay: 32, primaryContact: 'Maria Gonzalez', primaryEmail: 'mgonzalez@heartlandfoods.com', primaryPhone: '(555) 200-1002', city: 'Kansas City', state: 'MO', totalLoads: 89, revenueYTD: 178000, lastLoadDate: '2026-04-13', notes: 'Reefer loads  temperature sensitive' },
  { id: 'c3', companyName: 'Pacific Retail Group', shortCode: 'PCRG', type: 'BOTH', status: 'ACTIVE', creditLimit: 50000, creditUsed: 31200, paymentTerms: 'Net 15', avgDaysToPay: 14, primaryContact: 'David Park', primaryEmail: 'dpark@pacificretail.com', primaryPhone: '(555) 200-1003', city: 'Los Angeles', state: 'CA', totalLoads: 67, revenueYTD: 134000, lastLoadDate: '2026-04-11', notes: 'Fast pay  great customer' },
  { id: 'c4', companyName: 'Southeastern Steel Co.', shortCode: 'SEST', type: 'SHIPPER', status: 'ACTIVE', creditLimit: 60000, creditUsed: 55800, paymentTerms: 'Net 45', avgDaysToPay: 48, primaryContact: 'Robert Mitchell', primaryEmail: 'rmitchell@sesteel.com', primaryPhone: '(555) 200-1004', city: 'Birmingham', state: 'AL', totalLoads: 45, revenueYTD: 112500, lastLoadDate: '2026-04-09', notes: 'Flatbed only  overweight permits needed' },
  { id: 'c5', companyName: 'Great Lakes Chemicals', shortCode: 'GLCH', type: 'SHIPPER', status: 'ACTIVE', creditLimit: 80000, creditUsed: 22000, paymentTerms: 'Net 30', avgDaysToPay: 30, primaryContact: 'Lisa Adams', primaryEmail: 'ladams@greatlakeschem.com', primaryPhone: '(555) 200-1005', city: 'Cleveland', state: 'OH', totalLoads: 38, revenueYTD: 95000, lastLoadDate: '2026-04-08', notes: 'HazMat loads  TWIC required' },
  { id: 'c6', companyName: 'NorthPoint Logistics', shortCode: 'NPTL', type: 'CONSIGNEE', status: 'ACTIVE', creditLimit: 40000, creditUsed: 12000, paymentTerms: 'Net 30', avgDaysToPay: 25, primaryContact: 'Amy Chen', primaryEmail: 'achen@northpointlog.com', primaryPhone: '(555) 200-1006', city: 'Chicago', state: 'IL', totalLoads: 52, revenueYTD: 78000, lastLoadDate: '2026-04-13', notes: '' },
  { id: 'c7', companyName: 'Summit Healthcare Supply', shortCode: 'SMHS', type: 'SHIPPER', status: 'ACTIVE', creditLimit: 30000, creditUsed: 8000, paymentTerms: 'Net 30', avgDaysToPay: 26, primaryContact: 'Kevin Wright', primaryEmail: 'kwright@summithc.com', primaryPhone: '(555) 200-1007', city: 'Nashville', state: 'TN', totalLoads: 28, revenueYTD: 56000, lastLoadDate: '2026-04-07', notes: 'Medical supply  time critical' },
  { id: 'c8', companyName: 'Westbrook Electronics', shortCode: 'WBEL', type: 'SHIPPER', status: 'PROSPECT', creditLimit: 0, creditUsed: 0, paymentTerms: 'TBD', avgDaysToPay: 0, primaryContact: 'Sarah Kim', primaryEmail: 'skim@westbrookelec.com', primaryPhone: '(555) 200-1008', city: 'Austin', state: 'TX', totalLoads: 0, revenueYTD: 0, lastLoadDate: '', notes: 'Sales lead  initial meeting 4/18' },
  { id: 'c9', companyName: 'Delta Paper Products', shortCode: 'DLPP', type: 'SHIPPER', status: 'INACTIVE', creditLimit: 25000, creditUsed: 0, paymentTerms: 'Net 30', avgDaysToPay: 42, primaryContact: 'Tom Harris', primaryEmail: 'tharris@deltapaper.com', primaryPhone: '(555) 200-1009', city: 'Memphis', state: 'TN', totalLoads: 12, revenueYTD: 0, lastLoadDate: '2025-11-20', notes: 'Slow pay  relationship on hold' },
];

// ── Helpers ────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', INACTIVE: 'bg-gray-100 text-gray-500', PROSPECT: 'bg-blue-100 text-blue-800' };
const TYPE_BADGE: Record<string, string> = { SHIPPER: 'bg-orange-100 text-orange-800', CONSIGNEE: 'bg-purple-100 text-purple-800', BOTH: 'bg-teal-100 text-teal-800' };
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
function fmtCurrency(n: number) { return n > 0 ? `$${n.toLocaleString()}` : ''; }

// ── Component ──────────────────────────────────────────────────────
export function BrokerageCustomers() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditApp, setShowCreditApp] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return c.companyName.toLowerCase().includes(q) || c.shortCode.toLowerCase().includes(q) || c.primaryContact.toLowerCase().includes(q) || c.city.toLowerCase().includes(q); }
      return true;
    });
  }, [statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: MOCK_CUSTOMERS.filter(c => c.status === 'ACTIVE').length,
    prospects: MOCK_CUSTOMERS.filter(c => c.status === 'PROSPECT').length,
    totalRevenue: MOCK_CUSTOMERS.filter(c => c.status === 'ACTIVE').reduce((s, c) => s + c.revenueYTD, 0),
    totalLoads: MOCK_CUSTOMERS.filter(c => c.status === 'ACTIVE').reduce((s, c) => s + c.totalLoads, 0),
    highCredit: MOCK_CUSTOMERS.filter(c => c.creditUsed / c.creditLimit > 0.8 && c.creditLimit > 0).length,
  }), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
        <div className="flex items-center gap-3">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search customer, contact, city..." className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-sm pl-8" />
          <button onClick={() => setShowCreditApp(true)} className="text-sm font-medium text-gray-700 px-4 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">📋 Credit Application</button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700">+ Add Customer</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Active Customers</p><p className="text-xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-blue-600 mt-1.5">{stats.prospects} prospects</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Revenue (YTD)</p><p className="text-xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(0)}k</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Loads (YTD)</p><p className="text-xl font-bold text-gray-900">{stats.totalLoads}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Avg Revenue/Load</p><p className="text-xl font-bold text-gray-900">${stats.totalLoads > 0 ? Math.round(stats.totalRevenue / stats.totalLoads).toLocaleString() : 0}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Credit Alerts</p><p className={`text-xl font-bold ${stats.highCredit > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.highCredit}</p><p className="text-xs text-gray-400 mt-1.5">over 80% utilization</p></div>
      </div>

      <div className="flex gap-1 mb-3">
        {['All', 'ACTIVE', 'PROSPECT', 'INACTIVE'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Company</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Contact</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Credit</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Terms</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Loads (YTD)</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Revenue (YTD)</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Load</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-400 text-sm">No customers found.</td></tr>}
              {filtered.map(c => {
                const creditPct = c.creditLimit > 0 ? (c.creditUsed / c.creditLimit) * 100 : 0;
                return (
                  <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${creditPct > 80 && c.creditLimit > 0 ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`} onClick={() => setSelectedCustomer(c)}>
                    <td className="px-3 py-2.5"><span className="font-semibold text-blue-600">{c.companyName}</span><br/><span className="text-xs text-gray-400">{c.shortCode}</span></td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[c.type]}`}>{c.type}</span></td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                    <td className="px-3 py-2.5"><span className="text-sm text-gray-800">{c.primaryContact}</span><br/><span className="text-xs text-gray-400">{c.primaryEmail}</span></td>
                    <td className="px-3 py-2.5 text-gray-600">{c.city}, {c.state}</td>
                    <td className="px-3 py-2.5 text-right">{c.creditLimit > 0 ? (<div><div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden inline-block align-middle mr-1"><div className={`h-full rounded-full ${creditPct > 80 ? 'bg-red-500' : creditPct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${creditPct}%` }} /></div><span className="text-xs text-gray-600">{Math.round(creditPct)}%</span></div>) : <span className="text-gray-300"></span>}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{c.paymentTerms}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{c.totalLoads || ''}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(c.revenueYTD)}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-sm">{fmtDate(c.lastLoadDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Flyout */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCustomer(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{selectedCustomer.companyName}</h3>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">{selectedCustomer.shortCode}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedCustomer.status]}`}>{selectedCustomer.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[selectedCustomer.type]}`}>{selectedCustomer.type}</span>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{selectedCustomer.totalLoads}</p><p className="text-xs text-gray-400">Loads YTD</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{fmtCurrency(selectedCustomer.revenueYTD)}</p><p className="text-xs text-gray-400">Revenue YTD</p></div>
              </div>
              {selectedCustomer.creditLimit > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Credit</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Used: {fmtCurrency(selectedCustomer.creditUsed)}</span><span className="text-gray-500">Limit: {fmtCurrency(selectedCustomer.creditLimit)}</span></div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(selectedCustomer.creditUsed/selectedCustomer.creditLimit) > 0.8 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(selectedCustomer.creditUsed/selectedCustomer.creditLimit)*100}%` }} /></div>
                    <div className="flex justify-between text-xs mt-2"><span className="text-gray-500">Terms: {selectedCustomer.paymentTerms}</span><span className="text-gray-500">Avg days to pay: {selectedCustomer.avgDaysToPay}d</span></div>
                  </div>
                </div>
              )}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Primary Contact</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1"><p className="text-sm font-medium text-gray-900">{selectedCustomer.primaryContact}</p><p className="text-xs text-blue-600">{selectedCustomer.primaryEmail}</p><p className="text-xs text-gray-600">{selectedCustomer.primaryPhone}</p><p className="text-xs text-gray-500">{selectedCustomer.city}, {selectedCustomer.state}</p></div></div>
              {selectedCustomer.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedCustomer.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">New Shipment</button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Add Customer</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input type="text" placeholder="Company name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Code *</label><input type="text" placeholder="4-letter code" maxLength={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Shipper</option><option>Consignee</option><option>Both</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Prospect</option><option>Active</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option></select></div>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input type="text" maxLength={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" /></div></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Add Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Application Modal */}
      {showCreditApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreditApp(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Credit Application Workflow</h2><p className="text-xs text-gray-400 mt-0.5">Review and approve customer credit applications</p></div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-4 gap-3 mb-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs text-gray-400">Pending Review</p><p className="text-xl font-bold text-yellow-600">3</p></div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-xs text-gray-400">Under Review</p><p className="text-xl font-bold text-blue-600">1</p></div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-xs text-gray-400">Approved (MTD)</p><p className="text-xl font-bold text-green-600">5</p></div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-xs text-gray-400">Declined</p><p className="text-xl font-bold text-red-600">1</p></div>
              </div>
              {[
                { company: 'Westbrook Electronics', contact: 'Tom Reeves', requested: 75000, duns: '12-345-6789', yrsInBusiness: 8, status: 'PENDING', submitted: 'Apr 12', refs: 3 },
                { company: 'Apex Manufacturing', contact: 'Diana Chen', requested: 150000, duns: '98-765-4321', yrsInBusiness: 15, status: 'UNDER_REVIEW', submitted: 'Apr 10', refs: 3 },
                { company: 'FastTrack Retail', contact: 'Mark Johnson', requested: 50000, duns: '55-123-4567', yrsInBusiness: 3, status: 'PENDING', submitted: 'Apr 13', refs: 2 },
                { company: 'Greenfield Organics', contact: 'Sarah Kim', requested: 25000, duns: '77-888-9999', yrsInBusiness: 2, status: 'PENDING', submitted: 'Apr 14', refs: 1 },
              ].map((app, i) => (
                <div key={i} className={`border rounded-lg p-4 ${app.status === 'UNDER_REVIEW' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div><p className="text-sm font-bold text-gray-900">{app.company}</p><p className="text-xs text-gray-400">{app.contact} · DUNS: {app.duns} · {app.yrsInBusiness} yrs in business</p></div>
                    <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{app.status === 'PENDING' ? 'Pending Review' : 'Under Review'}</span><span className="text-sm font-bold text-gray-900">${app.requested.toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2"><span>Submitted: {app.submitted}</span><span>·</span><span>Trade refs: {app.refs}</span><span>·</span><span>Requested limit: ${app.requested.toLocaleString()}</span></div>
                  <div className="flex gap-2"><button className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">✓ Approve</button><button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Review Details</button><button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">✗ Decline</button></div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowCreditApp(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
