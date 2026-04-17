import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
type DispatchTab = 'trip_board' | 'drivers' | 'schedule';

interface Trip {
  id: string; tripNumber: string; type: 'IMPORT_PICKUP' | 'EXPORT_DELIVERY' | 'LOCAL_DELIVERY' | 'TRANSFER';
  status: 'PLANNED' | 'DISPATCHED' | 'EN_ROUTE' | 'AT_TERMINAL' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  driver: string; vehicle: string; vehicleType: string;
  stops: { seq: number; location: string; airport: string; building: string; mawb: string; orderNumber: string; pieces: number; weight: string; action: 'PICKUP' | 'DELIVER' | 'DROP_CFS'; eta: string; arriveAt: string; departAt: string; status: 'PENDING' | 'ARRIVED' | 'COMPLETED' }[];
  scheduledDate: string; scheduledTime: string;
  totalPieces: number; totalWeight: string; totalStops: number;
  notes: string;
}

interface DispatchDriver {
  id: string; name: string; phone: string; status: 'AVAILABLE' | 'ON_TRIP' | 'BREAK' | 'OFF_DUTY';
  currentTrip: string; vehicle: string; vehicleType: string;
  location: string; lastUpdate: string;
  tripsToday: number; piecesHandled: number;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_TRIPS: Trip[] = [
  { id: 't1', tripNumber: 'TRP-0414-001', type: 'IMPORT_PICKUP', status: 'EN_ROUTE', driver: 'Marcus Johnson', vehicle: 'T-1042', vehicleType: '24ft Box Truck', stops: [
    { seq: 1, location: 'JFK — Bldg 75', airport: 'JFK', building: 'Bldg 75', mawb: '176-82445521', orderNumber: 'JFK-IMP-0901', pieces: 12, weight: '2,400 kg', action: 'PICKUP', eta: '2:30 PM', arriveAt: '', departAt: '', status: 'PENDING' },
    { seq: 2, location: 'JFK — Bldg 151', airport: 'JFK', building: 'Bldg 151', mawb: '131-99100300', orderNumber: 'JFK-IMP-0905', pieces: 60, weight: '7,800 kg', action: 'PICKUP', eta: '3:15 PM', arriveAt: '', departAt: '', status: 'PENDING' },
    { seq: 3, location: 'CFS Warehouse', airport: '', building: 'CFS', mawb: '', orderNumber: '', pieces: 72, weight: '10,200 kg', action: 'DROP_CFS', eta: '4:30 PM', arriveAt: '', departAt: '', status: 'PENDING' },
  ], scheduledDate: '2026-04-14', scheduledTime: '14:00', totalPieces: 72, totalWeight: '10,200 kg', totalStops: 3, notes: 'Multi-stop pickup at JFK — 2 terminals' },
  { id: 't2', tripNumber: 'TRP-0414-002', type: 'EXPORT_DELIVERY', status: 'AT_TERMINAL', driver: 'Robert Brown', vehicle: 'T-1070', vehicleType: 'Reefer Truck', stops: [
    { seq: 1, location: 'CFS Warehouse', airport: '', building: 'CFS', mawb: '', orderNumber: '', pieces: 10, weight: '680 kg', action: 'PICKUP', eta: '12:00 PM', arriveAt: '12:05 PM', departAt: '12:30 PM', status: 'COMPLETED' },
    { seq: 2, location: 'MIA Cargo Terminal', airport: 'MIA', building: 'Terminal N', mawb: '235-77100505', orderNumber: 'MIA-EXP-0180', pieces: 10, weight: '680 kg', action: 'DELIVER', eta: '1:30 PM', arriveAt: '1:25 PM', departAt: '', status: 'ARRIVED' },
  ], scheduledDate: '2026-04-14', scheduledTime: '12:00', totalPieces: 10, totalWeight: '680 kg', totalStops: 2, notes: 'CRITICAL — pharma cold chain 2-8°C. Cutoff 3:00 PM.' },
  { id: 't3', tripNumber: 'TRP-0414-003', type: 'IMPORT_PICKUP', status: 'DISPATCHED', driver: 'David Kim', vehicle: 'T-1029', vehicleType: 'Sprinter Van', stops: [
    { seq: 1, location: 'ORD — Cargo Area F', airport: 'ORD', building: 'Cargo Area F', mawb: '618-44210098', orderNumber: 'ORD-IMP-0445', pieces: 8, weight: '1,800 kg', action: 'PICKUP', eta: '3:00 PM', arriveAt: '', departAt: '', status: 'PENDING' },
    { seq: 2, location: 'Midwest Auto Parts — Indianapolis', airport: '', building: '', mawb: '618-44210098', orderNumber: 'ORD-IMP-0445', pieces: 8, weight: '1,800 kg', action: 'DELIVER', eta: '6:30 PM', arriveAt: '', departAt: '', status: 'PENDING' },
  ], scheduledDate: '2026-04-14', scheduledTime: '14:30', totalPieces: 8, totalWeight: '1,800 kg', totalStops: 2, notes: 'Direct delivery to consignee after terminal pickup' },
  { id: 't4', tripNumber: 'TRP-0414-004', type: 'LOCAL_DELIVERY', status: 'DELIVERING', driver: 'Sarah Chen', vehicle: 'T-1055', vehicleType: '26ft Box Truck', stops: [
    { seq: 1, location: 'CFS Warehouse', airport: '', building: 'CFS', mawb: '', orderNumber: '', pieces: 28, weight: '3,200 kg', action: 'PICKUP', eta: '9:00 AM', arriveAt: '9:05 AM', departAt: '9:40 AM', status: 'COMPLETED' },
    { seq: 2, location: 'Tech Distributors — Edison, NJ', airport: '', building: '', mawb: '176-82445521', orderNumber: 'JFK-IMP-0901', pieces: 12, weight: '2,400 kg', action: 'DELIVER', eta: '10:45 AM', arriveAt: '10:50 AM', departAt: '11:15 AM', status: 'COMPLETED' },
    { seq: 3, location: 'NJ Medical Supply — Newark, NJ', airport: '', building: '', mawb: '074-66190283', orderNumber: 'JFK-IMP-0880', pieces: 3, weight: '890 kg', action: 'DELIVER', eta: '11:45 AM', arriveAt: '', departAt: '', status: 'PENDING' },
  ], scheduledDate: '2026-04-14', scheduledTime: '09:00', totalPieces: 15, totalWeight: '3,290 kg', totalStops: 3, notes: 'Multi-drop local delivery — NJ area' },
  { id: 't5', tripNumber: 'TRP-0414-005', type: 'EXPORT_DELIVERY', status: 'PLANNED', driver: '', vehicle: '', vehicleType: '', stops: [
    { seq: 1, location: 'CFS Warehouse', airport: '', building: 'CFS', mawb: '', orderNumber: '', pieces: 32, weight: '4,200 kg', action: 'PICKUP', eta: '4:00 PM', arriveAt: '', departAt: '', status: 'PENDING' },
    { seq: 2, location: 'JFK — Bldg 151', airport: 'JFK', building: 'Bldg 151', mawb: '176-88100502', orderNumber: 'JFK-EXP-0502', pieces: 32, weight: '4,200 kg', action: 'DELIVER', eta: '5:30 PM', arriveAt: '', departAt: '', status: 'PENDING' },
  ], scheduledDate: '2026-04-14', scheduledTime: '16:00', totalPieces: 32, totalWeight: '4,200 kg', totalStops: 2, notes: 'Export consol for CX 841 → HKG. Cutoff 7:00 PM.' },
  { id: 't6', tripNumber: 'TRP-0414-006', type: 'IMPORT_PICKUP', status: 'COMPLETED', driver: 'James Williams', vehicle: 'T-1082', vehicleType: '53\' Dry Van', stops: [
    { seq: 1, location: 'JFK — Bldg 22', airport: 'JFK', building: 'Bldg 22', mawb: '180-99321100', orderNumber: 'JFK-IMP-0902', pieces: 48, weight: '6,200 kg', action: 'PICKUP', eta: '8:00 AM', arriveAt: '7:55 AM', departAt: '8:45 AM', status: 'COMPLETED' },
    { seq: 2, location: 'CFS Warehouse', airport: '', building: 'CFS', mawb: '', orderNumber: '', pieces: 48, weight: '6,200 kg', action: 'DROP_CFS', eta: '10:00 AM', arriveAt: '9:50 AM', departAt: '10:20 AM', status: 'COMPLETED' },
  ], scheduledDate: '2026-04-14', scheduledTime: '07:30', totalPieces: 48, totalWeight: '6,200 kg', totalStops: 2, notes: 'Completed — cargo at CFS for deconsolidation' },
];

const MOCK_DRIVERS: DispatchDriver[] = [
  { id: 'd1', name: 'Marcus Johnson', phone: '(555) 101-0001', status: 'ON_TRIP', currentTrip: 'TRP-0414-001', vehicle: 'T-1042', vehicleType: '24ft Box Truck', location: 'En route to JFK Bldg 75', lastUpdate: '2:15 PM', tripsToday: 1, piecesHandled: 0 },
  { id: 'd2', name: 'Robert Brown', phone: '(555) 101-0002', status: 'ON_TRIP', currentTrip: 'TRP-0414-002', vehicle: 'T-1070', vehicleType: 'Reefer Truck', location: 'MIA Cargo Terminal N', lastUpdate: '1:25 PM', tripsToday: 1, piecesHandled: 10 },
  { id: 'd3', name: 'David Kim', phone: '(555) 101-0003', status: 'ON_TRIP', currentTrip: 'TRP-0414-003', vehicle: 'T-1029', vehicleType: 'Sprinter Van', location: 'Dispatched to ORD', lastUpdate: '2:30 PM', tripsToday: 1, piecesHandled: 0 },
  { id: 'd4', name: 'Sarah Chen', phone: '(555) 101-0004', status: 'ON_TRIP', currentTrip: 'TRP-0414-004', vehicle: 'T-1055', vehicleType: '26ft Box Truck', location: 'NJ — delivering', lastUpdate: '11:30 AM', tripsToday: 1, piecesHandled: 12 },
  { id: 'd5', name: 'James Williams', phone: '(555) 101-0005', status: 'AVAILABLE', currentTrip: '', vehicle: 'T-1082', vehicleType: '53\' Dry Van', location: 'CFS Warehouse', lastUpdate: '10:30 AM', tripsToday: 1, piecesHandled: 48 },
  { id: 'd6', name: 'Emily Taylor', phone: '(555) 101-0006', status: 'AVAILABLE', currentTrip: '', vehicle: 'T-1090', vehicleType: 'Flatbed', location: 'CFS Warehouse', lastUpdate: '1:00 PM', tripsToday: 0, piecesHandled: 0 },
  { id: 'd7', name: 'Carlos Mendez', phone: '(555) 101-0007', status: 'BREAK', currentTrip: '', vehicle: 'T-1033', vehicleType: '24ft Box Truck', location: 'CFS Warehouse', lastUpdate: '12:45 PM', tripsToday: 2, piecesHandled: 35 },
];

// ── Helpers ────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, { label: string; color: string; icon: string }> = {
  IMPORT_PICKUP: { label: 'Import Pickup', color: 'bg-blue-100 text-blue-800', icon: '📥' },
  EXPORT_DELIVERY: { label: 'Export Delivery', color: 'bg-orange-100 text-orange-800', icon: '📤' },
  LOCAL_DELIVERY: { label: 'Local Delivery', color: 'bg-green-100 text-green-800', icon: '🚛' },
  TRANSFER: { label: 'Transfer', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
};
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  PLANNED: { label: 'Planned', color: 'bg-gray-100 text-gray-600' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-blue-100 text-blue-800' },
  EN_ROUTE: { label: 'En Route', color: 'bg-indigo-100 text-indigo-800' },
  AT_TERMINAL: { label: 'At Terminal', color: 'bg-yellow-100 text-yellow-800' },
  LOADING: { label: 'Loading', color: 'bg-orange-100 text-orange-800' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-cyan-100 text-cyan-800' },
  DELIVERING: { label: 'Delivering', color: 'bg-teal-100 text-teal-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};
const DRIVER_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  ON_TRIP: { label: 'On Trip', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  BREAK: { label: 'Break', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  OFF_DUTY: { label: 'Off Duty', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};
const STOP_ACTION: Record<string, { label: string; color: string }> = { PICKUP: { label: 'Pickup', color: 'text-blue-600' }, DELIVER: { label: 'Deliver', color: 'text-green-600' }, DROP_CFS: { label: 'Drop at CFS', color: 'text-purple-600' } };

// ── Component ──────────────────────────────────────────────────────
export function CFSDispatch() {
  const [activeTab, setActiveTab] = useState<DispatchTab>('trip_board');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showPickupVerify, setShowPickupVerify] = useState(false);
  const [verifyStop, setVerifyStop] = useState<any>(null);
  const [pickupType, setPickupType] = useState<'FULL' | 'PARTIAL' | 'SHORT'>('FULL');
  const [receivedPieces, setReceivedPieces] = useState(0);
  const [damageNotes, setDamageNotes] = useState('');
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [showPartialReminder, setShowPartialReminder] = useState(false);
  const [showRouteOpt, setShowRouteOpt] = useState(false);

  const filteredTrips = useMemo(() => MOCK_TRIPS.filter(t => statusFilter === 'All' || t.status === statusFilter), [statusFilter]);

  const stats = useMemo(() => ({
    active: MOCK_TRIPS.filter(t => !['COMPLETED', 'CANCELLED', 'PLANNED'].includes(t.status)).length,
    planned: MOCK_TRIPS.filter(t => t.status === 'PLANNED').length,
    completed: MOCK_TRIPS.filter(t => t.status === 'COMPLETED').length,
    driversAvailable: MOCK_DRIVERS.filter(d => d.status === 'AVAILABLE').length,
    driversOnTrip: MOCK_DRIVERS.filter(d => d.status === 'ON_TRIP').length,
    totalPieces: MOCK_TRIPS.filter(t => t.status !== 'CANCELLED').reduce((s, t) => s + t.totalPieces, 0),
  }), []);

  const tabs = [
    { id: 'trip_board' as DispatchTab, label: 'Trip Board', count: MOCK_TRIPS.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length },
    { id: 'drivers' as DispatchTab, label: 'Drivers & Vehicles', count: MOCK_DRIVERS.length },
    { id: 'schedule' as DispatchTab, label: 'Today\'s Schedule' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-lg font-semibold text-gray-900">CFS Dispatch</h2><p className="text-xs text-gray-400 mt-0.5">Terminal pickups, export deliveries, and local routing</p></div>
        <div className="flex gap-2"><button onClick={() => setShowRouteOpt(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">🗺 Route Optimizer</button><button className="px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ Create Trip</button></div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Active Trips</p><p className="text-xl font-bold text-blue-600">{stats.active}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Planned</p><p className="text-xl font-bold text-yellow-600">{stats.planned}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Completed (Today)</p><p className="text-xl font-bold text-green-600">{stats.completed}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Drivers Available</p><p className="text-xl font-bold text-green-600">{stats.driversAvailable}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Drivers on Trip</p><p className="text-xl font-bold text-blue-600">{stats.driversOnTrip}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Pieces</p><p className="text-xl font-bold text-gray-900">{stats.totalPieces}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label} {t.count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}</button>
        ))}
      </div>

      {/* ── Trip Board ─────────────────────────────────── */}
      {activeTab === 'trip_board' && (
        <div>
          <div className="flex gap-1 mb-3">
            {['All', 'PLANNED', 'DISPATCHED', 'EN_ROUTE', 'AT_TERMINAL', 'DELIVERING', 'COMPLETED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 text-xs rounded font-medium ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : STATUS_BADGE[s]?.label || s}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredTrips.map(trip => {
              const completedStops = trip.stops.filter(s => s.status === 'COMPLETED').length;
              return (
                <div key={trip.id} className={`bg-white border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${trip.status === 'PLANNED' && !trip.driver ? 'border-yellow-300 border-l-4 border-l-yellow-500' : trip.status === 'COMPLETED' ? 'border-gray-200 opacity-70' : 'border-gray-200 border-l-4 border-l-violet-500'}`} onClick={() => setSelectedTrip(trip)}>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${TYPE_BADGE[trip.type].color}`}>{TYPE_BADGE[trip.type].icon} {TYPE_BADGE[trip.type].label}</span>
                      <div><p className="text-sm font-bold text-gray-900">{trip.tripNumber}</p><p className="text-xs text-gray-400">{trip.scheduledTime} · {trip.totalPieces} pcs · {trip.totalWeight}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      {trip.driver ? (
                        <div className="text-right"><p className="text-xs font-medium text-gray-800">{trip.driver}</p><p className="text-xs text-gray-400">{trip.vehicle} · {trip.vehicleType}</p></div>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">⚠ No driver assigned</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[trip.status].color}`}>{STATUS_BADGE[trip.status].label}</span>
                    </div>
                  </div>
                  {/* Stop sequence */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-1">
                      {trip.stops.map((stop, i) => (
                        <div key={i} className="flex items-center flex-1">
                          <div className={`flex-1 flex items-center gap-2 py-1.5 px-2.5 rounded ${stop.status === 'COMPLETED' ? 'bg-green-50' : stop.status === 'ARRIVED' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <span className={`w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0 ${stop.status === 'COMPLETED' ? 'bg-green-500' : stop.status === 'ARRIVED' ? 'bg-blue-500' : 'bg-gray-300'}`}>{stop.seq}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{stop.location}</p>
                              <p className="text-xs text-gray-400">{STOP_ACTION[stop.action].label} · {stop.pieces} pcs · ETA {stop.eta}</p>
                            </div>
                          </div>
                          {i < trip.stops.length - 1 && <span className="text-gray-300 mx-1 flex-shrink-0">→</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>Stops: {completedStops}/{trip.totalStops}</span>
                      {trip.notes && <span className="text-gray-500 truncate max-w-[300px]">{trip.notes}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Drivers & Vehicles ─────────────────────────── */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 gap-3">
          {MOCK_DRIVERS.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${d.status === 'AVAILABLE' ? 'bg-green-600' : d.status === 'ON_TRIP' ? 'bg-blue-600' : 'bg-gray-400'}`}>{d.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${DRIVER_STATUS[d.status].dot}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.phone} · {d.vehicle} ({d.vehicleType})</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right"><p className="text-xs text-gray-400">Location</p><p className="text-xs font-medium text-gray-700">{d.location}</p><p className="text-xs text-gray-400">{d.lastUpdate}</p></div>
                <div className="text-center"><p className="text-xs text-gray-400">Trips Today</p><p className="text-sm font-bold text-gray-900">{d.tripsToday}</p></div>
                <div className="text-center"><p className="text-xs text-gray-400">Pcs Handled</p><p className="text-sm font-bold text-gray-900">{d.piecesHandled}</p></div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DRIVER_STATUS[d.status].color}`}>{DRIVER_STATUS[d.status].label}</span>
                  {d.currentTrip && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-mono rounded">{d.currentTrip}</span>}
                </div>
                {d.status === 'AVAILABLE' && <button className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">Assign Trip</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Today's Schedule ────────────────────────────── */}
      {activeTab === 'schedule' && (
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200"><h3 className="text-sm font-bold text-gray-900">Schedule — {new Date('2026-04-14').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3></div>
            <div className="relative">
              {/* Time slots */}
              {['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'].map((time, i) => (
                <div key={time} className={`flex border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="w-20 py-3 px-3 text-xs text-gray-400 font-medium text-right border-r border-gray-100 flex-shrink-0">{time}</div>
                  <div className="flex-1 py-2 px-3 min-h-[48px]">
                    {MOCK_TRIPS.filter(t => {
                      const h = parseInt(t.scheduledTime.split(':')[0]);
                      const isPM = h >= 12;
                      const slotH = parseInt(time.split(':')[0]) + (time.includes('PM') && !time.includes('12') ? 12 : 0);
                      const tripH = h;
                      return tripH === (time.includes('12') ? 12 : slotH);
                    }).map(t => (
                      <div key={t.id} className={`flex items-center gap-2 py-1 px-2 rounded mb-1 cursor-pointer hover:opacity-80 ${TYPE_BADGE[t.type].color}`} onClick={() => setSelectedTrip(t)}>
                        <span className="text-xs font-bold">{t.tripNumber}</span>
                        <span className="text-xs">{TYPE_BADGE[t.type].icon} {t.driver || 'Unassigned'}</span>
                        <span className="text-xs">· {t.totalStops} stops · {t.totalPieces} pcs</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status].color}`}>{STATUS_BADGE[t.status].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Trip Detail Flyout ─────────────────────────── */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedTrip(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[500px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${TYPE_BADGE[selectedTrip.type].color}`}>{TYPE_BADGE[selectedTrip.type].icon} {TYPE_BADGE[selectedTrip.type].label}</span><h3 className="text-sm font-bold text-gray-900">{selectedTrip.tripNumber}</h3></div><button onClick={() => setSelectedTrip(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedTrip.status].color}`}>{STATUS_BADGE[selectedTrip.status].label}</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Driver & Vehicle */}
              {selectedTrip.driver ? (
                <div className="bg-violet-50 rounded-lg p-3"><div className="flex justify-between text-xs"><span className="text-violet-600 font-semibold">Driver</span><span className="font-bold text-gray-900">{selectedTrip.driver}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-violet-600 font-semibold">Vehicle</span><span className="text-gray-700">{selectedTrip.vehicle} — {selectedTrip.vehicleType}</span></div></div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs font-bold text-yellow-800">⚠ No driver assigned</p><button className="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">Assign Driver & Vehicle</button></div>
              )}
              <div className="grid grid-cols-3 gap-3"><div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{selectedTrip.totalStops}</p><p className="text-xs text-gray-500">Stops</p></div><div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{selectedTrip.totalPieces}</p><p className="text-xs text-gray-500">Pieces</p></div><div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-sm font-bold text-gray-900">{selectedTrip.totalWeight}</p><p className="text-xs text-gray-500">Weight</p></div></div>

              {/* Stop Sequence */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Route — {selectedTrip.totalStops} Stops</h4>
                <div className="space-y-2">
                  {selectedTrip.stops.map((stop, i) => (
                    <div key={i} className={`rounded-lg p-3 border ${stop.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : stop.status === 'ARRIVED' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center ${stop.status === 'COMPLETED' ? 'bg-green-500' : stop.status === 'ARRIVED' ? 'bg-blue-500' : 'bg-gray-400'}`}>{stop.seq}</span>
                        <span className={`text-xs font-bold ${STOP_ACTION[stop.action].color}`}>{STOP_ACTION[stop.action].label.toUpperCase()}</span>
                        <span className="text-xs font-semibold text-gray-800">{stop.location}</span>
                      </div>
                      <div className="ml-8 grid grid-cols-2 gap-1 text-xs">
                        {stop.mawb && <div><span className="text-gray-400">MAWB:</span> <span className="font-mono text-gray-700">{stop.mawb}</span></div>}
                        {stop.orderNumber && <div><span className="text-gray-400">Order:</span> <span className="text-blue-600">{stop.orderNumber}</span></div>}
                        <div><span className="text-gray-400">Pieces:</span> <span className="text-gray-700">{stop.pieces}</span></div>
                        <div><span className="text-gray-400">Weight:</span> <span className="text-gray-700">{stop.weight}</span></div>
                        <div><span className="text-gray-400">ETA:</span> <span className="font-medium text-gray-700">{stop.eta}</span></div>
                        {stop.arriveAt && <div><span className="text-gray-400">Arrived:</span> <span className="text-green-600 font-medium">{stop.arriveAt}</span></div>}
                      </div>
                      {(stop.action === 'PICKUP' || stop.action === 'DELIVER') && stop.status !== 'COMPLETED' && (
                        <div className="ml-8 mt-2"><button onClick={(e) => { e.stopPropagation(); setVerifyStop(stop); setReceivedPieces(stop.pieces); setPickupType('FULL'); setDamageNotes(''); setDiscrepancyNotes(''); setShowPickupVerify(true); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">✓ Verify {stop.action === 'PICKUP' ? 'Pickup' : 'Delivery'}</button></div>
                      )}
                      {stop.status === 'COMPLETED' && (
                        <div className="ml-8 mt-2 flex items-center gap-2"><span className="text-xs text-green-600 font-medium">✓ Verified</span><button className="text-xs text-blue-600 hover:underline">View POD</button></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {selectedTrip.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedTrip.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedTrip.status === 'PLANNED' && <button className="flex-1 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">Dispatch Trip</button>}
              {['EN_ROUTE', 'DISPATCHED'].includes(selectedTrip.status) && <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Track Driver</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit Trip</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pickup / Delivery Verification Modal ──────── */}
      {showPickupVerify && verifyStop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={() => setShowPickupVerify(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">✓ Verify {verifyStop.action === 'PICKUP' ? 'Pickup' : 'Delivery'} — {verifyStop.location}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{verifyStop.mawb ? `MAWB: ${verifyStop.mawb}` : verifyStop.orderNumber} · Expected: {verifyStop.pieces} pieces · {verifyStop.weight}</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Pickup Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'FULL' as const, label: 'Full Pickup', icon: '✅', desc: 'All pieces received', color: 'border-green-300 bg-green-50' },
                    { value: 'PARTIAL' as const, label: 'Partial Pickup', icon: '⚠️', desc: 'Some pieces missing', color: 'border-yellow-300 bg-yellow-50' },
                    { value: 'SHORT' as const, label: 'Short / Refused', icon: '❌', desc: 'Cargo not available', color: 'border-red-300 bg-red-50' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => { setPickupType(opt.value); if (opt.value === 'FULL') setReceivedPieces(verifyStop.pieces); }} className={`p-3 rounded-lg border-2 text-left transition-all ${pickupType === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-blue-400' : 'border-gray-200 bg-white'}`}>
                      <span className="text-lg">{opt.icon}</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Piece Count */}
              {pickupType !== 'SHORT' && (
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Expected Pieces</label><input type="number" value={verifyStop.pieces} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Received Pieces *</label><input type="number" value={receivedPieces} onChange={e => { const v = Number(e.target.value); setReceivedPieces(v); if (v < verifyStop.pieces && v > 0) setPickupType('PARTIAL'); else if (v === verifyStop.pieces) setPickupType('FULL'); }} className={`w-full border rounded-lg px-3 py-2 text-sm font-bold ${receivedPieces < verifyStop.pieces ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-300 text-gray-900'}`} /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Discrepancy</label><div className={`w-full rounded-lg px-3 py-2 text-sm font-bold text-center ${verifyStop.pieces - receivedPieces > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{verifyStop.pieces - receivedPieces > 0 ? `-${verifyStop.pieces - receivedPieces} short` : '✓ Match'}</div></div>
                </div>
              )}

              {/* Partial Pickup Alert */}
              {pickupType === 'PARTIAL' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><span className="text-lg">⚠️</span><span className="text-sm font-bold text-yellow-800">Partial Pickup — {verifyStop.pieces - receivedPieces} pieces missing</span></div>
                  <p className="text-xs text-yellow-700 mb-3">A follow-up pickup will be automatically scheduled for the remaining {verifyStop.pieces - receivedPieces} piece(s).</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-yellow-800 mb-1">Reason for Partial</label><select className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white"><option>Cargo not ready</option><option>Airline still processing</option><option>Customs hold on portion</option><option>Space constraint on vehicle</option><option>Wrong piece count at origin</option><option>Other</option></select></div>
                    <div><label className="block text-xs font-medium text-yellow-800 mb-1">Follow-up Pickup Date</label><input type="date" defaultValue="2026-04-15" className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 text-xs text-yellow-800"><input type="checkbox" defaultChecked className="rounded text-yellow-600" /> Set reminder for Operations to re-arrange pickup for remaining {verifyStop.pieces - receivedPieces} piece(s)</label>
                  <label className="flex items-center gap-2 mt-1 text-xs text-yellow-800"><input type="checkbox" defaultChecked className="rounded text-yellow-600" /> Notify customer about partial pickup</label>
                </div>
              )}

              {/* Short / Refused */}
              {pickupType === 'SHORT' && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><span className="text-lg">❌</span><span className="text-sm font-bold text-red-800">Shipment Short / Refused</span></div>
                  <div><label className="block text-xs font-medium text-red-800 mb-1">Reason</label><select className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm bg-white"><option>Cargo not available at terminal</option><option>Wrong documentation</option><option>Customs not cleared</option><option>Cargo damaged — refused</option><option>Terminal closed</option><option>Other</option></select></div>
                  <label className="flex items-center gap-2 mt-3 text-xs text-red-800"><input type="checkbox" defaultChecked className="rounded text-red-600" /> Set reminder for Operations to reschedule pickup</label>
                  <label className="flex items-center gap-2 mt-1 text-xs text-red-800"><input type="checkbox" defaultChecked className="rounded text-red-600" /> Alert dispatch manager immediately</label>
                </div>
              )}

              {/* Damage Documentation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Damage / Condition Report</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['No Damage', 'Minor Scuffs', 'Packaging Damaged', 'Content Damaged'].map((cond, i) => (
                    <button key={i} className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${i === 0 ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>{cond}</button>
                  ))}
                </div>
                <textarea value={damageNotes} onChange={e => setDamageNotes(e.target.value)} placeholder="Describe any damage, dents, wet cartons, broken seals..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence (Proof of Pickup)</label>
                <div className="grid grid-cols-4 gap-2">
                  {['📷 Cargo Overview', '📷 Piece Count', '📷 Labels / MAWB', '📷 Damage (if any)'].map((label, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50">
                      <p className="text-lg mb-1">📷</p>
                      <p className="text-xs text-gray-600">{label.replace('📷 ', '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discrepancy Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discrepancy Notes</label>
                <textarea value={discrepancyNotes} onChange={e => setDiscrepancyNotes(e.target.value)} placeholder="Any discrepancies with documentation, piece count, weight, labeling..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                <div className="grid grid-cols-3 gap-2">
                  {['BOL / Airway Bill', 'Delivery Receipt', 'Tally Sheet'].map((doc, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                      <p className="text-sm mb-1">📄</p>
                      <p className="text-xs text-gray-600">{doc}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Drop or click</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Signature */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Signature</label>
                <div className="bg-white border border-gray-300 rounded-lg h-20 flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50">Click to sign or capture from mobile app</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowPickupVerify(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <div className="flex gap-2">
                {pickupType === 'PARTIAL' && <button onClick={() => { setShowPickupVerify(false); setShowPartialReminder(true); }} className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">Save as Partial ({receivedPieces}/{verifyStop.pieces})</button>}
                <button onClick={() => { setShowPickupVerify(false); if (pickupType === 'PARTIAL') setShowPartialReminder(true); }} className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">✓ Confirm {verifyStop.action === 'PICKUP' ? 'Pickup' : 'Delivery'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Partial Pickup Reminder Confirmation ──────── */}
      {showPartialReminder && verifyStop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]" onClick={() => setShowPartialReminder(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-yellow-200 bg-yellow-50"><h2 className="text-sm font-semibold text-yellow-800">⚠️ Partial Pickup Confirmed — Follow-Up Required</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Location</span><br/><strong>{verifyStop.location}</strong></div>
                  <div><span className="text-gray-400">MAWB</span><br/><strong className="font-mono">{verifyStop.mawb || '—'}</strong></div>
                  <div><span className="text-gray-400">Picked Up</span><br/><strong className="text-green-600">{receivedPieces} pieces</strong></div>
                  <div><span className="text-gray-400">Remaining</span><br/><strong className="text-red-600">{verifyStop.pieces - receivedPieces} pieces</strong></div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Automated Actions:</h4>
                <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 rounded-lg"><span className="text-green-600">✓</span><span className="text-xs text-gray-700">Linked remaining {verifyStop.pieces - receivedPieces} piece(s) to original shipment</span></div>
                <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 rounded-lg"><span className="text-green-600">✓</span><span className="text-xs text-gray-700">Reminder set for Operations: Re-arrange pickup for Apr 15, 2026</span></div>
                <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 rounded-lg"><span className="text-green-600">✓</span><span className="text-xs text-gray-700">Customer notification queued about partial pickup</span></div>
                <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 rounded-lg"><span className="text-green-600">✓</span><span className="text-xs text-gray-700">New trip will auto-create when Operations confirms reschedule</span></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Assign Follow-Up To</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Operations Team (auto-assign)</option><option>Chen Xia</option><option>Maria Santos</option><option>Jake Martinez</option></select></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200"><button onClick={() => setShowPartialReminder(false)} className="px-5 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700">✓ Confirm & Set Reminder</button></div>
          </div>
        </div>
      )}

      {/* Route Optimization Modal */}
      {showRouteOpt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRouteOpt(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">🗺 Route Optimization — Multi-Stop Planning</h2><p className="text-xs text-gray-400 mt-0.5">Optimize terminal pickup/delivery routes for minimum distance and time</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Start Location</label><input type="text" defaultValue="CFS Warehouse — Springfield Gardens, NY" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Vehicle</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>T-1042 — 24ft Box Truck</option><option>T-1055 — 26ft Box Truck</option><option>T-1070 — Reefer Truck</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Optimize For</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Shortest Distance</option><option>Fastest Time</option><option>Fewest Tolls</option></select></div>
              </div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Stops to Optimize (drag to reorder)</h4>
                <div className="space-y-1.5">
                  {[
                    { seq: 1, loc: 'JFK — Bldg 75 (Korean Air Cargo)', mawb: '176-82445521', pcs: 12, action: 'Pickup', eta: '—' },
                    { seq: 2, loc: 'JFK — Bldg 151 (Cathay Pacific Cargo)', mawb: '131-99100300', pcs: 60, action: 'Pickup', eta: '—' },
                    { seq: 3, loc: 'JFK — Bldg 22 (Emirates Cargo)', mawb: '131-55782100', pcs: 24, action: 'Pickup', eta: '—' },
                    { seq: 4, loc: 'CFS Warehouse — Drop All', mawb: '', pcs: 96, action: 'Drop', eta: '—' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-400 cursor-grab">⠿</span>
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">{s.seq}</span>
                      <div className="flex-1"><p className="text-xs font-medium text-gray-800">{s.loc}</p>{s.mawb && <p className="text-xs text-gray-400 font-mono">{s.mawb} · {s.pcs} pcs</p>}</div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.action === 'Pickup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{s.action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-green-800 mb-2">Optimized Route Summary</h4>
                <div className="grid grid-cols-4 gap-3 text-xs"><div><span className="text-gray-500">Total Distance</span><br/><strong className="text-gray-900">28.4 mi</strong></div><div><span className="text-gray-500">Est. Drive Time</span><br/><strong className="text-gray-900">1h 15m</strong></div><div><span className="text-gray-500">Est. Total Time</span><br/><strong className="text-gray-900">3h 30m</strong><br/><span className="text-gray-400">(incl. loading)</span></div><div><span className="text-gray-500">Savings vs Original</span><br/><strong className="text-green-600">-8.2 mi / -22 min</strong></div></div>
              </div>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400 text-sm">🗺 Map Preview — Route visualization with Google Maps</div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200"><button onClick={() => setShowRouteOpt(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={() => setShowRouteOpt(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Apply Optimized Route</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
