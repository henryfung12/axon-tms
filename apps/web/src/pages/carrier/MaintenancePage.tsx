import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface WorkOrder {
  id: string;
  woNumber: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'CANCELLED';
  priority: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'REPAIR' | 'PREVENTIVE' | 'INSPECTION' | 'TIRE' | 'DOT_INSPECTION';
  unitNumber: string;
  unitType: 'TRUCK' | 'TRAILER';
  description: string;
  vendor: string;
  vendorCity: string;
  vendorState: string;
  assignedTech: string;
  reportedBy: string;
  reportedDate: string;
  scheduledDate: string;
  completedDate: string | null;
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  parts: { name: string; partNumber: string; qty: number; cost: number }[];
  notes: string;
  odometerAtService: number;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1', woNumber: 'WO-2026-0412', status: 'IN_PROGRESS', priority: 'EMERGENCY', type: 'REPAIR',
    unitNumber: 'T-1075', unitType: 'TRUCK', description: 'Transmission rebuild  grinding in 4th & 5th gear, hard shifting under load',
    vendor: 'Rush Truck Centers', vendorCity: 'San Antonio', vendorState: 'TX', assignedTech: 'Carlos Vega',
    reportedBy: 'Marcus Johnson', reportedDate: '2026-04-08', scheduledDate: '2026-04-10', completedDate: null,
    estimatedCost: 8500, actualCost: 6200, laborHours: 14,
    parts: [
      { name: 'Transmission Assembly (Reman)', partNumber: 'EA-23411R', qty: 1, cost: 3800 },
      { name: 'Clutch Kit', partNumber: 'CK-1055', qty: 1, cost: 890 },
      { name: 'Trans Fluid (gal)', partNumber: 'FL-ATF6', qty: 4, cost: 120 },
    ],
    notes: 'Trans pulled 4/10. Reman unit on order from Eaton  ETA 4/14. Driver reassigned to T-1088.',
    odometerAtService: 385200,
  },
  {
    id: 'wo2', woNumber: 'WO-2026-0415', status: 'OPEN', priority: 'HIGH', type: 'REPAIR',
    unitNumber: 'T-1082', unitType: 'TRUCK', description: 'Frame rail damage assessment  right side cracked behind cab mount from road debris impact',
    vendor: 'Rush Truck Centers', vendorCity: 'San Antonio', vendorState: 'TX', assignedTech: '',
    reportedBy: 'James Williams', reportedDate: '2026-04-06', scheduledDate: '2026-04-15', completedDate: null,
    estimatedCost: 15000, actualCost: 0, laborHours: 0,
    parts: [],
    notes: 'Insurance adjuster scheduled 4/15. May be total loss  frame damage extensive. Unit OOS pending assessment.',
    odometerAtService: 421800,
  },
  {
    id: 'wo3', woNumber: 'WO-2026-0408', status: 'WAITING_PARTS', priority: 'MEDIUM', type: 'REPAIR',
    unitNumber: 'TR-2240', unitType: 'TRAILER', description: 'Brake drum replacement  left axle drums worn past minimum, scored surface',
    vendor: 'TA Petro - Nashville', vendorCity: 'Nashville', vendorState: 'TN', assignedTech: 'Steve Ellis',
    reportedBy: 'Robert Brown', reportedDate: '2026-04-05', scheduledDate: '2026-04-11', completedDate: null,
    estimatedCost: 1800, actualCost: 950, laborHours: 3,
    parts: [
      { name: 'Brake Drum (L)', partNumber: 'BD-3222L', qty: 2, cost: 320 },
      { name: 'Brake Shoes Set', partNumber: 'BS-1054', qty: 1, cost: 185 },
    ],
    notes: 'Left axle drums on backorder from Webb Wheel. ETA 4/16. Right axle serviceable for now.',
    odometerAtService: 198000,
  },
  {
    id: 'wo4', woNumber: 'WO-2026-0401', status: 'COMPLETED', priority: 'MEDIUM', type: 'PREVENTIVE',
    unitNumber: 'T-1038', unitType: 'TRUCK', description: 'PM-A Service  oil change, filters, belt & hose inspection, brake check, fluid top-off',
    vendor: 'Rush Truck Centers', vendorCity: 'San Antonio', vendorState: 'TX', assignedTech: 'Mike Rodriguez',
    reportedBy: 'System (PM Schedule)', reportedDate: '2026-03-28', scheduledDate: '2026-04-01', completedDate: '2026-04-01',
    estimatedCost: 650, actualCost: 720, laborHours: 2.5,
    parts: [
      { name: 'Engine Oil Filter', partNumber: 'OF-3344', qty: 1, cost: 42 },
      { name: 'Fuel Filter Set', partNumber: 'FF-2201', qty: 1, cost: 68 },
      { name: 'Engine Oil 15W-40 (gal)', partNumber: 'OIL-1540', qty: 10, cost: 140 },
      { name: 'Air Filter', partNumber: 'AF-8810', qty: 1, cost: 85 },
    ],
    notes: 'All belts good. Minor brake adjustment rear axle. Coolant topped off. Next PM at 80K.',
    odometerAtService: 67200,
  },
  {
    id: 'wo5', woNumber: 'WO-2026-0330', status: 'COMPLETED', priority: 'LOW', type: 'TIRE',
    unitNumber: 'T-1070', unitType: 'TRUCK', description: 'Steer tire replacement  right steer worn to 4/32, left at 5/32, replaced both',
    vendor: 'TA Petro - Nashville', vendorCity: 'Nashville', vendorState: 'TN', assignedTech: 'Steve Ellis',
    reportedBy: 'Robert Brown', reportedDate: '2026-03-28', scheduledDate: '2026-03-30', completedDate: '2026-03-30',
    estimatedCost: 1100, actualCost: 1050, laborHours: 1.5,
    parts: [
      { name: 'Michelin XZA3 315/80R22.5', partNumber: 'TIRE-XZA3', qty: 2, cost: 480 },
    ],
    notes: 'Alignment checked  within spec. No irregular wear pattern.',
    odometerAtService: 189700,
  },
  {
    id: 'wo6', woNumber: 'WO-2026-0325', status: 'COMPLETED', priority: 'MEDIUM', type: 'DOT_INSPECTION',
    unitNumber: 'T-1042', unitType: 'TRUCK', description: 'Annual DOT inspection  full FMCSA compliance check',
    vendor: 'Rush Truck Centers', vendorCity: 'San Antonio', vendorState: 'TX', assignedTech: 'Carlos Vega',
    reportedBy: 'System (PM Schedule)', reportedDate: '2026-03-20', scheduledDate: '2026-03-25', completedDate: '2026-03-25',
    estimatedCost: 350, actualCost: 380, laborHours: 3,
    parts: [
      { name: 'Marker Light (Amber)', partNumber: 'ML-A100', qty: 2, cost: 15 },
    ],
    notes: 'Passed. Two amber marker lights replaced. Brake stroke measurements within spec. Decal applied.',
    odometerAtService: 224100,
  },
  {
    id: 'wo7', woNumber: 'WO-2026-0318', status: 'COMPLETED', priority: 'MEDIUM', type: 'PREVENTIVE',
    unitNumber: 'TR-2201', unitType: 'TRAILER', description: 'Reefer unit service  compressor oil, condenser clean, refrigerant check, belt tension',
    vendor: 'Carrier Transicold', vendorCity: 'Memphis', vendorState: 'TN', assignedTech: 'Will Henderson',
    reportedBy: 'System (PM Schedule)', reportedDate: '2026-03-10', scheduledDate: '2026-03-18', completedDate: '2026-03-18',
    estimatedCost: 900, actualCost: 870, laborHours: 4,
    parts: [
      { name: 'Compressor Oil (qt)', partNumber: 'CO-POE32', qty: 2, cost: 45 },
      { name: 'V-Belt', partNumber: 'VB-7790', qty: 1, cost: 62 },
    ],
    notes: 'Condenser cleaned and straightened. Refrigerant charge normal  no leaks. Belt replaced proactively.',
    odometerAtService: 115000,
  },
  {
    id: 'wo8', woNumber: 'WO-2026-0420', status: 'OPEN', priority: 'LOW', type: 'PREVENTIVE',
    unitNumber: 'T-1044', unitType: 'TRUCK', description: 'PM-B Service  PM-A items plus DPF regeneration, DEF system check, coolant test',
    vendor: 'Rush Truck Centers', vendorCity: 'San Antonio', vendorState: 'TX', assignedTech: '',
    reportedBy: 'System (PM Schedule)', reportedDate: '2026-04-12', scheduledDate: '2026-04-20', completedDate: null,
    estimatedCost: 950, actualCost: 0, laborHours: 0,
    parts: [],
    notes: 'DPF regen issue reported by driver  include in scope. Schedule when unit returns from Phoenix run.',
    odometerAtService: 156900,
  },
  {
    id: 'wo9', woNumber: 'WO-2026-0418', status: 'OPEN', priority: 'MEDIUM', type: 'INSPECTION',
    unitNumber: 'TR-2222', unitType: 'TRAILER', description: 'Annual DOT inspection  overdue by 3 days, schedule immediately',
    vendor: 'TA Petro - Nashville', vendorCity: 'Nashville', vendorState: 'TN', assignedTech: '',
    reportedBy: 'System (Compliance Alert)', reportedDate: '2026-04-12', scheduledDate: '2026-04-18', completedDate: null,
    estimatedCost: 300, actualCost: 0, laborHours: 0,
    parts: [],
    notes: 'URGENT  inspection expired 4/10. Do not dispatch until completed.',
    odometerAtService: 82000,
  },
];

