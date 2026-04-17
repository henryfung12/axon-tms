import { useState } from 'react';

const TERMINALS = [
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'Queens, NY', imports: 24, exports: 18, pending: 6 },
  { code: 'ORD', name: "O'Hare Intl", city: 'Chicago, IL', imports: 12, exports: 8, pending: 3 },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami, FL', imports: 18, exports: 14, pending: 5 },
  { code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas, TX', imports: 8, exports: 6, pending: 2 },
  { code: 'ATL', name: 'Hartsfield-Jackson Intl', city: 'Atlanta, GA', imports: 10, exports: 7, pending: 4 },
];

const RECENT_ACTIVITY = [
  { time: '2:15 PM', type: 'IMPORT', desc: 'MAWB 176-82445521 cleared customs  ready for pickup at JFK Bldg 75', status: 'READY' },
  { time: '1:45 PM', type: 'EXPORT', desc: 'TSA screening complete  4 pallets cleared for KE 082 to ICN', status: 'CLEARED' },
  { time: '1:20 PM', type: 'CUSTOMS', desc: 'FDA hold on HAWB JFK-IMP-0892  perishable goods require inspection', status: 'HOLD' },
  { time: '12:50 PM', type: 'WAREHOUSE', desc: 'Deconsolidation complete  MAWB 180-99321100 split into 6 HAWBs', status: 'COMPLETE' },
  { time: '12:15 PM', type: 'IMPORT', desc: 'Driver dispatched to ORD Terminal 5  pickup MAWB 618-44210098', status: 'DISPATCHED' },
  { time: '11:30 AM', type: 'EXPORT', desc: 'Cargo received at CFS  consolidation for AA 2287 to LHR', status: 'RECEIVED' },
  { time: '11:00 AM', type: 'BILLING', desc: 'Invoice GE-CFS-20260414 generated  Nippon Express, $4,280', status: 'INVOICED' },
  { time: '10:30 AM', type: 'IMPORT', desc: 'MAWB 235-11887400 arrived at MIA  customs clearance pending', status: 'ARRIVED' },
];

const TYPE_BADGE: Record<string, string> = { IMPORT: 'bg-blue-100 text-blue-800', EXPORT: 'bg-orange-100 text-orange-800', CUSTOMS: 'bg-red-100 text-red-800', WAREHOUSE: 'bg-purple-100 text-purple-800', BILLING: 'bg-green-100 text-green-800' };
const STATUS_DOT: Record<string, string> = { READY: 'bg-green-500', CLEARED: 'bg-green-500', HOLD: 'bg-red-500', COMPLETE: 'bg-blue-500', DISPATCHED: 'bg-yellow-500', RECEIVED: 'bg-purple-500', INVOICED: 'bg-teal-500', ARRIVED: 'bg-indigo-500' };

export function CFSDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-lg font-semibold text-gray-900">CFS / Air Cargo Dashboard</h2><p className="text-xs text-gray-400 mt-0.5">Import pickup, export delivery, and warehouse operations</p></div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Import Order</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700">+ New Export Order</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Import Orders (Today)</p><p className="text-xl font-bold text-blue-600">72</p><p className="text-xs text-green-600 mt-1">↑ 12% vs yesterday</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Export Orders (Today)</p><p className="text-xl font-bold text-orange-600">53</p><p className="text-xs text-green-600 mt-1">↑ 8% vs yesterday</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Customs Holds</p><p className="text-xl font-bold text-red-600">8</p><p className="text-xs text-gray-400 mt-1">3 FDA, 2 USDA, 3 CBP</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Warehouse Pieces</p><p className="text-xl font-bold text-purple-600">342</p><p className="text-xs text-gray-400 mt-1">78% capacity</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Drivers Dispatched</p><p className="text-xl font-bold text-gray-900">14</p><p className="text-xs text-gray-400 mt-1">6 pickup, 8 delivery</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Revenue (MTD)</p><p className="text-xl font-bold text-green-600">$186k</p><p className="text-xs text-gray-400 mt-1">CFS + drayage</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Terminal Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Airport Terminal Status</h3>
          <div className="space-y-2">
            {TERMINALS.map(t => (
              <div key={t.code} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-800 w-10">{t.code}</span>
                  <div><p className="text-xs font-medium text-gray-700">{t.name}</p><p className="text-xs text-gray-400">{t.city}</p></div>
                </div>
                <div className="flex gap-4 text-center">
                  <div><p className="text-sm font-bold text-blue-600">{t.imports}</p><p className="text-xs text-gray-400">Import</p></div>
                  <div><p className="text-sm font-bold text-orange-600">{t.exports}</p><p className="text-xs text-gray-400">Export</p></div>
                  <div><p className={`text-sm font-bold ${t.pending > 4 ? 'text-red-600' : 'text-yellow-600'}`}>{t.pending}</p><p className="text-xs text-gray-400">Pending</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-1.5">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 px-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[a.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[a.type]}`}>{a.type}</span>
                    <span className="text-xs text-gray-400">{a.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Utilization */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Warehouse Utilization</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { zone: 'A  General Cargo', pcs: 120, cap: 160, temp: 'Ambient' },
            { zone: 'B  Temperature Controlled', pcs: 45, cap: 60, temp: '35-45°F' },
            { zone: 'C  Hazmat / DG', pcs: 12, cap: 20, temp: 'Ventilated' },
            { zone: 'D  High Value / Bonded', pcs: 28, cap: 40, temp: 'Secured' },
            { zone: 'E  Oversize / Heavy', pcs: 8, cap: 15, temp: 'Open Bay' },
          ].map(z => {
            const pct = Math.round((z.pcs / z.cap) * 100);
            return (
              <div key={z.zone} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">{z.zone}</p>
                <p className="text-xs text-gray-400 mb-2">{z.temp}</p>
                <div className="flex justify-between text-xs mb-1"><span>{z.pcs} pcs</span><span className="text-gray-400">{z.cap} cap</span></div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} /></div>
                <p className="text-xs text-gray-500 mt-1 text-right">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
