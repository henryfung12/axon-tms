import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────
interface DispatchLoad {
  id: string;
  loadNumber: string;
  status: string;
  driverId: string | null;
  totalRate: number;
  mileage: number;
  equipment: string;
  commodity: string;
  weight: number;
  customer?: { name: string };
  driver?: { id: string; user?: { firstName: string; lastName: string } };
  stops: {
    type: string;
    city: string;
    state: string;
    facilityName: string;
    scheduledAt: string;
    sequence: number;
  }[];
}

interface DispatchDriver {
  id: string;
  status: string;
  hosRemaining: number;
  truckNumber: string;
  trailerNumber: string;
  phone: string;
  currentCity: string;
  currentState: string;
  user: { firstName: string; lastName: string };
}

// ── Mock dispatch data ─────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const todayStr = fmt(today);

const MOCK_DRIVERS: DispatchDriver[] = [
  { id: 'd1', status: 'DRIVING', hosRemaining: 6.5, truckNumber: 'T-1042', trailerNumber: 'TR-2201', phone: '(555) 901-2345', currentCity: 'Memphis', currentState: 'TN', user: { firstName: 'Marcus', lastName: 'Johnson' } },
  { id: 'd2', status: 'AVAILABLE', hosRemaining: 11.0, truckNumber: 'T-1038', trailerNumber: 'TR-2204', phone: '(555) 234-5678', currentCity: 'Dallas', currentState: 'TX', user: { firstName: 'Sarah', lastName: 'Chen' } },
  { id: 'd3', status: 'DRIVING', hosRemaining: 3.2, truckNumber: 'T-1055', trailerNumber: 'TR-2208', phone: '(555) 567-8901', currentCity: 'Indianapolis', currentState: 'IN', user: { firstName: 'James', lastName: 'Williams' } },
  { id: 'd4', status: 'AVAILABLE', hosRemaining: 10.5, truckNumber: 'T-1061', trailerNumber: 'TR-2215', phone: '(555) 678-9012', currentCity: 'Atlanta', currentState: 'GA', user: { firstName: 'Maria', lastName: 'Rodriguez' } },
  { id: 'd5', status: 'OFF_DUTY', hosRemaining: 0, truckNumber: 'T-1029', trailerNumber: 'TR-2190', phone: '(555) 789-0123', currentCity: 'Chicago', currentState: 'IL', user: { firstName: 'David', lastName: 'Kim' } },
  { id: 'd6', status: 'SLEEPER', hosRemaining: 0, truckNumber: 'T-1044', trailerNumber: 'TR-2222', phone: '(555) 345-6789', currentCity: 'Phoenix', currentState: 'AZ', user: { firstName: 'Emily', lastName: 'Taylor' } },
  { id: 'd7', status: 'DRIVING', hosRemaining: 8.0, truckNumber: 'T-1070', trailerNumber: 'TR-2231', phone: '(555) 456-7890', currentCity: 'Nashville', currentState: 'TN', user: { firstName: 'Robert', lastName: 'Brown' } },
  { id: 'd8', status: 'AVAILABLE', hosRemaining: 9.5, truckNumber: 'T-1033', trailerNumber: 'TR-2199', phone: '(555) 012-3456', currentCity: 'Denver', currentState: 'CO', user: { firstName: 'Lisa', lastName: 'Nguyen' } },
];

const makeTime = (day: number, hour: number, min = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + day);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