// ── Helpers ────────────────────────────────────────────────────────
const STATUS_BADGES: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  WAITING_PARTS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_PARTS: 'Waiting Parts',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const PRIORITY_BADGES: Record<string, string> = {
  EMERGENCY: 'bg-red-600 text-white',
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABELS: Record<string, string> = {
  EMERGENCY: 'Emergency',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const TYPE_LABELS: Record<string, string> = {
  REPAIR: 'Repair',
  PREVENTIVE: 'Preventive',
  INSPECTION: 'Inspection',
  TIRE: 'Tire',
  DOT_INSPECTION: 'DOT Inspection',
};

const TYPE_ICONS: Record<string, string> = {
  REPAIR: '🔧',
  PREVENTIVE: '🛡',
  INSPECTION: '📋',
  TIRE: '⭕',
  DOT_INSPECTION: '🏛',
};

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

function daysAgo(dateStr: string): number {
  return Math.ceil((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

// ── Component ──────────────────────────────────────────────────────
export function MaintenancePage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortField, setSortField] = useState<'woNumber' | 'scheduledDate' | 'estimatedCost' | 'priority'>('scheduledDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter & sort
  const filteredOrders = useMemo(() => {
    let result = MOCK_WORK_ORDERS.filter(wo => {
      if (statusFilter !== 'All' && wo.status !== statusFilter) return false;
      if (typeFilter !== 'All' && wo.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          wo.woNumber.toLowerCase().includes(q) ||
          wo.unitNumber.toLowerCase().includes(q) ||
          wo.description.toLowerCase().includes(q) ||
          wo.vendor.toLowerCase().includes(q) ||
          wo.assignedTech.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      const priorityOrder = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      switch (sortField) {
        case 'woNumber': cmp = a.woNumber.localeCompare(b.woNumber); break;
        case 'scheduledDate': cmp = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(); break;
        case 'estimatedCost': cmp = a.estimatedCost - b.estimatedCost; break;
        case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [statusFilter, typeFilter, searchQuery, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const sortIcon = (field: typeof sortField) => sortField !== field ? '↕' : sortDir === 'asc' ? '↑' : '↓';

  // Stats
  const stats = useMemo(() => {
    const open = MOCK_WORK_ORDERS.filter(wo => wo.status === 'OPEN' || wo.status === 'IN_PROGRESS' || wo.status === 'WAITING_PARTS');
    const completed = MOCK_WORK_ORDERS.filter(wo => wo.status === 'COMPLETED');
    const totalEstimated = open.reduce((s, wo) => s + wo.estimatedCost, 0);
    const totalActual = MOCK_WORK_ORDERS.reduce((s, wo) => s + wo.actualCost, 0);
    const totalLabor = MOCK_WORK_ORDERS.reduce((s, wo) => s + wo.laborHours, 0);
    const emergency = open.filter(wo => wo.priority === 'EMERGENCY' || wo.priority === 'HIGH').length;
    const waitingParts = MOCK_WORK_ORDERS.filter(wo => wo.status === 'WAITING_PARTS').length;
    const overdueInspections = MOCK_WORK_ORDERS.filter(wo => (wo.type === 'DOT_INSPECTION' || wo.type === 'INSPECTION') && wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED').length;

    return { openCount: open.length, completedCount: completed.length, totalEstimated, totalActual, totalLabor, emergency, waitingParts, overdueInspections };
  }, []);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search WO#, unit, vendor, tech..."
              className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Work Order
          </button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Open Work Orders</p>
          <p className={`text-xl font-bold ${stats.openCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.openCount}</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            {stats.emergency > 0 && <span className="text-red-600 font-medium">{stats.emergency} urgent</span>}
            {stats.waitingParts > 0 && <><span className="text-gray-300">·</span><span className="text-orange-500">{stats.waitingParts} waiting parts</span></>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Completed (30d)</p>
          <p className="text-xl font-bold text-green-700">{stats.completedCount}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.totalLabor}h total labor</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Open Estimated Cost</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEstimated)}</p>
          <p className="text-xs text-gray-400 mt-1.5">across open WOs</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Spend (30d)</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalActual)}</p>
          <p className="text-xs text-gray-400 mt-1.5">actual costs</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Pending Inspections</p>
          <p className={`text-xl font-bold ${stats.overdueInspections > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.overdueInspections}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.overdueInspections > 0 ? <span className="text-red-500">Action required</span> : 'All current'}</p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex gap-1">
          {['All', 'OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[s] || 'All'}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex gap-1">
          {['All', 'REPAIR', 'PREVENTIVE', 'TIRE', 'DOT_INSPECTION'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                typeFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TYPE_LABELS[t] || 'All Types'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('woNumber')}>
                  WO # {sortIcon('woNumber')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('priority')}>
                  Priority {sortIcon('priority')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Type</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Description</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Vendor</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('scheduledDate')}>
                  Scheduled {sortIcon('scheduledDate')}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('estimatedCost')}>
                  Est. Cost {sortIcon('estimatedCost')}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Actual</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-gray-400">No work orders found matching your filters.</td>
                </tr>
              )}
              {filteredOrders.map(wo => {
                const rowHighlight = wo.priority === 'EMERGENCY'
                  ? 'bg-red-50 border-l-4 border-l-red-500'
                  : wo.priority === 'HIGH'
                  ? 'bg-red-50 border-l-4 border-l-red-300'
                  : wo.status === 'WAITING_PARTS'
                  ? 'bg-orange-50 border-l-4 border-l-orange-300'
                  : wo.status === 'COMPLETED'
                  ? ''
                  : '';

                return (
                  <tr
                    key={wo.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                    onClick={() => setSelectedWO(wo)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-blue-600 font-semibold hover:underline">{wo.woNumber}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGES[wo.priority]}`}>
                        {PRIORITY_LABELS[wo.priority]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[wo.status]}`}>
                        {STATUS_LABELS[wo.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                      <span className="mr-1">{TYPE_ICONS[wo.type]}</span>{TYPE_LABELS[wo.type]}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-gray-900">{wo.unitNumber}</span>
                      <span className="text-gray-400 ml-1 text-xs">({wo.unitType === 'TRUCK' ? 'Truck' : 'Trailer'})</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-xs truncate">{wo.description}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{wo.vendor}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(wo.scheduledDate)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{formatCurrency(wo.estimatedCost)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                      {wo.actualCost > 0 ? formatCurrency(wo.actualCost) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Showing:</strong> {filteredOrders.length} of {MOCK_WORK_ORDERS.length}</span>
          <span><strong className="text-gray-800">Est. Total:</strong> {formatCurrency(filteredOrders.reduce((s, wo) => s + wo.estimatedCost, 0))}</span>
          <span><strong className="text-gray-800">Actual Total:</strong> {formatCurrency(filteredOrders.reduce((s, wo) => s + wo.actualCost, 0))}</span>
          <span><strong className="text-gray-800">Labor:</strong> {filteredOrders.reduce((s, wo) => s + wo.laborHours, 0)}h</span>
        </div>
      </div>

      {/* ── Work Order Detail Flyout ────────────────────────── */}
      {selectedWO && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedWO(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[460px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{selectedWO.woNumber}</h3>
                <button onClick={() => setSelectedWO(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGES[selectedWO.priority]}`}>
                  {PRIORITY_LABELS[selectedWO.priority]}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[selectedWO.status]}`}>
                  {STATUS_LABELS[selectedWO.status]}
                </span>
                <span className="text-xs text-gray-500">{TYPE_ICONS[selectedWO.type]} {TYPE_LABELS[selectedWO.type]}</span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Unit & Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-800">{selectedWO.unitNumber}</span>
                  <span className="text-xs text-gray-400">{selectedWO.unitType === 'TRUCK' ? 'Truck' : 'Trailer'}</span>
                  <span className="text-xs text-gray-400">· {selectedWO.odometerAtService.toLocaleString()} mi</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{selectedWO.description}</p>
              </div>

              {/* Details Grid */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block">Vendor</span>
                    <span className="text-xs text-gray-800">{selectedWO.vendor}</span>
                    <span className="text-xs text-gray-400 block">{selectedWO.vendorCity}, {selectedWO.vendorState}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Assigned Tech</span>
                    <span className="text-xs text-gray-800">{selectedWO.assignedTech || <span className="text-gray-400 italic">Unassigned</span>}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Reported By</span>
                    <span className="text-xs text-gray-800">{selectedWO.reportedBy}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Reported Date</span>
                    <span className="text-xs text-gray-800">{formatDate(selectedWO.reportedDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Scheduled</span>
                    <span className="text-xs text-gray-800">{formatDate(selectedWO.scheduledDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Completed</span>
                    <span className="text-xs text-gray-800">{formatDate(selectedWO.completedDate)}</span>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Cost Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Estimated Cost</span>
                    <span className="text-xs font-medium text-gray-800">{formatCurrency(selectedWO.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Actual Cost</span>
                    <span className={`text-xs font-semibold ${selectedWO.actualCost > selectedWO.estimatedCost ? 'text-red-600' : 'text-green-700'}`}>
                      {selectedWO.actualCost > 0 ? formatCurrency(selectedWO.actualCost) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Labor Hours</span>
                    <span className="text-xs font-medium text-gray-800">{selectedWO.laborHours > 0 ? `${selectedWO.laborHours}h` : ''}</span>
                  </div>
                  {selectedWO.actualCost > 0 && selectedWO.estimatedCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Variance</span>
                      <span className={`text-xs font-medium ${selectedWO.actualCost > selectedWO.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedWO.actualCost > selectedWO.estimatedCost ? '+' : ''}{formatCurrency(selectedWO.actualCost - selectedWO.estimatedCost)}
                        <span className="text-gray-400 ml-1">({Math.round(((selectedWO.actualCost - selectedWO.estimatedCost) / selectedWO.estimatedCost) * 100)}%)</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parts */}
              {selectedWO.parts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Parts ({selectedWO.parts.length})</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-1.5 font-medium text-gray-500">Part</th>
                          <th className="text-left px-3 py-1.5 font-medium text-gray-500">P/N</th>
                          <th className="text-center px-3 py-1.5 font-medium text-gray-500">Qty</th>
                          <th className="text-right px-3 py-1.5 font-medium text-gray-500">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWO.parts.map((part, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-1.5 text-gray-800">{part.name}</td>
                            <td className="px-3 py-1.5 text-gray-500 font-mono">{part.partNumber}</td>
                            <td className="px-3 py-1.5 text-center text-gray-700">{part.qty}</td>
                            <td className="px-3 py-1.5 text-right text-gray-800">{formatCurrency(part.cost)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td colSpan={3} className="px-3 py-1.5 text-right font-medium text-gray-600">Parts Total</td>
                          <td className="px-3 py-1.5 text-right font-semibold text-gray-900">{formatCurrency(selectedWO.parts.reduce((s, p) => s + p.cost * p.qty, 0))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedWO.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                  <p className={`text-xs rounded-lg p-3 leading-relaxed ${selectedWO.priority === 'EMERGENCY' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-600'}`}>
                    {selectedWO.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedWO.status !== 'COMPLETED' && selectedWO.status !== 'CANCELLED' && (
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                  Update Status
                </button>
              )}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                Print WO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Work Order Modal ─────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">New Work Order</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select unit</option>
                    <optgroup label="Trucks">
                      {['T-1029','T-1033','T-1038','T-1042','T-1044','T-1055','T-1061','T-1070','T-1075','T-1082','T-1088'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Trailers">
                      {['TR-2190','TR-2199','TR-2201','TR-2204','TR-2208','TR-2215','TR-2222','TR-2231','TR-2240','TR-2245'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select type</option>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                <textarea rows={3} placeholder="Describe the issue or service needed..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vendor / Shop</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select vendor</option>
                    <option>Rush Truck Centers  San Antonio, TX</option>
                    <option>TA Petro - Nashville  Nashville, TN</option>
                    <option>Carrier Transicold  Memphis, TN</option>
                    <option>Other (specify in notes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Odometer</label>
                  <input type="number" placeholder="Current miles" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reported By</label>
                  <input type="text" placeholder="Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} placeholder="Additional details..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Create Work Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
