import { useState, useMemo } from 'react';

interface Rate {
  id: string; lane: string; origin: string; destination: string; customer: string;
  type: 'CONTRACT' | 'SPOT' | 'TARIFF'; equipmentType: string;
  customerRate: number; carrierCost: number; margin: number; marginPct: number;
  effectiveDate: string; expiryDate: string; status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  volume: number; notes: string;
}

const MOCK_RATES: Rate[] = [
  { id: 'r1', lane: 'DET → CHI', origin: 'Detroit, MI', destination: 'Chicago, IL', customer: 'Acme Manufacturing', type: 'CONTRACT', equipmentType: 'Dry Van', customerRate: 2800, carrierCost: 2200, margin: 600, marginPct: 21.4, effectiveDate: '2026-01-01', expiryDate: '2026-12-31', status: 'ACTIVE', volume: 8, notes: 'Weekly commitment  8 loads/week' },
  { id: 'r2', lane: 'KC → DAL', origin: 'Kansas City, MO', destination: 'Dallas, TX', customer: 'Heartland Foods', type: 'CONTRACT', equipmentType: 'Reefer', customerRate: 3400, carrierCost: 2800, margin: 600, marginPct: 17.6, effectiveDate: '2026-01-01', expiryDate: '2026-06-30', status: 'ACTIVE', volume: 5, notes: 'Reefer  34°F constant' },
  { id: 'r3', lane: 'LAX → PHX', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', customer: 'Pacific Retail', type: 'CONTRACT', equipmentType: 'Dry Van', customerRate: 1800, carrierCost: 1350, margin: 450, marginPct: 25.0, effectiveDate: '2026-03-01', expiryDate: '2027-02-28', status: 'ACTIVE', volume: 4, notes: '' },
  { id: 'r4', lane: 'BHM → ATL', origin: 'Birmingham, AL', destination: 'Atlanta, GA', customer: 'SE Steel', type: 'CONTRACT', equipmentType: 'Flatbed', customerRate: 2200, carrierCost: 1800, margin: 400, marginPct: 18.2, effectiveDate: '2026-01-01', expiryDate: '2026-12-31', status: 'ACTIVE', volume: 3, notes: 'Flatbed  steel coils' },
  { id: 'r5', lane: 'CLE → PIT', origin: 'Cleveland, OH', destination: 'Pittsburgh, PA', customer: 'Great Lakes Chem', type: 'SPOT', equipmentType: 'Dry Van', customerRate: 1600, carrierCost: 1200, margin: 400, marginPct: 25.0, effectiveDate: '2026-04-10', expiryDate: '2026-04-17', status: 'ACTIVE', volume: 1, notes: 'One-time spot rate' },
  { id: 'r6', lane: 'CHI → IND', origin: 'Chicago, IL', destination: 'Indianapolis, IN', customer: 'NorthPoint Logistics', type: 'TARIFF', equipmentType: 'Dry Van', customerRate: 1400, carrierCost: 1050, margin: 350, marginPct: 25.0, effectiveDate: '2026-01-01', expiryDate: '2026-12-31', status: 'ACTIVE', volume: 6, notes: 'Standard tariff' },
  { id: 'r7', lane: 'BNA → MEM', origin: 'Nashville, TN', destination: 'Memphis, TN', customer: 'Summit HC', type: 'CONTRACT', equipmentType: 'Dry Van', customerRate: 1200, carrierCost: 900, margin: 300, marginPct: 25.0, effectiveDate: '2026-02-01', expiryDate: '2027-01-31', status: 'ACTIVE', volume: 2, notes: 'Medical supply  time critical' },
  { id: 'r8', lane: 'DET → CHI', origin: 'Detroit, MI', destination: 'Chicago, IL', customer: 'Acme Manufacturing', type: 'CONTRACT', equipmentType: 'Dry Van', customerRate: 2600, carrierCost: 2100, margin: 500, marginPct: 19.2, effectiveDate: '2025-01-01', expiryDate: '2025-12-31', status: 'EXPIRED', volume: 8, notes: 'Renewed at higher rate for 2026' },
  { id: 'r9', lane: 'AUS → HOU', origin: 'Austin, TX', destination: 'Houston, TX', customer: 'Westbrook Electronics', type: 'PENDING', equipmentType: 'Dry Van', customerRate: 1500, carrierCost: 1100, margin: 400, marginPct: 26.7, effectiveDate: '2026-05-01', expiryDate: '2027-04-30', status: 'PENDING', volume: 3, notes: 'Pending customer approval' },
];

const TYPE_BADGE: Record<string, string> = { CONTRACT: 'bg-blue-100 text-blue-800', SPOT: 'bg-orange-100 text-orange-800', TARIFF: 'bg-purple-100 text-purple-800', PENDING: 'bg-yellow-100 text-yellow-800' };
const STATUS_BADGE: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', EXPIRED: 'bg-gray-100 text-gray-500', PENDING: 'bg-yellow-100 text-yellow-800' };

export function BrokerageRates() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRateHistory, setShowRateHistory] = useState(false);

  const filtered = useMemo(() => MOCK_RATES.filter(r => {
    if (typeFilter !== 'All' && r.type !== typeFilter && r.status !== typeFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return r.lane.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.origin.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q); }
    return true;
  }), [typeFilter, searchQuery]);

  const activeRates = MOCK_RATES.filter(r => r.status === 'ACTIVE');
  const avgMargin = activeRates.length > 0 ? Math.round(activeRates.reduce((s, r) => s + r.marginPct, 0) / activeRates.length * 10) / 10 : 0;
  const totalWeeklyVol = activeRates.reduce((s, r) => s + r.volume, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Rates</h2>
        <div className="flex items-center gap-3">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search lane, customer..." className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => setShowRateHistory(true)} className="text-sm font-medium text-gray-700 px-4 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">📈 Rate Trending</button>
          <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700">+ Add Rate</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Active Rates</p><p className="text-xl font-bold text-gray-900">{activeRates.length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Avg Margin</p><p className={`text-xl font-bold ${avgMargin >= 20 ? 'text-green-600' : avgMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{avgMargin}%</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Weekly Volume</p><p className="text-xl font-bold text-gray-900">{totalWeeklyVol}</p><p className="text-xs text-gray-400 mt-1.5">loads/week</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Contract Rates</p><p className="text-xl font-bold text-blue-600">{activeRates.filter(r => r.type === 'CONTRACT').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Spot Rates</p><p className="text-xl font-bold text-orange-600">{activeRates.filter(r => r.type === 'SPOT').length}</p></div>
      </div>

      <div className="flex gap-1 mb-3">
        {['All', 'CONTRACT', 'SPOT', 'TARIFF', 'EXPIRED'].map(s => (
          <button key={s} onClick={() => setTypeFilter(s)} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${typeFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Lane</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customer</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Equipment</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Customer Rate</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Carrier Cost</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Margin</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Margin %</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Vol/Wk</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${r.status === 'EXPIRED' ? 'opacity-50' : r.marginPct < 15 ? 'bg-red-50 border-l-4 border-l-red-300' : ''}`}>
                  <td className="px-3 py-2.5"><span className="font-semibold text-blue-600">{r.lane}</span><br/><span className="text-xs text-gray-400">{r.origin} → {r.destination}</span></td>
                  <td className="px-3 py-2.5 text-gray-700">{r.customer}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[r.type]}`}>{r.type}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{r.equipmentType}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">${r.customerRate.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">${r.carrierCost.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-green-700">${r.margin.toLocaleString()}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${r.marginPct >= 20 ? 'text-green-600' : r.marginPct >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{r.marginPct}%</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{r.volume}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate History Trending Modal */}
      {showRateHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRateHistory(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Rate History & Trending by Lane</h2><p className="text-xs text-gray-400 mt-0.5">6-month rate comparison: Contract vs Spot vs Market</p></div>
            <div className="px-6 py-4">
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Lane</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Nov</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Dec</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Jan</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Feb</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Mar</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Apr</th>
                <th className="text-right px-2 py-2.5 font-medium text-gray-500">Δ 6mo</th>
                <th className="text-left px-2 py-2.5 font-medium text-gray-500">Trend</th>
              </tr></thead><tbody>
                {[
                  { lane: 'DET → CHI', rates: [2500, 2550, 2600, 2650, 2700, 2800], delta: 12.0, trend: '↗ Rising' },
                  { lane: 'KC → DAL', rates: [3200, 3300, 3350, 3400, 3400, 3400], delta: 6.3, trend: '→ Stable' },
                  { lane: 'LAX → PHX', rates: [1900, 1850, 1800, 1800, 1800, 1800], delta: -5.3, trend: '↘ Declining' },
                  { lane: 'BHM → ATL', rates: [2100, 2100, 2150, 2200, 2200, 2200], delta: 4.8, trend: '→ Stable' },
                  { lane: 'CHI → IND', rates: [1300, 1350, 1400, 1400, 1400, 1400], delta: 7.7, trend: '↗ Rising' },
                  { lane: 'BNA → MEM', rates: [1100, 1100, 1150, 1200, 1200, 1200], delta: 9.1, trend: '↗ Rising' },
                  { lane: 'AUS → HOU', rates: [1600, 1550, 1500, 1500, 1450, 1500], delta: -6.3, trend: '↘ Declining' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{r.lane}</td>
                    {r.rates.map((rate, j) => <td key={j} className={`text-right px-2 py-2.5 ${j === r.rates.length - 1 ? 'font-bold text-gray-900' : 'text-gray-600'}`}>${rate.toLocaleString()}</td>)}
                    <td className={`text-right px-2 py-2.5 font-bold ${r.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.delta > 0 ? '+' : ''}{r.delta}%</td>
                    <td className={`px-2 py-2.5 font-medium ${r.trend.includes('Rising') ? 'text-green-600' : r.trend.includes('Declining') ? 'text-red-600' : 'text-gray-500'}`}>{r.trend}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowRateHistory(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
