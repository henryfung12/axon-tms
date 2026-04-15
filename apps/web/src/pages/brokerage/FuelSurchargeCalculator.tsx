import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface DOEWeekly { weekEnding: string; price: number; change: number; }
interface FSCScheduleRow { minPrice: number; maxPrice: number; surchargePerMile: number; surchargePercent: number; }

// ── Mock DOE Data ──────────────────────────────────────────────────
const DOE_HISTORY: DOEWeekly[] = [
  { weekEnding: '2026-04-14', price: 3.824, change: -0.012 },
  { weekEnding: '2026-04-07', price: 3.836, change: 0.018 },
  { weekEnding: '2026-03-31', price: 3.818, change: -0.024 },
  { weekEnding: '2026-03-24', price: 3.842, change: 0.031 },
  { weekEnding: '2026-03-17', price: 3.811, change: 0.009 },
  { weekEnding: '2026-03-10', price: 3.802, change: -0.015 },
  { weekEnding: '2026-03-03', price: 3.817, change: 0.022 },
  { weekEnding: '2026-02-24', price: 3.795, change: -0.008 },
  { weekEnding: '2026-02-17', price: 3.803, change: 0.014 },
  { weekEnding: '2026-02-10', price: 3.789, change: -0.021 },
  { weekEnding: '2026-02-03', price: 3.810, change: 0.016 },
  { weekEnding: '2026-01-27', price: 3.794, change: -0.005 },
];

const currentDOE = DOE_HISTORY[0];

// Standard FSC schedule (based on $1.20 base diesel)
const FSC_SCHEDULE: FSCScheduleRow[] = [
  { minPrice: 1.20, maxPrice: 1.25, surchargePerMile: 0.01, surchargePercent: 0 },
  { minPrice: 1.26, maxPrice: 1.50, surchargePerMile: 0.02, surchargePercent: 1 },
  { minPrice: 1.51, maxPrice: 2.00, surchargePerMile: 0.04, surchargePercent: 3 },
  { minPrice: 2.01, maxPrice: 2.50, surchargePerMile: 0.08, surchargePercent: 5 },
  { minPrice: 2.51, maxPrice: 3.00, surchargePerMile: 0.14, surchargePercent: 8 },
  { minPrice: 3.01, maxPrice: 3.25, surchargePerMile: 0.18, surchargePercent: 9 },
  { minPrice: 3.26, maxPrice: 3.50, surchargePerMile: 0.22, surchargePercent: 10 },
  { minPrice: 3.51, maxPrice: 3.75, surchargePerMile: 0.26, surchargePercent: 11 },
  { minPrice: 3.76, maxPrice: 4.00, surchargePerMile: 0.30, surchargePercent: 12 },
  { minPrice: 4.01, maxPrice: 4.25, surchargePerMile: 0.34, surchargePercent: 14 },
  { minPrice: 4.26, maxPrice: 4.50, surchargePerMile: 0.38, surchargePercent: 15 },
  { minPrice: 4.51, maxPrice: 4.75, surchargePerMile: 0.42, surchargePercent: 16 },
  { minPrice: 4.76, maxPrice: 5.00, surchargePerMile: 0.46, surchargePercent: 18 },
  { minPrice: 5.01, maxPrice: 99.99, surchargePerMile: 0.50, surchargePercent: 20 },
];

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

