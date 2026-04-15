import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

// ── Types ──────────────────────────────────────────────────────────
interface Claim {
  id: string; claimNumber: string; loadNumber: string; customer: string; carrier: string;
  type: 'CARGO_DAMAGE' | 'CARGO_LOSS' | 'SHORTAGE' | 'DELAY' | 'OVERCHARGE' | 'OTHER';
  status: 'OPEN' | 'INVESTIGATING' | 'CARRIER_NOTIFIED' | 'PENDING_DOCS' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | 'SETTLED' | 'CLOSED';
  filedDate: string; incidentDate: string; resolvedDate: string;
  claimAmount: number; approvedAmount: number; paidAmount: number;
  description: string; resolution: string;
  filedBy: string; assignedTo: string;
  documents: { name: string; type: string; date: string }[];
  notes: { date: string; user: string; text: string }[];
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_CLAIMS: Claim[] = [
  { id: 'cl1', claimNumber: 'CLM-2026-0041', loadNumber: 'SH-10421', customer: 'Acme Manufacturing', carrier: 'Eagle Freight Lines', type: 'CARGO_DAMAGE', status: 'INVESTIGATING', filedDate: '2026-04-14', incidentDate: '2026-04-13', resolvedDate: '', claimAmount: 4200, approvedAmount: 0, paidAmount: 0, description: '3 pallets of auto parts damaged during transit — water intrusion through trailer roof leak. Consignee rejected 3 of 24 pallets at delivery.', resolution: '', filedBy: 'Karen Liu', assignedTo: 'Mike Santos', documents: [{ name: 'Damage_Photos_SH10421.zip', type: 'Photos', date: '2026-04-14' }, { name: 'Consignee_Rejection_Notice.pdf', type: 'Rejection', date: '2026-04-13' }, { name: 'BOL_SH10421_Noted.pdf', type: 'BOL (Noted)', date: '2026-04-13' }], notes: [{ date: '2026-04-14T10:00:00Z', user: 'Karen Liu', text: 'Claim filed — consignee reported water damage on 3 pallets. Driver confirmed trailer had a small roof leak.' }, { date: '2026-04-14T11:30:00Z', user: 'Mike Santos', text: 'Contacted Eagle Freight dispatcher. They are pulling the driver\'s inspection report and photos.' }] },
  { id: 'cl2', claimNumber: 'CLM-2026-0040', loadNumber: 'SH-10415', customer: 'Acme Manufacturing', carrier: 'Midwest Express Trucking', type: 'SHORTAGE', status: 'CARRIER_NOTIFIED', filedDate: '2026-04-11', incidentDate: '2026-04-10', resolvedDate: '', claimAmount: 1850, approvedAmount: 0, paidAmount: 0, description: '2 pallets short at delivery — 22 received vs 24 on BOL. Customer claims pieces missing from shipment.', resolution: '', filedBy: 'Karen Liu', assignedTo: 'Mike Santos', documents: [{ name: 'BOL_SH10415_Shortage.pdf', type: 'BOL (Noted)', date: '2026-04-10' }, { name: 'Delivery_Receipt_Short.pdf', type: 'Delivery Receipt', date: '2026-04-10' }], notes: [{ date: '2026-04-11T09:00:00Z', user: 'Karen Liu', text: 'Shortage claim filed. Consignee signed BOL noting 22/24 pallets received.' }, { date: '2026-04-12T14:00:00Z', user: 'Mike Santos', text: 'Carrier notified via email. Midwest Express checking origin dock camera footage.' }] },
  { id: 'cl3', claimNumber: 'CLM-2026-0038', loadNumber: 'SH-10408', customer: 'Acme Manufacturing', carrier: 'Thunder Road Inc.', type: 'DELAY', status: 'SETTLED', filedDate: '2026-04-09', incidentDate: '2026-04-08', resolvedDate: '2026-04-12', claimAmount: 500, approvedAmount: 350, paidAmount: 350, description: 'Delivery was 4 hours late due to carrier mechanical breakdown. Customer assessed detention charges.', resolution: 'Carrier agreed to $350 credit — 50% of detention charged by consignee. Applied as credit on next carrier bill.', filedBy: 'Priya Patel', assignedTo: 'Karen Liu', documents: [{ name: 'Detention_Invoice_SH10408.pdf', type: 'Invoice', date: '2026-04-08' }, { name: 'Carrier_Credit_Memo.pdf', type: 'Credit Memo', date: '2026-04-12' }], notes: [{ date: '2026-04-09T08:00:00Z', user: 'Priya Patel', text: 'Late delivery claim filed. Customer charged $700 detention for 4 hours.' }, { date: '2026-04-10T15:00:00Z', user: 'Karen Liu', text: 'Thunder Road acknowledged breakdown. Negotiating credit.' }, { date: '2026-04-12T11:00:00Z', user: 'Karen Liu', text: 'Settled at $350. Credit applied to BL-THR-4425.' }] },
  { id: 'cl4', claimNumber: 'CLM-2026-0035', loadNumber: 'SH-10395', customer: 'Heartland Foods', carrier: 'Arctic Cold Carriers', type: 'CARGO_DAMAGE', status: 'APPROVED', filedDate: '2026-04-02', incidentDate: '2026-04-01', resolvedDate: '', claimAmount: 12500, approvedAmount: 12500, paidAmount: 0, description: 'Reefer unit failure during transit — temperature rose from 34°F to 58°F. Entire load of perishable produce rejected by consignee.', resolution: 'Full claim approved — carrier insurance to cover. Awaiting insurance payout.', filedBy: 'Karen Liu', assignedTo: 'Mike Santos', documents: [{ name: 'TempLog_SH10395.pdf', type: 'Temperature Log', date: '2026-04-01' }, { name: 'Rejection_Notice_Dallas.pdf', type: 'Rejection', date: '2026-04-01' }, { name: 'Carrier_Insurance_Claim.pdf', type: 'Insurance Claim', date: '2026-04-03' }, { name: 'Product_Valuation_Invoice.pdf', type: 'Valuation', date: '2026-04-02' }], notes: [{ date: '2026-04-02T08:00:00Z', user: 'Karen Liu', text: 'Major claim — full load of perishable produce lost. Reefer malfunction confirmed by temperature logs.' }, { date: '2026-04-03T10:00:00Z', user: 'Mike Santos', text: 'Arctic Cold submitted to their cargo insurance. Claim approved for full $12,500.' }, { date: '2026-04-05T09:00:00Z', user: 'Mike Santos', text: 'Insurance adjuster reviewing. Expected payout within 30 days.' }] },
  { id: 'cl5', claimNumber: 'CLM-2026-0032', loadNumber: 'SH-10380', customer: 'Great Lakes Chemicals', carrier: 'Lone Star Logistics', type: 'CARGO_LOSS', status: 'DENIED', filedDate: '2026-03-25', incidentDate: '2026-03-24', resolvedDate: '2026-04-05', claimAmount: 8000, approvedAmount: 0, paidAmount: 0, description: 'Customer claims 4 drums of industrial chemicals missing from delivery. Driver and carrier dispute claim.', resolution: 'Claim denied — dock camera footage at origin confirms only 12 drums loaded (not 16 as claimed). Customer notified.', filedBy: 'Priya Patel', assignedTo: 'Karen Liu', documents: [{ name: 'BOL_SH10380.pdf', type: 'BOL', date: '2026-03-24' }, { name: 'Dock_Camera_Footage_Summary.pdf', type: 'Evidence', date: '2026-03-28' }], notes: [{ date: '2026-03-25T10:00:00Z', user: 'Priya Patel', text: 'Cargo loss claim filed by Great Lakes. They say 4 of 16 drums missing.' }, { date: '2026-03-28T14:00:00Z', user: 'Karen Liu', text: 'Origin dock camera shows only 12 drums loaded. BOL was signed for 12.' }, { date: '2026-04-05T09:00:00Z', user: 'Karen Liu', text: 'Claim denied. Customer acknowledged camera evidence.' }] },
  { id: 'cl6', claimNumber: 'CLM-2026-0029', loadNumber: 'SH-10370', customer: 'Pacific Retail Group', carrier: 'Summit Flatbed Services', type: 'CARGO_DAMAGE', status: 'CLOSED', filedDate: '2026-03-18', incidentDate: '2026-03-17', resolvedDate: '2026-03-28', claimAmount: 3400, approvedAmount: 3400, paidAmount: 3400, description: 'Flatbed load shifted during transit — 2 crates of electronics damaged due to improper securement.', resolution: 'Full claim paid by carrier. Carrier acknowledged improper load securement.', filedBy: 'Mike Santos', assignedTo: 'Karen Liu', documents: [{ name: 'Damage_Photos_SH10370.zip', type: 'Photos', date: '2026-03-17' }, { name: 'Insurance_Payout_Confirmation.pdf', type: 'Payment', date: '2026-03-28' }], notes: [{ date: '2026-03-18T08:00:00Z', user: 'Mike Santos', text: 'Damage claim filed. Electronics crates shifted on flatbed.' }, { date: '2026-03-28T16:00:00Z', user: 'Karen Liu', text: 'Full $3,400 received from carrier insurance. Claim closed.' }] },
];

// ── Helpers ────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  CARGO_DAMAGE: { label: 'Cargo Damage', color: 'bg-red-100 text-red-800' },
  CARGO_LOSS: { label: 'Cargo Loss', color: 'bg-red-100 text-red-800' },
  SHORTAGE: { label: 'Shortage', color: 'bg-orange-100 text-orange-800' },
  DELAY: { label: 'Delay', color: 'bg-yellow-100 text-yellow-800' },
  OVERCHARGE: { label: 'Overcharge', color: 'bg-purple-100 text-purple-800' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  INVESTIGATING: { label: 'Investigating', color: 'bg-indigo-100 text-indigo-800' },
  CARRIER_NOTIFIED: { label: 'Carrier Notified', color: 'bg-purple-100 text-purple-800' },
  PENDING_DOCS: { label: 'Pending Docs', color: 'bg-yellow-100 text-yellow-800' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-orange-100 text-orange-800' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  DENIED: { label: 'Denied', color: 'bg-red-100 text-red-800' },
  SETTLED: { label: 'Settled', color: 'bg-teal-100 text-teal-800' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
};
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }
function fmtDT(d: string) { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }

// ── Component ──────────────────────────────────────────────────────
export function BrokerageClaims() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => MOCK_CLAIMS.filter(c => statusFilter === 'All' || c.status === statusFilter), [statusFilter]);