const MOCK_LOADS: DispatchLoad[] = [
  {
    id: 'L001', loadNumber: 'LD-4521', status: 'IN_TRANSIT', driverId: 'd1', totalRate: 3200, mileage: 450, equipment: "Van - 53'", commodity: 'Electronics', weight: 32000,
    customer: { name: 'Acme Corp - LAX' },
    driver: { id: 'd1', user: { firstName: 'Marcus', lastName: 'Johnson' } },
    stops: [
      { type: 'PICKUP', city: 'Memphis', state: 'TN', facilityName: 'FedEx Ground Hub', scheduledAt: makeTime(0, 6, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Nashville', state: 'TN', facilityName: 'Amazon FC - BNA5', scheduledAt: makeTime(0, 14, 30), sequence: 1 },
    ],
  },
  {
    id: 'L002', loadNumber: 'LD-4522', status: 'ASSIGNED', driverId: 'd2', totalRate: 4800, mileage: 720, equipment: "Reefer - 53'", commodity: 'Produce', weight: 38000,
    customer: { name: 'Acme Corp - ORD' },
    driver: { id: 'd2', user: { firstName: 'Sarah', lastName: 'Chen' } },
    stops: [
      { type: 'PICKUP', city: 'Dallas', state: 'TX', facilityName: 'Sysco Distribution', scheduledAt: makeTime(0, 8, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Houston', state: 'TX', facilityName: 'HEB Warehouse', scheduledAt: makeTime(0, 18, 0), sequence: 1 },
    ],
  },
  {
    id: 'L003', loadNumber: 'LD-4523', status: 'IN_TRANSIT', driverId: 'd3', totalRate: 5600, mileage: 890, equipment: "Flatbed - 48'", commodity: 'Steel Coils', weight: 44000,
    customer: { name: 'Acme Corp - EWR' },
    driver: { id: 'd3', user: { firstName: 'James', lastName: 'Williams' } },
    stops: [
      { type: 'PICKUP', city: 'Gary', state: 'IN', facilityName: 'US Steel Works', scheduledAt: makeTime(0, 4, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Columbus', state: 'OH', facilityName: 'Honda Assembly Plant', scheduledAt: makeTime(0, 12, 0), sequence: 1 },
    ],
  },
  {
    id: 'L004', loadNumber: 'LD-4524', status: 'IN_TRANSIT', driverId: 'd7', totalRate: 2900, mileage: 380, equipment: "Van - 53'", commodity: 'Auto Parts', weight: 28000,
    customer: { name: 'Acme Corp - DFW' },
    driver: { id: 'd7', user: { firstName: 'Robert', lastName: 'Brown' } },
    stops: [
      { type: 'PICKUP', city: 'Nashville', state: 'TN', facilityName: 'Nissan Parts DC', scheduledAt: makeTime(0, 7, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Louisville', state: 'KY', facilityName: 'Ford Assembly', scheduledAt: makeTime(0, 15, 0), sequence: 1 },
    ],
  },
  {
    id: 'L005', loadNumber: 'LD-4525', status: 'ASSIGNED', driverId: 'd4', totalRate: 3100, mileage: 410, equipment: "Van - 53'", commodity: 'Consumer Goods', weight: 30000,
    customer: { name: 'Acme Corp - ATL' },
    driver: { id: 'd4', user: { firstName: 'Maria', lastName: 'Rodriguez' } },
    stops: [
      { type: 'PICKUP', city: 'Atlanta', state: 'GA', facilityName: 'P&G Distribution', scheduledAt: makeTime(0, 10, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Jacksonville', state: 'FL', facilityName: 'Walmart DC #7033', scheduledAt: makeTime(0, 20, 0), sequence: 1 },
    ],
  },
  {
    id: 'L006', loadNumber: 'LD-4526', status: 'ASSIGNED', driverId: 'd8', totalRate: 6200, mileage: 980, equipment: "Reefer - 53'", commodity: 'Pharmaceuticals', weight: 22000,
    customer: { name: 'Acme Corp - LAX' },
    driver: { id: 'd8', user: { firstName: 'Lisa', lastName: 'Nguyen' } },
    stops: [
      { type: 'PICKUP', city: 'Denver', state: 'CO', facilityName: 'McKesson Pharma DC', scheduledAt: makeTime(0, 12, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Salt Lake City', state: 'UT', facilityName: 'Intermountain Health', scheduledAt: makeTime(1, 6, 0), sequence: 1 },
    ],
  },
  // Unassigned loads
  {
    id: 'L007', loadNumber: 'LD-4527', status: 'PENDING', driverId: null, totalRate: 2800, mileage: 350, equipment: "Van - 53'", commodity: 'Retail Goods', weight: 26000,
    customer: { name: 'Acme Corp - ORD' },
    stops: [
      { type: 'PICKUP', city: 'Chicago', state: 'IL', facilityName: 'Target DC', scheduledAt: makeTime(0, 14, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Milwaukee', state: 'WI', facilityName: 'Costco Regional', scheduledAt: makeTime(0, 22, 0), sequence: 1 },
    ],
  },
  {
    id: 'L008', loadNumber: 'LD-4528', status: 'PENDING', driverId: null, totalRate: 5100, mileage: 810, equipment: "Flatbed - 48'", commodity: 'Lumber', weight: 42000,
    customer: { name: 'Acme Corp - EWR' },
    stops: [
      { type: 'PICKUP', city: 'Portland', state: 'OR', facilityName: 'Weyerhaeuser Mill', scheduledAt: makeTime(1, 6, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Sacramento', state: 'CA', facilityName: 'Home Depot RDC', scheduledAt: makeTime(1, 18, 0), sequence: 1 },
    ],
  },
  {
    id: 'L009', loadNumber: 'LD-4529', status: 'PENDING', driverId: null, totalRate: 3400, mileage: 490, equipment: "Reefer - 53'", commodity: 'Frozen Foods', weight: 36000,
    customer: { name: 'Acme Corp - DFW' },
    stops: [
      { type: 'PICKUP', city: 'Omaha', state: 'NE', facilityName: 'ConAgra Plant', scheduledAt: makeTime(0, 16, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Kansas City', state: 'MO', facilityName: 'Kroger Cold Storage', scheduledAt: makeTime(1, 4, 0), sequence: 1 },
    ],
  },
  {
    id: 'L010', loadNumber: 'LD-4530', status: 'PENDING', driverId: null, totalRate: 4200, mileage: 620, equipment: "Van - 53'", commodity: 'Medical Supplies', weight: 18000,
    customer: { name: 'Acme Corp - ATL' },
    stops: [
      { type: 'PICKUP', city: 'Atlanta', state: 'GA', facilityName: 'Cardinal Health DC', scheduledAt: makeTime(1, 8, 0), sequence: 0 },
      { type: 'DELIVERY', city: 'Charlotte', state: 'NC', facilityName: 'Atrium Health Warehouse', scheduledAt: makeTime(1, 20, 0), sequence: 1 },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIMELINE_START = 0; // midnight
const TIMELINE_END = 24; // midnight next day
const HOUR_WIDTH = 60; // px per hour
const TIMELINE_WIDTH = 24 * HOUR_WIDTH; // 1440px

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  IN_TRANSIT: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
  ASSIGNED: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
  PENDING: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800' },
  DELIVERED: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
};

const DRIVER_STATUS_DOT: Record<string, string> = {
  DRIVING: 'bg-green-500',
  AVAILABLE: 'bg-blue-500',
  OFF_DUTY: 'bg-gray-400',
  SLEEPER: 'bg-yellow-500',
};

const DRIVER_STATUS_LABEL: Record<string, string> = {
  DRIVING: 'Driving',
  AVAILABLE: 'Available',
  OFF_DUTY: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
};

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function getLoadPosition(load: DispatchLoad, viewDate: Date) {
  const pickup = load.stops.find(s => s.type === 'PICKUP');
  const delivery = load.stops.find(s => s.type === 'DELIVERY');
  if (!pickup || !delivery) return null;

  const pickupTime = new Date(pickup.scheduledAt);
  const deliveryTime = new Date(delivery.scheduledAt);
  const dayStart = new Date(viewDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(viewDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Check if load overlaps with the view date
  if (deliveryTime < dayStart || pickupTime > dayEnd) return null;

  // Clamp to day boundaries
  const startMs = Math.max(pickupTime.getTime(), dayStart.getTime());
  const endMs = Math.min(deliveryTime.getTime(), dayEnd.getTime());

  const startHour = (startMs - dayStart.getTime()) / (1000 * 60 * 60);
  const endHour = (endMs - dayStart.getTime()) / (1000 * 60 * 60);
  const duration = endHour - startHour;

  return {
    left: startHour * HOUR_WIDTH,
    width: Math.max(duration * HOUR_WIDTH, 80), // minimum 80px
    startHour,
    endHour,
    pickup,
    delivery,
    extendsLeft: pickupTime < dayStart,
    extendsRight: deliveryTime > dayEnd,
  };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────
export function DispatchPlanner() {
  const queryClient = useQueryClient();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedLoad, setSelectedLoad] = useState<DispatchLoad | null>(null);
  const [assignModal, setAssignModal] = useState<{ load: DispatchLoad } | null>(null);
  const [hoveredLoad, setHoveredLoad] = useState<string | null>(null);
  const [driverFilter, setDriverFilter] = useState<'all' | 'active' | 'available'>('all');
  const [showUnassigned, setShowUnassigned] = useState(true);

  // Use API data if available, fall back to mock
  const { data: apiLoads } = useQuery({
    queryKey: ['loads'],
    queryFn: async () => {
      const { data } = await api.get('/loads');
      return data;
    },
  });

  const { data: apiDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  // Merge API data with mock for demo
  const loads: DispatchLoad[] = MOCK_LOADS;
  const drivers: DispatchDriver[] = MOCK_DRIVERS;

  const assignMutation = useMutation({
    mutationFn: async ({ loadId, driverId }: { loadId: string; driverId: string }) => {
      const { data } = await api.patch(`/loads/${loadId}`, { driverId, status: 'ASSIGNED' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setAssignModal(null);
    },
  });

  // Navigation
  const prevDay = () => setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToday = () => setViewDate(new Date());

  const isToday = fmt(viewDate) === fmt(new Date());

  // Filter drivers
  const filteredDrivers = drivers.filter(d => {
    if (driverFilter === 'active') return d.status === 'DRIVING' || d.status === 'AVAILABLE';
    if (driverFilter === 'available') return d.status === 'AVAILABLE';
    return true;
  });

  // Assigned & unassigned loads
  const assignedLoads = loads.filter(l => l.driverId);
  const unassignedLoads = loads.filter(l => !l.driverId);

  // Stats
  const stats = useMemo(() => ({
    totalLoads: loads.length,
    inTransit: loads.filter(l => l.status === 'IN_TRANSIT').length,
    assigned: loads.filter(l => l.status === 'ASSIGNED').length,
    unassigned: unassignedLoads.length,
    totalRevenue: loads.reduce((s, l) => s + l.totalRate, 0),
    totalMiles: loads.reduce((s, l) => s + l.mileage, 0),
    activeDrivers: drivers.filter(d => d.status === 'DRIVING' || d.status === 'AVAILABLE').length,
    availableDrivers: drivers.filter(d => d.status === 'AVAILABLE').length,
  }), [loads, drivers, unassignedLoads]);

  // Current time marker position
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const nowPosition = nowHour * HOUR_WIDTH;

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Dispatch Planner</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button onClick={prevDay} className="px-2 py-1 text-xs text-gray-600 hover:bg-white rounded transition-colors">←</button>
              <button onClick={goToday} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${isToday ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}>Today</button>
              <button onClick={nextDay} className="px-2 py-1 text-xs text-gray-600 hover:bg-white rounded transition-colors">→</button>
            </div>
            <span className="text-sm font-medium text-gray-700">{formatDate(viewDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
              {(['all', 'active', 'available'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDriverFilter(f)}
                  className={`px-3 py-1.5 font-medium capitalize ${driverFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {f === 'all' ? 'All Drivers' : f === 'active' ? 'Active' : 'Available'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 text-xs">
          <span className="text-gray-500">Loads: <strong className="text-gray-800">{stats.totalLoads}</strong></span>
          <span className="text-gray-500">In Transit: <strong className="text-blue-600">{stats.inTransit}</strong></span>
          <span className="text-gray-500">Assigned: <strong className="text-purple-600">{stats.assigned}</strong></span>
          <span className="text-gray-500">Unassigned: <strong className="text-red-600">{stats.unassigned}</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Active Drivers: <strong className="text-gray-800">{stats.activeDrivers}/{drivers.length}</strong></span>
          <span className="text-gray-500">Revenue: <strong className="text-green-700">${stats.totalRevenue.toLocaleString()}</strong></span>
          <span className="text-gray-500">Miles: <strong className="text-gray-800">{stats.totalMiles.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* ── Gantt Timeline ────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="flex min-w-max">
            {/* Driver column (sticky left) */}
            <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
              {/* Time header spacer */}
              <div className="h-10 border-b border-gray-200 bg-gray-50 px-3 flex items-center">
                <span className="text-xs font-medium text-gray-500">Driver</span>
              </div>
              {/* Driver rows */}
              {filteredDrivers.map(driver => (
                <div
                  key={driver.id}
                  className="h-16 border-b border-gray-100 px-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {driver.user.firstName[0]}{driver.user.lastName[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DRIVER_STATUS_DOT[driver.status]}`} />
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {driver.user.firstName} {driver.user.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{driver.truckNumber}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{driver.currentCity}, {driver.currentState}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{DRIVER_STATUS_LABEL[driver.status]}</span>
                      {driver.hosRemaining > 0 && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className={`text-xs font-medium ${driver.hosRemaining <= 4 ? 'text-red-500' : driver.hosRemaining <= 6 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {driver.hosRemaining}h HOS
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline area */}
            <div className="flex-1">
              {/* Hour headers */}
              <div className="h-10 border-b border-gray-200 bg-gray-50 flex sticky top-0 z-10">
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="flex-shrink-0 border-r border-gray-100 flex items-end pb-1 px-1"
                    style={{ width: HOUR_WIDTH }}
                  >
                    <span className="text-xs text-gray-400">{formatHour(h)}</span>
                  </div>
                ))}
              </div>

              {/* Driver timeline rows */}
              {filteredDrivers.map(driver => {
                const driverLoads = assignedLoads.filter(l => l.driverId === driver.id);

                return (
                  <div
                    key={driver.id}
                    className="h-16 border-b border-gray-100 relative"
                    style={{ width: TIMELINE_WIDTH }}
                  >
                    {/* Hour grid lines */}
                    {HOURS.map(h => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-r border-gray-50"
                        style={{ left: h * HOUR_WIDTH }}
                      />
                    ))}

                    {/* Major grid lines every 6 hours */}
                    {[0, 6, 12, 18].map(h => (
                      <div
                        key={`major-${h}`}
                        className="absolute top-0 bottom-0 border-r border-gray-200"
                        style={{ left: h * HOUR_WIDTH }}
                      />
                    ))}

                    {/* Current time marker */}
                    {isToday && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                        style={{ left: nowPosition }}
                      >
                        <div className="absolute -top-0.5 -left-1 w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    )}

                    {/* Load blocks */}
                    {driverLoads.map(load => {
                      const pos = getLoadPosition(load, viewDate);
                      if (!pos) return null;
                      const colors = STATUS_COLORS[load.status] || STATUS_COLORS.ASSIGNED;
                      const isHovered = hoveredLoad === load.id;

                      return (
                        <div
                          key={load.id}
                          className={`absolute top-2 h-12 rounded-md border cursor-pointer transition-all ${colors.bg} ${colors.border} ${isHovered ? 'shadow-md ring-2 ring-blue-300 z-10' : 'shadow-sm'} ${pos.extendsLeft ? 'rounded-l-none border-l-0' : ''} ${pos.extendsRight ? 'rounded-r-none border-r-0' : ''}`}
                          style={{ left: pos.left, width: pos.width }}
                          onClick={() => setSelectedLoad(load)}
                          onMouseEnter={() => setHoveredLoad(load.id)}
                          onMouseLeave={() => setHoveredLoad(null)}
                        >
                          <div className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-semibold ${colors.text} truncate`}>{load.loadNumber}</span>
                              {pos.width > 160 && (
                                <span className={`text-xs ${colors.text} opacity-60 truncate`}>· ${load.totalRate.toLocaleString()}</span>
                              )}
                            </div>
                            <div className={`text-xs ${colors.text} opacity-70 truncate`}>
                              {pos.pickup.city}, {pos.pickup.state} → {pos.delivery.city}, {pos.delivery.state}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty state for available drivers */}
                    {driverLoads.length === 0 && (driver.status === 'AVAILABLE') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-gray-300 italic">No loads assigned — available for dispatch</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Unassigned Loads Panel ──────────────────────────── */}
        <div className={`border-t border-gray-200 bg-white flex-shrink-0 transition-all ${showUnassigned ? 'max-h-64' : 'max-h-10'}`}>
          <button
            onClick={() => setShowUnassigned(!showUnassigned)}
            className="w-full px-6 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Unassigned Loads</span>
              {unassignedLoads.length > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">{unassignedLoads.length}</span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{showUnassigned ? '▼' : '▲'}</span>
          </button>

          {showUnassigned && (
            <div className="px-6 pb-3 overflow-x-auto">
              <div className="flex gap-3">
                {unassignedLoads.map(load => {
                  const pickup = load.stops.find(s => s.type === 'PICKUP');
                  const delivery = load.stops.find(s => s.type === 'DELIVERY');
                  const pickupDate = pickup ? new Date(pickup.scheduledAt) : null;

                  return (
                    <div
                      key={load.id}
                      className="flex-shrink-0 w-64 bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all"
                      onClick={() => setAssignModal({ load })}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-yellow-800">{load.loadNumber}</span>
                        <span className="text-xs font-semibold text-green-700">${load.totalRate.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {pickup?.city}, {pickup?.state} → {delivery?.city}, {delivery?.state}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{load.mileage} mi</span>
                        <span>·</span>
                        <span>{load.equipment}</span>
                        <span>·</span>
                        <span>{load.commodity}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200">
                        <span className="text-xs text-gray-500">
                          PU: {pickupDate ? `${formatShortDate(pickupDate)} ${formatHour(pickupDate.getHours())}` : '—'}
                        </span>
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                          Assign →
                        </button>
                      </div>
                    </div>
                  );
                })}

                {unassignedLoads.length === 0 && (
                  <div className="text-xs text-gray-400 py-4">All loads have been assigned.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Load Detail Flyout ────────────────────────────────── */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedLoad(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div
            className="relative w-96 bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selectedLoad.loadNumber}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedLoad.status]?.bg} ${STATUS_COLORS[selectedLoad.status]?.text}`}>
                  {selectedLoad.status === 'IN_TRANSIT' ? 'In Transit' : selectedLoad.status?.charAt(0) + selectedLoad.status?.slice(1).toLowerCase()}
                </span>
              </div>
              <button onClick={() => setSelectedLoad(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Customer & Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-400 block">Customer</span>
                  <span className="text-xs font-medium text-gray-900">{selectedLoad.customer?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Rate</span>
                  <span className="text-sm font-semibold text-green-700">${selectedLoad.totalRate.toLocaleString()}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-gray-400 block">Miles</span>
                  <span className="text-xs font-medium text-gray-800">{selectedLoad.mileage}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Equipment</span>
                  <span className="text-xs font-medium text-gray-800">{selectedLoad.equipment}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Weight</span>
                  <span className="text-xs font-medium text-gray-800">{selectedLoad.weight?.toLocaleString()} lbs</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Commodity</span>
                <span className="text-xs font-medium text-gray-800">{selectedLoad.commodity}</span>
              </div>

              {/* Driver */}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Assigned Driver</span>
                {selectedLoad.driver ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                      {selectedLoad.driver.user?.firstName[0]}{selectedLoad.driver.user?.lastName[0]}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-900">{selectedLoad.driver.user?.firstName} {selectedLoad.driver.user?.lastName}</span>
                      <span className="text-xs text-gray-400 block">
                        {drivers.find(d => d.id === selectedLoad.driverId)?.truckNumber} · {drivers.find(d => d.id === selectedLoad.driverId)?.phone}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-500">No driver assigned</span>
                    <button
                      onClick={() => { setSelectedLoad(null); setAssignModal({ load: selectedLoad }); }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Assign Driver
                    </button>
                  </div>
                )}
              </div>

              {/* Stops */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-2">Route</span>
                <div className="space-y-3">
                  {selectedLoad.stops.map((stop, i) => {
                    const time = new Date(stop.scheduledAt);
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 ${stop.type === 'PICKUP' ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'}`} />
                          {i < selectedLoad.stops.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${stop.type === 'PICKUP' ? 'text-green-700' : 'text-red-700'}`}>
                              {stop.type === 'PICKUP' ? 'Pickup' : 'Delivery'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {formatHour(time.getHours())}
                            </span>
                          </div>
                          <span className="text-xs text-gray-700 block">{stop.facilityName}</span>
                          <span className="text-xs text-gray-400">{stop.city}, {stop.state}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {!selectedLoad.driverId && (
                <button
                  onClick={() => { setSelectedLoad(null); setAssignModal({ load: selectedLoad }); }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                >
                  Assign Driver
                </button>
              )}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Driver Modal ───────────────────────────────── */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Assign Driver to {assignModal.load.loadNumber}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {assignModal.load.stops[0]?.city}, {assignModal.load.stops[0]?.state} → {assignModal.load.stops[assignModal.load.stops.length - 1]?.city}, {assignModal.load.stops[assignModal.load.stops.length - 1]?.state}
                <span className="ml-2">· {assignModal.load.mileage} mi · ${assignModal.load.totalRate.toLocaleString()}</span>
              </p>
            </div>

            <div className="px-5 py-3 max-h-72 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-2">Available drivers</p>
              <div className="space-y-1">
                {drivers
                  .filter(d => d.status === 'AVAILABLE')
                  .map(driver => (
                    <button
                      key={driver.id}
                      onClick={() => {
                        // In production this would call the API
                        // assignMutation.mutate({ loadId: assignModal.load.id, driverId: driver.id });
                        setAssignModal(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                        {driver.user.firstName[0]}{driver.user.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-900">{driver.user.firstName} {driver.user.lastName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{driver.truckNumber} · {driver.trailerNumber}</span>
                          <span className={`text-xs font-medium ${driver.hosRemaining <= 4 ? 'text-red-500' : 'text-green-600'}`}>
                            {driver.hosRemaining}h HOS
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{driver.currentCity}, {driver.currentState}</span>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">Assign</span>
                    </button>
                  ))}

                {drivers.filter(d => d.status === 'AVAILABLE').length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No available drivers at this time.</p>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4 mb-2">Other drivers</p>
              <div className="space-y-1 opacity-60">
                {drivers
                  .filter(d => d.status !== 'AVAILABLE')
                  .map(driver => (
                    <div
                      key={driver.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        {driver.user.firstName[0]}{driver.user.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-700">{driver.user.firstName} {driver.user.lastName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{DRIVER_STATUS_LABEL[driver.status]}</span>
                          <span className="text-xs text-gray-400">{driver.currentCity}, {driver.currentState}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
