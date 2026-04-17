import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const WEEKLY_DATA = [
  { week: 'Feb 15', revenue: 820000 },
  { week: 'Feb 22', revenue: 910000 },
  { week: 'Mar 01', revenue: 880000 },
  { week: 'Mar 08', revenue: 950000 },
  { week: 'Mar 15', revenue: 920000 },
  { week: 'Mar 22', revenue: 980000 },
  { week: 'Mar 29', revenue: 1010000 },
  { week: 'Apr 05', revenue: 990000 },
];

const MAX_REVENUE = Math.max(...WEEKLY_DATA.map(d => d.revenue));

export function CarrierDashboard() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: async () => {
      const { data } = await api.get('/loads');
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const activeLoads = loads?.filter((l: any) => l.status === 'IN_TRANSIT')?.length || 0;
  const assignedLoads = loads?.filter((l: any) => l.status === 'ASSIGNED')?.length || 0;
  const deliveredLoads = loads?.filter((l: any) => l.status === 'DELIVERED')?.length || 0;
  const totalRevenue = loads?.reduce((sum: number, l: any) => sum + (l.totalRate || 0), 0) || 0;
  const availableDrivers = drivers?.filter((d: any) => d.status === 'AVAILABLE')?.length || 0;
  const drivingDrivers = drivers?.filter((d: any) => d.status === 'DRIVING')?.length || 0;

  const requiresAttention = [
    { label: 'Missing invoicing email', count: 3, color: 'text-red-600' },
    { label: 'Pickup date passed', count: 1, color: 'text-red-600' },
    { label: 'No driver assigned', count: assignedLoads, color: 'text-yellow-600' },
    { label: 'Pending documents', count: 2, color: 'text-yellow-600' },
  ];

  const topCustomers = [
    { name: 'Acme Corp - LAX', amount: 1533265 },
    { name: 'Acme Corp - ORD', amount: 1090560 },
    { name: 'Acme Corp - EWR', amount: 957335 },
    { name: 'Acme Corp - DFW', amount: 317005 },
    { name: 'Acme Corp - ATL', amount: 181703 },
  ];

  return (
    <div>
      {/* Top 4 summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Ship Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ship Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">In Transit</span>
              <span className="text-sm font-semibold text-blue-600">{activeLoads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Assigned</span>
              <span className="text-sm font-semibold text-purple-600">{assignedLoads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Delivered (today)</span>
              <span className="text-sm font-semibold text-green-600">{deliveredLoads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Drivers on duty</span>
              <span className="text-sm font-semibold text-gray-800">{drivingDrivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Available drivers</span>
              <span className="text-sm font-semibold text-green-600">{availableDrivers}</span>
            </div>
          </div>
        </div>

        {/* Requires Attention */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Requires Attention</h3>
          <div className="space-y-2">
            {requiresAttention.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs text-gray-500 truncate pr-2">{item.label}</span>
                <span className={`text-sm font-semibold flex-shrink-0 ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Bill Summary</h3>
          <div className="space-y-2">
            {[
              { label: 'Incomplete', count: 0 },
              { label: 'Released', count: deliveredLoads },
              { label: 'Receivables', count: assignedLoads + activeLoads },
              { label: 'Payables to Carrier', count: Math.floor(totalRevenue / 1000) },
              { label: 'On hold payables', count: 0 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Safety Summary</h3>
          <div className="mt-1">
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 mb-2">
              <span>Asset</span>
              <span className="text-center">Expired</span>
              <span className="text-center">Expiring Soon</span>
            </div>
            {[
              { asset: 'Driver', expired: 0, expiring: 1 },
              { asset: 'Truck', expired: 0, expiring: 0 },
              { asset: 'Trailer', expired: 0, expiring: 0 },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-1 py-1 border-t border-gray-100">
                <span className="text-xs text-gray-600">{row.asset}</span>
                <span className={`text-sm font-semibold text-center ${row.expired > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {row.expired}
                </span>
                <span className={`text-sm font-semibold text-center ${row.expiring > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {row.expiring}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Weekly chart + Top Customers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Loads Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-700">Weekly Loads</h3>
            <span className="text-xs text-gray-400">Period (8 weeks)</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Weekly revenue based on delivery date</p>

          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-32">
            {WEEKLY_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-200 rounded-t hover:bg-blue-400 transition-colors cursor-pointer"
                  style={{ height: `${(d.revenue / MAX_REVENUE) * 100}%` }}
                  title={`$${(d.revenue / 1000000).toFixed(2)}M`}
                />
                <span className="text-xs text-gray-400 rotate-45 origin-left whitespace-nowrap" style={{ fontSize: '9px' }}>
                  {d.week}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Revenue (8 wks)</p>
              <p className="text-base font-bold text-gray-900">
                ${(WEEKLY_DATA.reduce((s, d) => s + d.revenue, 0) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Avg per week</p>
              <p className="text-base font-bold text-blue-600">
                ${((WEEKLY_DATA.reduce((s, d) => s + d.revenue, 0) / 8) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Top Customers</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">by date</span>
              <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Date</button>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-3">
            <p>Period: Mar 13, 2026 – Apr 12, 2026</p>
            <p className="text-gray-300">Calculations based on load scheduled delivery date.</p>
          </div>

          <div className="border-t border-gray-100">
            <div className="grid grid-cols-2 py-2 text-xs font-medium text-gray-500">
              <span>Customer</span>
              <span className="text-right">Amount</span>
            </div>
            {topCustomers.map((c, i) => (
              <div key={i} className="grid grid-cols-2 py-2 border-t border-gray-50">
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">{c.name}</span>
                <span className="text-xs text-right font-medium text-gray-800">
                  ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
