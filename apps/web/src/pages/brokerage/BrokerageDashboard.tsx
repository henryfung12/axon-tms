import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface OpsLine { label: string; count: number; indent?: boolean; color?: string; }

// ── Mock Data ──────────────────────────────────────────────────────
const AR_DATA = { readyForInvoicing: 18, notPrintedOrSent: 7, varianceList: 3, openAmount: 142850.00 };
const AP_DATA = { readyForBilling: 12, varianceList: 2, openBillCount: 9, openAmount: 98420.00 };

const SHIPMENT_ACTIVITY = [
  { date: '03/10', committed: 42, entered: 38 }, { date: '03/17', committed: 56, entered: 48 },
  { date: '03/24', committed: 61, entered: 55 }, { date: '03/31', committed: 48, entered: 52 },
  { date: '04/07', committed: 72, entered: 65 }, { date: '04/14', committed: 54, entered: 44 },
];

const LTL_OPS: OpsLine[] = [
  { label: 'Assigned Shipments', count: 14, color: 'text-blue-600' },
  { label: 'Recent Quotes', count: 8, color: 'text-blue-600' },
  { label: 'Committed', count: 6, color: 'text-blue-700' },
  { label: 'No Carrier', count: 2, indent: true },
  { label: 'Ready & Sent', count: 4, color: 'text-blue-700' },
  { label: 'No Carrier Response', count: 1, indent: true },
  { label: 'Rejected by Carrier', count: 1, color: 'text-red-600' },
  { label: 'Pickup Date Passed', count: 0, indent: true },
  { label: 'Heavy Shipment', count: 1, indent: true },
  { label: 'Oversize Shipment', count: 0, indent: true },
  { label: 'Dispatched', count: 3, color: 'text-green-700' },
  { label: 'Pickup Date Passed', count: 0, indent: true },
  { label: 'Rescheduled Pickup 2nd Attempt', count: 0, indent: true },
  { label: 'In Transit', count: 5, color: 'text-blue-600' },
];

const TL_OPS: OpsLine[] = [
  { label: 'Assigned Shipments', count: 22, color: 'text-blue-600' },
  { label: 'Recent Quotes', count: 11, color: 'text-blue-600' },
  { label: 'Planning', count: 4, color: 'text-yellow-700' },
  { label: 'Committed & Ready', count: 8, color: 'text-blue-700' },
  { label: 'Appointment Requested', count: 3, indent: true },
  { label: 'Not Posted & Not Covered', count: 2, indent: true },
  { label: 'Not Covered', count: 1, indent: true },
  { label: 'Covered', count: 2, indent: true },
  { label: 'Dispatched & Sent', count: 6, color: 'text-green-700' },
  { label: 'Pickup Today', count: 3, indent: true },
  { label: 'Pickup Date Passed', count: 1, indent: true },
  { label: 'In Transit & Out For Delivery', count: 12, color: 'text-blue-600' },
  { label: 'Delivery Appt Requested', count: 2, indent: true },
  { label: 'Delivery Today', count: 4, indent: true },
  { label: 'Delivery Date Passed', count: 1, indent: true },
  { label: 'Recently Delivered', count: 8, color: 'text-green-600' },
];

const TOTALS = { shipments: 2691, sell: 2723640.00, buy: 2372987.25, margin: 350652.75 };

function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ── Activity Chart ─────────────────────────────────────────────────
function ActivityChart() {
  const max = Math.max(...SHIPMENT_ACTIVITY.flatMap(d => [d.committed, d.entered]));
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">All Shipment Activity</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-300" /> Committed</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /> Entered</div>
        </div>
      </div>
      <div className="h-32 flex items-end gap-1 relative">
        {/* Y-axis guides */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[max, Math.round(max * 0.5), 0].map(v => (
            <div key={v} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-6 text-right">{v}</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>
          ))}
        </div>
        {/* Bars */}
        <div className="flex items-end gap-2 w-full pl-8 relative z-10">
          {SHIPMENT_ACTIVITY.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex gap-0.5 justify-center items-end" style={{ height: 100 }}>
                <div className="w-5 bg-gray-300 rounded-t" style={{ height: `${(d.committed / max) * 100}%` }} title={`Committed: ${d.committed}`} />
                <div className="w-5 bg-blue-500 rounded-t" style={{ height: `${(d.entered / max) * 100}%` }} title={`Entered: ${d.entered}`} />
              </div>
              <span className="text-xs text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">Last Updated: {new Date().toLocaleString()}</p>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────
export function BrokerageDashboard() {
  const [timeRange, setTimeRange] = useState('18');

  return (
    <div>
      {/* Top Row: AR, AP, Activity Chart */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* AR Accounting */}
        <div className="col-span-4 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">AR Accounting Dashboard</h3>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600">
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">≡ Ready For Invoicing</a>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AR_DATA.readyForInvoicing}</p>
            </div>
            <div>
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">✉ Not Printed or Sent</a>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AR_DATA.notPrintedOrSent}</p>
            </div>
            <div>
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">≡ AR Variance List</a>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AR_DATA.varianceList}</p>
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">⚠ AR Open Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(AR_DATA.openAmount)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Last Updated: {new Date().toLocaleString()}</p>
        </div>

        {/* AP Accounting */}
        <div className="col-span-4 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">AP Accounting Dashboard</h3>
            <select className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600">
              <option>18 Months</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">≡ Ready For Billing</a>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AP_DATA.readyForBilling}</p>
            </div>
            <div>
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">≡ AP Variance List</a>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AP_DATA.varianceList}</p>
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">⚠ AP Open Bill Count</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{AP_DATA.openBillCount}</p>
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">⚠ AP Open Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(AP_DATA.openAmount)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Last Updated: {new Date().toLocaleString()}</p>
        </div>

        {/* Shipment Activity Chart */}
        <div className="col-span-4 bg-white border border-gray-200 rounded-lg p-5">
          <ActivityChart />
        </div>
      </div>

      {/* Bottom Row: LTL + Truckload Operations */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* LTL Operations */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">LTL Operations Dashboard</h3>
          <div className="space-y-0">
            {LTL_OPS.map((line, i) => (
              <div key={i} className={`flex items-center justify-between py-1.5 ${!line.indent ? 'mt-1' : ''}`}>
                <span className={`text-sm ${line.indent ? 'pl-6 text-gray-600' : `font-semibold ${line.color || 'text-gray-900'}`}`}>
                  {line.label}
                </span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded ${line.count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                  {line.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Truckload Operations */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Truckload Operations Dashboard</h3>
          <div className="space-y-0">
            {TL_OPS.map((line, i) => (
              <div key={i} className={`flex items-center justify-between py-1.5 ${!line.indent ? 'mt-1' : ''}`}>
                <span className={`text-sm ${line.indent ? 'pl-6 text-gray-600' : `font-semibold ${line.color || 'text-gray-900'}`}`}>
                  {line.label}
                </span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded ${line.count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                  {line.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Totals */}
      <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex items-center gap-8 text-sm">
        <span className="text-gray-600">Total Shipments: <strong className="text-gray-900">{TOTALS.shipments.toLocaleString()}</strong></span>
        <span className="text-gray-600">Total Sell: <strong className="text-gray-900">{fmtCurrency(TOTALS.sell)}</strong></span>
        <span className="text-gray-600">Total Buy: <strong className="text-gray-900">{fmtCurrency(TOTALS.buy)}</strong></span>
        <span className="text-gray-600">Total Margin: <strong className="text-green-600">{fmtCurrency(TOTALS.margin)}</strong></span>
      </div>
    </div>
  );
}