// ── Component ──────────────────────────────────────────────────────
export function FuelSurchargeCalculator() {
  const [calcMethod, setCalcMethod] = useState<'per_mile' | 'percent'>('per_mile');
  const [calcMiles, setCalcMiles] = useState(500);
  const [calcBaseRate, setCalcBaseRate] = useState(2800);
  const [calcDieselOverride, setCalcDieselOverride] = useState('');
  const [baseDiesel, setBaseDiesel] = useState(1.20);

  const effectiveDiesel = calcDieselOverride ? parseFloat(calcDieselOverride) : currentDOE.price;

  const currentRow = useMemo(() => {
    return FSC_SCHEDULE.find(r => effectiveDiesel >= r.minPrice && effectiveDiesel <= r.maxPrice) || FSC_SCHEDULE[FSC_SCHEDULE.length - 1];
  }, [effectiveDiesel]);

  const fscPerMile = currentRow.surchargePerMile;
  const fscPercent = currentRow.surchargePercent;
  const fscAmountPerMile = fscPerMile * calcMiles;
  const fscAmountPercent = (fscPercent / 100) * calcBaseRate;
  const fscAmount = calcMethod === 'per_mile' ? fscAmountPerMile : fscAmountPercent;
  const totalRate = calcBaseRate + fscAmount;

  // Chart data
  const chartData = [...DOE_HISTORY].reverse();
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const range = maxPrice - minPrice || 0.1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fuel Surcharge Calculator</h2>
          <p className="text-xs text-gray-400 mt-0.5">Based on U.S. DOE National Average Diesel Price</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-800">DOE Index: Live</span>
          </div>
          <span className="text-xs text-gray-400">Last updated: {fmtDate(currentDOE.weekEnding)}</span>
        </div>
      </div>

      {/* Current DOE Price + Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Current DOE Diesel</p>
          <p className="text-3xl font-bold text-gray-900">${currentDOE.price.toFixed(3)}</p>
          <p className={`text-sm mt-1 font-medium ${currentDOE.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {currentDOE.change >= 0 ? '▲' : '▼'} ${Math.abs(currentDOE.change).toFixed(3)} from last week
          </p>
          <p className="text-xs text-gray-400 mt-1">Week ending {fmtDate(currentDOE.weekEnding)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Current FSC / Mile</p>
          <p className="text-3xl font-bold text-blue-600">${fscPerMile.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Based on DOE ${effectiveDiesel.toFixed(3)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Current FSC %</p>
          <p className="text-3xl font-bold text-blue-600">{fscPercent}%</p>
          <p className="text-xs text-gray-400 mt-1">Of line haul rate</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Base Diesel Price</p>
          <p className="text-3xl font-bold text-gray-900">${baseDiesel.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Threshold for FSC to apply</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Calculator */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Rate Calculator</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calculation Method</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button onClick={() => setCalcMethod('per_mile')} className={`flex-1 py-2 text-xs font-semibold ${calcMethod === 'per_mile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Per Mile</button>
                <button onClick={() => setCalcMethod('percent')} className={`flex-1 py-2 text-xs font-semibold ${calcMethod === 'percent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Percentage</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Line Haul Rate ($)</label>
              <input type="number" value={calcBaseRate} onChange={e => setCalcBaseRate(parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            {calcMethod === 'per_mile' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Miles</label>
                <input type="number" value={calcMiles} onChange={e => setCalcMiles(parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Diesel Override (optional)</label>
              <input type="text" value={calcDieselOverride} onChange={e => setCalcDieselOverride(e.target.value)} placeholder={`Current: $${currentDOE.price.toFixed(3)}`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <hr />
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Line Haul</span><span className="font-medium">${calcBaseRate.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Fuel Surcharge</span><span className="font-bold text-blue-600">+ ${fscAmount.toFixed(2)}</span></div>
              {calcMethod === 'per_mile' && <p className="text-xs text-gray-400">${fscPerMile.toFixed(2)}/mi × {calcMiles} mi</p>}
              {calcMethod === 'percent' && <p className="text-xs text-gray-400">{fscPercent}% × ${calcBaseRate.toLocaleString()}</p>}
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg"><span className="font-semibold text-gray-900">Total Rate</span><span className="font-bold text-gray-900">${totalRate.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* DOE Price Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">DOE National Average — 12 Week Trend</h3>
          <div className="relative h-40 mb-2">
            {/* Y axis */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400 text-right pr-2">
              <span>${maxPrice.toFixed(2)}</span>
              <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
              <span>${minPrice.toFixed(2)}</span>
            </div>
            {/* Chart area */}
            <div className="ml-12 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map(i => <div key={i} className="border-t border-gray-100 w-full" />)}
              </div>
              {/* Line chart via SVG */}
              <svg viewBox={`0 0 ${chartData.length * 40} 140`} className="w-full h-full" preserveAspectRatio="none">
                {/* Area fill */}
                <path d={`M ${chartData.map((d, i) => `${i * 40 + 20},${140 - ((d.price - minPrice) / range) * 120}`).join(' L ')} L ${(chartData.length - 1) * 40 + 20},140 L 20,140 Z`} fill="rgba(37, 99, 235, 0.1)" />
                {/* Line */}
                <polyline points={chartData.map((d, i) => `${i * 40 + 20},${140 - ((d.price - minPrice) / range) * 120}`).join(' ')} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                {/* Points */}
                {chartData.map((d, i) => (
                  <circle key={i} cx={i * 40 + 20} cy={140 - ((d.price - minPrice) / range) * 120} r="3.5" fill="white" stroke="#2563eb" strokeWidth="2" />
                ))}
              </svg>
            </div>
          </div>
          {/* X axis labels */}
          <div className="ml-12 flex justify-between text-xs text-gray-400">
            {chartData.filter((_, i) => i % 3 === 0 || i === chartData.length - 1).map(d => (
              <span key={d.weekEnding}>{new Date(d.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Source: U.S. Energy Information Administration (EIA)</p>
        </div>

        {/* Recent DOE Prices */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Weekly DOE Diesel Prices</h3>
          <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white"><tr className="border-b border-gray-200">
                <th className="text-left py-1.5 font-medium text-gray-500">Week Ending</th>
                <th className="text-right py-1.5 font-medium text-gray-500">Price</th>
                <th className="text-right py-1.5 font-medium text-gray-500">Change</th>
                <th className="text-right py-1.5 font-medium text-gray-500">FSC/mi</th>
              </tr></thead>
              <tbody>
                {DOE_HISTORY.map((d, i) => {
                  const row = FSC_SCHEDULE.find(r => d.price >= r.minPrice && d.price <= r.maxPrice);
                  return (
                    <tr key={d.weekEnding} className={`border-b border-gray-50 ${i === 0 ? 'bg-blue-50 font-medium' : ''}`}>
                      <td className="py-1.5 text-gray-700">{fmtDate(d.weekEnding)}{i === 0 && <span className="ml-1 text-blue-600 text-xs">← current</span>}</td>
                      <td className="py-1.5 text-right font-mono text-gray-900">${d.price.toFixed(3)}</td>
                      <td className={`py-1.5 text-right font-mono ${d.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>{d.change >= 0 ? '+' : ''}{d.change.toFixed(3)}</td>
                      <td className="py-1.5 text-right font-mono text-blue-600">${row?.surchargePerMile.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FSC Schedule Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Fuel Surcharge Schedule</h3>
            <p className="text-xs text-gray-400 mt-0.5">Base diesel: ${baseDiesel.toFixed(2)}/gal — surcharge applies when DOE exceeds base</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Base Diesel:</label>
              <input type="number" value={baseDiesel} onChange={e => setBaseDiesel(parseFloat(e.target.value) || 1.20)} step="0.05" className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-center font-mono" />
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit Schedule</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 font-medium text-gray-500">DOE Range ($/gal)</th>
            <th className="text-right px-4 py-2.5 font-medium text-gray-500">Surcharge / Mile</th>
            <th className="text-right px-4 py-2.5 font-medium text-gray-500">Surcharge %</th>
            <th className="text-right px-4 py-2.5 font-medium text-gray-500">Example (500 mi)</th>
            <th className="text-right px-4 py-2.5 font-medium text-gray-500">Example ($2,800 rate)</th>
          </tr></thead>
          <tbody>
            {FSC_SCHEDULE.map((r, i) => {
              const isActive = effectiveDiesel >= r.minPrice && effectiveDiesel <= r.maxPrice;
              return (
                <tr key={i} className={`border-b border-gray-100 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500 font-semibold' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 text-gray-700">${r.minPrice.toFixed(2)} — ${r.maxPrice >= 99 ? '& above' : '$' + r.maxPrice.toFixed(2)}{isActive && <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded font-bold">CURRENT</span>}</td>
                  <td className="px-4 py-2 text-right text-gray-900">${r.surchargePerMile.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{r.surchargePercent}%</td>
                  <td className="px-4 py-2 text-right text-blue-600">${(r.surchargePerMile * 500).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-blue-600">${((r.surchargePercent / 100) * 2800).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