  const stats = useMemo(() => ({
    openCount: MOCK_CLAIMS.filter(c => !['CLOSED', 'DENIED', 'SETTLED'].includes(c.status)).length,
    totalClaimedOpen: MOCK_CLAIMS.filter(c => !['CLOSED', 'DENIED', 'SETTLED'].includes(c.status)).reduce((s, c) => s + c.claimAmount, 0),
    totalPaid: MOCK_CLAIMS.reduce((s, c) => s + c.paidAmount, 0),
    totalDenied: MOCK_CLAIMS.filter(c => c.status === 'DENIED').reduce((s, c) => s + c.claimAmount, 0),
    totalSettled: MOCK_CLAIMS.filter(c => ['SETTLED', 'CLOSED'].includes(c.status)).reduce((s, c) => s + c.approvedAmount, 0),
    avgResolution: (() => { const resolved = MOCK_CLAIMS.filter(c => c.resolvedDate); if (resolved.length === 0) return 0; return Math.round(resolved.reduce((s, c) => s + Math.ceil((new Date(c.resolvedDate).getTime() - new Date(c.filedDate).getTime()) / 86400000), 0) / resolved.length); })(),
  }), []);

  const exportClaims = () => {
    const data = MOCK_CLAIMS.map(c => ({ 'Claim #': c.claimNumber, Load: c.loadNumber, Customer: c.customer, Carrier: c.carrier, Type: TYPE_BADGE[c.type].label, Status: STATUS_BADGE[c.status].label, Filed: c.filedDate, Incident: c.incidentDate, Resolved: c.resolvedDate || '—', 'Claim Amount': c.claimAmount, 'Approved': c.approvedAmount, 'Paid': c.paidAmount, Description: c.description }));
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claims');
    XLSX.writeFile(wb, `Gemini_Claims_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Claims Management</h2>
        <div className="flex gap-2">
          <button onClick={exportClaims} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">⬇ Export</button>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">+ File New Claim</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Open Claims</p><p className={`text-xl font-bold ${stats.openCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.openCount}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Open Amount</p><p className="text-xl font-bold text-red-600">{fmtCurrency(stats.totalClaimedOpen)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Paid</p><p className="text-xl font-bold text-green-600">{fmtCurrency(stats.totalPaid)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Settled</p><p className="text-xl font-bold text-teal-600">{fmtCurrency(stats.totalSettled)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Denied</p><p className="text-xl font-bold text-gray-600">{fmtCurrency(stats.totalDenied)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Avg Resolution</p><p className="text-xl font-bold text-gray-900">{stats.avgResolution}d</p></div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1 mb-3">
        {['All', 'OPEN', 'INVESTIGATING', 'CARRIER_NOTIFIED', 'APPROVED', 'SETTLED', 'DENIED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : STATUS_BADGE[s]?.label || s}</button>
        ))}
      </div>

      {/* Claims Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Claim #</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customer</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Filed</th>
          <th className="text-right px-3 py-2.5 font-medium text-gray-500">Claimed</th>
          <th className="text-right px-3 py-2.5 font-medium text-gray-500">Approved</th>
          <th className="text-right px-3 py-2.5 font-medium text-gray-500">Paid</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          <th className="text-left px-3 py-2.5 font-medium text-gray-500">Assigned</th>
        </tr></thead><tbody>
          {filtered.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400">No claims found.</td></tr>}
          {filtered.map(c => (
            <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${c.status === 'DENIED' ? 'opacity-50' : c.claimAmount >= 10000 ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`} onClick={() => setSelectedClaim(c)}>
              <td className="px-3 py-2.5 font-semibold text-blue-600">{c.claimNumber}</td>
              <td className="px-3 py-2.5 text-gray-700">{c.loadNumber}</td>
              <td className="px-3 py-2.5 text-gray-700">{c.customer}</td>
              <td className="px-3 py-2.5 text-gray-700">{c.carrier}</td>
              <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[c.type].color}`}>{TYPE_BADGE[c.type].label}</span></td>
              <td className="px-3 py-2.5 text-gray-600">{fmtDate(c.filedDate)}</td>
              <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(c.claimAmount)}</td>
              <td className="px-3 py-2.5 text-right font-medium text-green-600">{c.approvedAmount > 0 ? fmtCurrency(c.approvedAmount) : '—'}</td>
              <td className="px-3 py-2.5 text-right font-medium">{c.paidAmount > 0 ? <span className="text-green-600">{fmtCurrency(c.paidAmount)}</span> : '—'}</td>
              <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status].color}`}>{STATUS_BADGE[c.status].label}</span></td>
              <td className="px-3 py-2.5 text-gray-600">{c.assignedTo}</td>
            </tr>
          ))}
        </tbody></table>
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
          <span>Showing: <strong>{filtered.length}</strong> of {MOCK_CLAIMS.length}</span>
          <span>Total Claimed: <strong>{fmtCurrency(filtered.reduce((s, c) => s + c.claimAmount, 0))}</strong></span>
        </div>
      </div>

      {/* ── Claim Detail Flyout ──────────────────────── */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedClaim(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[500px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{selectedClaim.claimNumber}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedClaim.status].color}`}>{STATUS_BADGE[selectedClaim.status].label}</span>
                </div>
                <button onClick={() => setSelectedClaim(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[selectedClaim.type].color}`}>{TYPE_BADGE[selectedClaim.type].label}</span>
                <span className="text-xs text-gray-400">{selectedClaim.loadNumber}</span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Amount Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-red-600">{fmtCurrency(selectedClaim.claimAmount)}</p><p className="text-xs text-gray-500">Claimed</p></div>
                <div className="bg-green-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-green-600">{selectedClaim.approvedAmount > 0 ? fmtCurrency(selectedClaim.approvedAmount) : '—'}</p><p className="text-xs text-gray-500">Approved</p></div>
                <div className="bg-blue-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-blue-600">{selectedClaim.paidAmount > 0 ? fmtCurrency(selectedClaim.paidAmount) : '—'}</p><p className="text-xs text-gray-500">Paid</p></div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Customer</p><p className="text-sm font-semibold text-gray-900">{selectedClaim.customer}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Carrier (Liable)</p><p className="text-sm font-semibold text-gray-900">{selectedClaim.carrier}</p></div>
              </div>

              {/* Description */}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Description</h4><p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{selectedClaim.description}</p></div>

              {/* Resolution */}
              {selectedClaim.resolution && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Resolution</h4><p className="text-xs text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3 leading-relaxed">{selectedClaim.resolution}</p></div>}

              {/* Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs text-gray-400">Incident Date</p><p className="text-xs font-medium text-gray-800">{fmtDate(selectedClaim.incidentDate)}</p></div>
                <div><p className="text-xs text-gray-400">Filed Date</p><p className="text-xs font-medium text-gray-800">{fmtDate(selectedClaim.filedDate)}</p></div>
                <div><p className="text-xs text-gray-400">Resolved</p><p className="text-xs font-medium text-gray-800">{fmtDate(selectedClaim.resolvedDate)}</p></div>
              </div>

              {/* Assigned */}
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Filed By</p><p className="text-xs font-medium text-gray-800">{selectedClaim.filedBy}</p></div>
                <div><p className="text-xs text-gray-400">Assigned To</p><p className="text-xs font-medium text-gray-800">{selectedClaim.assignedTo}</p></div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Supporting Documents ({selectedClaim.documents.length})</h4>
                <div className="space-y-1.5">
                  {selectedClaim.documents.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                      <div><p className="text-xs font-medium text-blue-600">{d.name}</p><p className="text-xs text-gray-400">{d.type} · {fmtDate(d.date)}</p></div>
                      <button className="text-xs text-gray-400 hover:text-blue-600">⬇</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity / Notes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Activity Log</h4>
                <div className="space-y-2">
                  {selectedClaim.notes.map((n, i) => (
                    <div key={i} className="border-l-2 border-blue-200 pl-3">
                      <p className="text-xs text-gray-400">{fmtDT(n.date)} — <span className="font-medium text-gray-600">{n.user}</span></p>
                      <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {!['CLOSED', 'DENIED', 'SETTLED'].includes(selectedClaim.status) && <>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Update Status</button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Add Note</button>
              </>}
              {['CLOSED', 'SETTLED'].includes(selectedClaim.status) && <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Reopen Claim</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── File New Claim Modal ─────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">File New Claim</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Load Number *</label><input type="text" placeholder="SH-XXXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Claim Type *</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Cargo Damage</option><option>Cargo Loss</option><option>Shortage</option><option>Delay</option><option>Overcharge</option><option>Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Incident Date *</label><input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Claim Amount *</label><input type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Describe the incident, damage, or loss..." /></div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50">
                <p className="text-sm text-gray-600">📸 Upload photos, BOL, rejection notices, or other evidence</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, ZIP — up to 25 MB</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Mike Santos</option><option>Karen Liu</option><option>Priya Patel</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">File Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
