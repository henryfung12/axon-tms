import { useState, useMemo } from 'react';

interface ImportOrder {
  id: string; orderNumber: string; mawb: string; hawb: string; airline: string; flightNumber: string;
  originAirport: string; arrivalAirport: string; arrivalDate: string; arrivalTime: string;
  terminal: string; building: string;
  shipper: string; consignee: string; consigneeCity: string; consigneeState: string;
  pieces: number; weight: string; commodity: string; dims: string;
  status: 'MANIFESTED' | 'ARRIVED' | 'CUSTOMS_HOLD' | 'CUSTOMS_CLEARED' | 'READY_PICKUP' | 'DISPATCHED' | 'PICKED_UP' | 'AT_CFS' | 'DECONSOLIDATED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  customsStatus: 'PENDING' | 'CLEARED' | 'HOLD_FDA' | 'HOLD_USDA' | 'HOLD_CBP' | 'EXAM' | 'RELEASED';
  storageStart: string; storageDays: number;
  assignedDriver: string; assignedVehicle: string;
  isfFiled: boolean; notes: string;
}

const MOCK_IMPORTS: ImportOrder[] = [
  { id: 'imp1', orderNumber: 'JFK-IMP-0901', mawb: '176-82445521', hawb: 'GE-H-20260414-001', airline: 'Korean Air', flightNumber: 'KE 082', originAirport: 'ICN', arrivalAirport: 'JFK', arrivalDate: '2026-04-14', arrivalTime: '06:30', terminal: 'Terminal 1', building: 'Bldg 75', shipper: 'Samsung Electronics Co.', consignee: 'Tech Distributors LLC', consigneeCity: 'Edison', consigneeState: 'NJ', pieces: 12, weight: '2,400 kg', commodity: 'Electronic Components', dims: '120x80x100 cm', status: 'CUSTOMS_CLEARED', customsStatus: 'CLEARED', storageStart: '2026-04-14', storageDays: 0, assignedDriver: 'Marcus Johnson', assignedVehicle: 'T-1042', isfFiled: true, notes: 'High value — requires signature at delivery' },
  { id: 'imp2', orderNumber: 'JFK-IMP-0902', mawb: '180-99321100', hawb: 'GE-H-20260414-002', airline: 'Cathay Pacific', flightNumber: 'CX 840', originAirport: 'HKG', arrivalAirport: 'JFK', arrivalDate: '2026-04-14', arrivalTime: '08:15', terminal: 'Terminal 1', building: 'Bldg 151', shipper: 'Global Textile Co.', consignee: 'NY Fashion Import Inc.', consigneeCity: 'New York', consigneeState: 'NY', pieces: 48, weight: '6,200 kg', commodity: 'Textile / Garments', dims: '80x60x80 cm', status: 'AT_CFS', customsStatus: 'CLEARED', storageStart: '2026-04-14', storageDays: 0, assignedDriver: '', assignedVehicle: '', isfFiled: true, notes: 'Deconsolidation required — 6 consignees' },
  { id: 'imp3', orderNumber: 'JFK-IMP-0892', mawb: '131-55782100', hawb: 'GE-H-20260413-008', airline: 'Emirates', flightNumber: 'EK 202', originAirport: 'DXB', arrivalAirport: 'JFK', arrivalDate: '2026-04-13', arrivalTime: '14:20', terminal: 'Terminal 4', building: 'Bldg 22', shipper: 'Arabian Fresh Foods', consignee: 'Gourmet Imports USA', consigneeCity: 'Brooklyn', consigneeState: 'NY', pieces: 24, weight: '3,800 kg', commodity: 'Perishable — Fresh Dates', dims: '100x80x60 cm', status: 'CUSTOMS_HOLD', customsStatus: 'HOLD_FDA', storageStart: '2026-04-13', storageDays: 1, assignedDriver: '', assignedVehicle: '', isfFiled: true, notes: 'FDA hold — perishable goods require prior notice and inspection' },
  { id: 'imp4', orderNumber: 'ORD-IMP-0445', mawb: '618-44210098', hawb: 'GE-H-20260414-003', airline: 'ANA', flightNumber: 'NH 112', originAirport: 'NRT', arrivalAirport: 'ORD', arrivalDate: '2026-04-14', arrivalTime: '10:45', terminal: 'Terminal 5', building: 'Cargo Area F', shipper: 'Honda Motor Co.', consignee: 'Midwest Auto Parts Inc.', consigneeCity: 'Indianapolis', consigneeState: 'IN', pieces: 8, weight: '1,800 kg', commodity: 'Auto Parts — Engine', dims: '150x100x80 cm', status: 'DISPATCHED', customsStatus: 'CLEARED', storageStart: '', storageDays: 0, assignedDriver: 'David Kim', assignedVehicle: 'T-1029', isfFiled: true, notes: '' },
  { id: 'imp5', orderNumber: 'MIA-IMP-0321', mawb: '235-11887400', hawb: 'GE-H-20260414-004', airline: 'LATAM', flightNumber: 'LA 500', originAirport: 'GRU', arrivalAirport: 'MIA', arrivalDate: '2026-04-14', arrivalTime: '07:00', terminal: 'Terminal N', building: 'MIA Cargo', shipper: 'Farmacêutica Brasil', consignee: 'US Pharma Distribution', consigneeCity: 'Tampa', consigneeState: 'FL', pieces: 6, weight: '420 kg', commodity: 'Pharmaceutical — Cold Chain', dims: '60x40x40 cm', status: 'ARRIVED', customsStatus: 'PENDING', storageStart: '2026-04-14', storageDays: 0, assignedDriver: '', assignedVehicle: '', isfFiled: true, notes: 'Temp controlled — must maintain 2-8°C. FDA prior notice filed.' },
  { id: 'imp6', orderNumber: 'JFK-IMP-0880', mawb: '074-66190283', hawb: 'GE-H-20260412-005', airline: 'KLM', flightNumber: 'KL 642', originAirport: 'AMS', arrivalAirport: 'JFK', arrivalDate: '2026-04-12', arrivalTime: '15:30', terminal: 'Terminal 4', building: 'Bldg 22', shipper: 'Philips Medical BV', consignee: 'NJ Medical Supply', consigneeCity: 'Newark', consigneeState: 'NJ', pieces: 3, weight: '890 kg', commodity: 'Medical Equipment', dims: '200x100x120 cm', status: 'DELIVERED', customsStatus: 'CLEARED', storageStart: '2026-04-12', storageDays: 0, assignedDriver: 'Robert Brown', assignedVehicle: 'T-1070', isfFiled: true, notes: 'Delivered 4/13 9:30 AM — signed by receiver' },
  { id: 'imp7', orderNumber: 'DFW-IMP-0210', mawb: '297-88100345', hawb: 'GE-H-20260414-006', airline: 'Lufthansa', flightNumber: 'LH 438', originAirport: 'FRA', arrivalAirport: 'DFW', arrivalDate: '2026-04-14', arrivalTime: '13:00', terminal: 'Terminal D', building: 'DFW Cargo', shipper: 'Bosch GmbH', consignee: 'Texas Industrial Supply', consigneeCity: 'Houston', consigneeState: 'TX', pieces: 16, weight: '3,200 kg', commodity: 'Industrial Machinery Parts', dims: '110x90x85 cm', status: 'MANIFESTED', customsStatus: 'PENDING', storageStart: '', storageDays: 0, assignedDriver: '', assignedVehicle: '', isfFiled: false, notes: 'ISF not yet filed — flight arriving 1:00 PM' },
  { id: 'imp8', orderNumber: 'ATL-IMP-0156', mawb: '057-22441890', hawb: 'GE-H-20260413-007', airline: 'Delta Cargo', flightNumber: 'DL 200', originAirport: 'CDG', arrivalAirport: 'ATL', arrivalDate: '2026-04-13', arrivalTime: '16:45', terminal: 'Cargo Complex', building: 'ATL Cargo Bldg', shipper: 'Château Wines SARL', consignee: 'Southeast Wine Imports', consigneeCity: 'Atlanta', consigneeState: 'GA', pieces: 40, weight: '4,600 kg', commodity: 'Wine — Temperature Sensitive', dims: '80x60x100 cm', status: 'READY_PICKUP', customsStatus: 'RELEASED', storageStart: '2026-04-13', storageDays: 1, assignedDriver: '', assignedVehicle: '', isfFiled: true, notes: 'TTB approved. Temp controlled storage. Ready for pickup.' },
];

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  MANIFESTED: { label: 'Manifested', color: 'bg-gray-100 text-gray-700' },
  ARRIVED: { label: 'Arrived', color: 'bg-indigo-100 text-indigo-800' },
  CUSTOMS_HOLD: { label: 'Customs Hold', color: 'bg-red-100 text-red-800' },
  CUSTOMS_CLEARED: { label: 'Customs Cleared', color: 'bg-green-100 text-green-800' },
  READY_PICKUP: { label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-800' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-yellow-100 text-yellow-800' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-orange-100 text-orange-800' },
  AT_CFS: { label: 'At CFS Warehouse', color: 'bg-purple-100 text-purple-800' },
  DECONSOLIDATED: { label: 'Deconsolidated', color: 'bg-teal-100 text-teal-800' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
};

const CUSTOMS_BADGE: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-600' },
  CLEARED: { label: 'Cleared', color: 'bg-green-100 text-green-800' },
  HOLD_FDA: { label: 'FDA Hold', color: 'bg-red-100 text-red-800' },
  HOLD_USDA: { label: 'USDA Hold', color: 'bg-red-100 text-red-800' },
  HOLD_CBP: { label: 'CBP Hold', color: 'bg-red-100 text-red-800' },
  EXAM: { label: 'Exam', color: 'bg-orange-100 text-orange-800' },
  RELEASED: { label: 'Released', color: 'bg-green-100 text-green-800' },
};

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; }

export function CFSImportOrders() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showAirlineTrack, setShowAirlineTrack] = useState(false);
  const [showPartialPickups, setShowPartialPickups] = useState(true);

  const PARTIAL_PICKUPS = [
    { id: 'pp1', orderNumber: 'JFK-IMP-0892', mawb: '131-55782100', consignee: 'Gourmet Imports USA', totalPieces: 24, pickedUp: 16, remaining: 8, weight: '1,200 kg', reason: 'Cargo not ready — 8 pcs still under FDA hold', pickupDate: '2026-04-14', scheduledFollowUp: '2026-04-15', assignedTo: 'Chen Xia', driver: '', status: 'PENDING_FOLLOWUP' as const },
    { id: 'pp2', orderNumber: 'JFK-IMP-0880', mawb: '074-66190283', consignee: 'NJ Medical Supply', totalPieces: 3, pickedUp: 2, remaining: 1, weight: '290 kg', reason: 'Missing 1 carton — airline locating in terminal', pickupDate: '2026-04-13', scheduledFollowUp: '2026-04-15', assignedTo: 'Maria Santos', driver: '', status: 'PENDING_FOLLOWUP' as const },
    { id: 'pp3', orderNumber: 'ATL-IMP-0156', mawb: '057-22441890', consignee: 'Southeast Wine Imports', totalPieces: 40, pickedUp: 0, remaining: 40, weight: '4,600 kg', reason: 'Terminal closed — arrived after cutoff', pickupDate: '2026-04-14', scheduledFollowUp: '2026-04-15', assignedTo: 'Jake Martinez', driver: '', status: 'SCHEDULED' as const },
  ];
  const [parsedAMS, setParsedAMS] = useState<any>(null);
  const [parsing, setParsing] = useState(false);

  // Simulate AIR AMS file parsing
  const handleAMSUpload = () => {
    setParsing(true);
    setTimeout(() => {
      setParsedAMS({
        facilityNumber: 'EAT5',
        irsNumber: '84-4181762',
        manifestNumber: '784-83769700',
        mawb: '784-83769700',
        consignor: 'Whaleco Services, LLC',
        airport: 'John F Kennedy International Airport',
        airportCode: 'JFK',
        airline: 'China Southern Airlines',
        airlineCode: 'CZ',
        flightNumber: 'CZ 2545',
        arrivalDate: '2026-04-16',
        originAirport: 'CAN',
        originName: 'Guangzhou Baiyun International Airport',
        broker: 'AGS Broker c/o (JFK) Gemini Transport Corp',
        agentSignature: 'CHEN XIA',
        totalPieces: 93,
        grossWeight: '1,993.13 kg',
        totalHawbs: 2937,
        pickupType: 'LOOSE CARGO',
        terminal: 'Terminal 4',
        building: 'Cargo Bldg 80',
        truckNumber: '',
        containerNumber: '',
        amsEntryField: '',
        customsAuth: '',
        dateOnDoc: '2026-04-16',
        status: 'ARRIVED',
        customsStatus: 'PENDING',
        commodity: 'General Merchandise',
      });
      setParsing(false);
    }, 1800);
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleAll = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id)));
  const selectedOrders = MOCK_IMPORTS.filter(o => selectedIds.has(o.id));

  const filtered = useMemo(() => MOCK_IMPORTS.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return o.orderNumber.toLowerCase().includes(q) || o.mawb.toLowerCase().includes(q) || o.hawb.toLowerCase().includes(q) || o.consignee.toLowerCase().includes(q) || o.airline.toLowerCase().includes(q); }
    return true;
  }), [statusFilter, searchQuery]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Import Orders — Airline Terminal Pickup</h2>
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search MAWB, HAWB, consignee..." className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => setShowAirlineTrack(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">✈ Airline Tracking</button>
          <button onClick={() => { setShowUploadZone(true); setParsedAMS(null); }} className="px-4 py-1.5 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100">📄 Upload AIR AMS</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Import</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Orders</p><p className="text-xl font-bold text-gray-900">{MOCK_IMPORTS.length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Awaiting Customs</p><p className="text-xl font-bold text-yellow-600">{MOCK_IMPORTS.filter(o => ['ARRIVED', 'MANIFESTED'].includes(o.status)).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Customs Holds</p><p className={`text-xl font-bold ${MOCK_IMPORTS.some(o => o.status === 'CUSTOMS_HOLD') ? 'text-red-600' : 'text-gray-400'}`}>{MOCK_IMPORTS.filter(o => o.status === 'CUSTOMS_HOLD').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Ready for Pickup</p><p className="text-xl font-bold text-blue-600">{MOCK_IMPORTS.filter(o => ['CUSTOMS_CLEARED', 'READY_PICKUP'].includes(o.status)).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">In Transit / CFS</p><p className="text-xl font-bold text-purple-600">{MOCK_IMPORTS.filter(o => ['DISPATCHED', 'PICKED_UP', 'AT_CFS'].includes(o.status)).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Delivered</p><p className="text-xl font-bold text-green-600">{MOCK_IMPORTS.filter(o => o.status === 'DELIVERED').length}</p></div>
      </div>

      {/* ── Partial / Pending Pickups Alert ────────────────── */}
      {PARTIAL_PICKUPS.length > 0 && showPartialPickups && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">⚠️</span><h3 className="text-sm font-bold text-yellow-800">Partial / Pending Pickups — {PARTIAL_PICKUPS.length} Follow-Ups Required</h3></div>
            <div className="flex gap-2"><button onClick={() => setShowPartialPickups(false)} className="text-xs text-yellow-600 hover:underline">Collapse</button></div>
          </div>
          <div className="space-y-2">
            {PARTIAL_PICKUPS.map(pp => (
              <div key={pp.id} className={`flex items-center justify-between p-3 rounded-lg border ${pp.status === 'PENDING_FOLLOWUP' ? 'bg-white border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${pp.status === 'PENDING_FOLLOWUP' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{pp.remaining}</div>
                    <p className="text-xs text-gray-400 text-center mt-0.5">pcs left</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-blue-600">{pp.orderNumber}</span>
                      <span className="text-xs font-mono text-gray-400">{pp.mawb}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${pp.status === 'PENDING_FOLLOWUP' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{pp.status === 'PENDING_FOLLOWUP' ? 'Pending Follow-Up' : 'Scheduled'}</span>
                    </div>
                    <p className="text-xs text-gray-700">{pp.consignee} — <strong>{pp.pickedUp}/{pp.totalPieces}</strong> pcs picked up · <strong className="text-red-600">{pp.remaining} remaining</strong> ({pp.weight})</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pp.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1"><span>Original: {pp.pickupDate}</span><span>·</span><span>Follow-up: <strong className="text-gray-700">{pp.scheduledFollowUp}</strong></span><span>·</span><span>Assigned: <strong className="text-gray-700">{pp.assignedTo}</strong></span></div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-3">
                  <button className="px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100">🚛 Dispatch Pickup</button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">✓ Complete Pickup</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-yellow-600"><span>Total remaining: <strong>{PARTIAL_PICKUPS.reduce((s, p) => s + p.remaining, 0)} pieces</strong> across {PARTIAL_PICKUPS.length} orders</span></div>
        </div>
      )}

      {!showPartialPickups && PARTIAL_PICKUPS.length > 0 && (
        <button onClick={() => setShowPartialPickups(true)} className="mb-4 w-full py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-medium text-yellow-700 hover:bg-yellow-100">⚠️ {PARTIAL_PICKUPS.length} Partial / Pending Pickups — Click to expand</button>
      )}

      <div className="flex gap-1 mb-3 flex-wrap">
        {['All', 'MANIFESTED', 'ARRIVED', 'CUSTOMS_HOLD', 'CUSTOMS_CLEARED', 'READY_PICKUP', 'DISPATCHED', 'AT_CFS', 'DELIVERED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 text-xs rounded font-medium ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : STATUS_BADGE[s]?.label || s}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded text-violet-600" /></th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Order #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airline / Flight</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Terminal</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Consignee</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Commodity</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Pcs / Wt</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customs</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
            </tr></thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedIds.has(o.id) ? 'bg-violet-50' : o.status === 'CUSTOMS_HOLD' ? 'bg-red-50 border-l-4 border-l-red-400' : o.status === 'READY_PICKUP' ? 'bg-blue-50' : ''}`} onClick={() => setSelectedOrder(o)}>
                  <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(o.id); }}><input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => {}} className="rounded text-violet-600" /></td>
                  <td className="px-3 py-2.5 font-semibold text-blue-600">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-700">{o.mawb}</td>
                  <td className="px-3 py-2.5"><span className="text-gray-800">{o.airline}</span><br/><span className="text-gray-400">{o.flightNumber} · {o.originAirport}→{o.arrivalAirport}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{o.arrivalAirport} {o.building}</td>
                  <td className="px-3 py-2.5 text-gray-700">{o.consignee}<br/><span className="text-gray-400">{o.consigneeCity}, {o.consigneeState}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{o.commodity}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{o.pieces} pcs<br/><span className="text-gray-400">{o.weight}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${CUSTOMS_BADGE[o.customsStatus].color}`}>{CUSTOMS_BADGE[o.customsStatus].label}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[o.status].color}`}>{STATUS_BADGE[o.status].label}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{o.assignedDriver || <span className="text-gray-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AIR AMS Upload Modal ───────────────────────── */}
      {showUploadZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowUploadZone(false); setParsedAMS(null); }}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Upload AIR AMS — Auto-Create Import Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload an AIR AMS (IRC-225 / Section 321) file to auto-populate import shipment data</p>
            </div>

            {!parsedAMS && !parsing && (
              <div className="px-6 py-6">
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleAMSUpload(); }}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'}`}
                  onClick={handleAMSUpload}
                >
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-lg font-semibold text-gray-800">Drop AIR AMS file here or click to browse</p>
                  <p className="text-sm text-gray-500 mt-2">PDF, TIF, JPG, or scanned image — we'll auto-extract all fields</p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">IRC-225</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Section 321</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Air AMS</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Carrier Manifest</span>
                  </div>
                </div>
              </div>
            )}

            {parsing && (
              <div className="px-6 py-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-gray-800">Parsing AIR AMS document...</p>
                <p className="text-xs text-gray-400 mt-1">Extracting manifest, airway bill, cargo, and customs data</p>
              </div>
            )}

            {parsedAMS && (
              <div className="px-6 py-4 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div><p className="text-sm font-bold text-green-800">AIR AMS Parsed Successfully</p><p className="text-xs text-green-600">All fields extracted — review and confirm to create import order</p></div>
                </div>

                {/* Document Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">AIR AMS — IRC-225 · Section 321 Shipment</h4>
                    <div className="flex gap-2 text-xs"><span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Facility #{parsedAMS.facilityNumber}</span><span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded">IRS #{parsedAMS.irsNumber}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-0.5">Manifest / MAWB #</label><input type="text" defaultValue={parsedAMS.mawb} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono font-bold bg-white" /></div>
                    <div><label className="block text-xs text-gray-400 mb-0.5">Consignor</label><input type="text" defaultValue={parsedAMS.consignor} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  </div>
                </div>

                {/* Flight & Route */}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Airline</label><input type="text" defaultValue={parsedAMS.airline} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Flight #</label><input type="text" defaultValue={parsedAMS.flightNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Arrival Date</label><input type="text" defaultValue={parsedAMS.arrivalDate} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200"><p className="text-xs text-blue-600 font-semibold mb-1">ORIGIN</p><p className="text-sm font-bold text-gray-900">{parsedAMS.originName}</p><p className="text-xs text-gray-500 mt-0.5">{parsedAMS.originAirport}</p></div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200"><p className="text-xs text-green-600 font-semibold mb-1">DESTINATION</p><p className="text-sm font-bold text-gray-900">{parsedAMS.airport}</p><p className="text-xs text-gray-500 mt-0.5">{parsedAMS.airportCode}</p></div>
                </div>

                {/* Terminal & Pickup */}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Terminal</label><input type="text" defaultValue={parsedAMS.terminal} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Building</label><input type="text" defaultValue={parsedAMS.building} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Pickup Type</label><input type="text" defaultValue={parsedAMS.pickupType} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white font-semibold" /></div>
                </div>

                {/* Cargo Details */}
                <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                  <h4 className="text-xs font-bold text-violet-700 mb-3">Cargo Details (extracted)</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-2.5 text-center border border-violet-200"><p className="text-xl font-bold text-gray-900">{parsedAMS.totalPieces}</p><p className="text-xs text-gray-500">Total Pieces</p></div>
                    <div className="bg-white rounded-lg p-2.5 text-center border border-violet-200"><p className="text-xl font-bold text-gray-900">{parsedAMS.grossWeight}</p><p className="text-xs text-gray-500">Gross Weight</p></div>
                    <div className="bg-white rounded-lg p-2.5 text-center border border-violet-200"><p className="text-xl font-bold text-gray-900">{parsedAMS.totalHawbs.toLocaleString()}</p><p className="text-xs text-gray-500">Total HAWBs</p></div>
                    <div className="bg-white rounded-lg p-2.5 text-center border border-violet-200"><p className="text-sm font-bold text-gray-900">{parsedAMS.commodity}</p><p className="text-xs text-gray-500">Commodity</p></div>
                  </div>
                </div>

                {/* Broker & Agent */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Broker / CFS Agent</label><input type="text" defaultValue={parsedAMS.broker} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Agent Signature</label><input type="text" defaultValue={parsedAMS.agentSignature} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                </div>

                {/* Transfer Record */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-gray-700 mb-2">Transfer Record</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-0.5">Truck No.</label><input type="text" placeholder="Assign truck..." className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                    <div><label className="block text-xs text-gray-400 mb-0.5">Container No.</label><input type="text" placeholder="If applicable..." className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                    <div><label className="block text-xs text-gray-400 mb-0.5">AMS Entry</label><input type="text" placeholder="AMS entry field..." className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  </div>
                </div>

                {/* Auto-create options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-violet-600" /> Auto-generate order number (JFK-IMP-XXXX)</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-violet-600" /> Create individual HAWB sub-orders for deconsolidation</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-violet-600" /> Submit ISF filing automatically</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-violet-600" /> Sync to CargoWise after creation</label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setShowUploadZone(false); setParsedAMS(null); }} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              {parsedAMS && (
                <div className="flex gap-2">
                  <button onClick={() => setParsedAMS(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Upload Different File</button>
                  <button onClick={() => { setShowUploadZone(false); setParsedAMS(null); }} className="px-6 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">✓ Create Import Order</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-3 bg-violet-600 text-white rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected</span>
            <span className="text-xs text-violet-200">{selectedOrders.reduce((s, o) => s + o.pieces, 0)} total pieces · {selectedOrders.map(o => o.arrivalAirport).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAssignModal(true)} className="px-4 py-1.5 text-sm font-semibold bg-white text-violet-700 rounded-lg hover:bg-violet-50">🚛 Assign Driver & Truck</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-sm text-violet-200 hover:text-white">Clear</button>
          </div>
        </div>
      )}

      {/* Trip Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Assign Import Pickup Trip</h2>
              <p className="text-xs text-gray-400 mt-0.5">Combine {selectedIds.size} MAWB{selectedIds.size > 1 ? 's' : ''} into one pickup trip</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Selected Orders Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Orders to Pick Up</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-100"><th className="text-left px-3 py-2 text-gray-500">MAWB</th><th className="text-left px-3 py-2 text-gray-500">Airline</th><th className="text-left px-3 py-2 text-gray-500">Terminal</th><th className="text-right px-3 py-2 text-gray-500">Pcs</th><th className="text-right px-3 py-2 text-gray-500">Weight</th><th className="text-left px-3 py-2 text-gray-500">Commodity</th><th className="w-6 px-2"></th></tr></thead>
                    <tbody>{selectedOrders.map(o => (
                      <tr key={o.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 font-mono font-medium text-gray-900">{o.mawb}</td>
                        <td className="px-3 py-2 text-gray-700">{o.airline} {o.flightNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{o.arrivalAirport} {o.building}</td>
                        <td className="px-3 py-2 text-right text-gray-800">{o.pieces}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{o.weight}</td>
                        <td className="px-3 py-2 text-gray-600">{o.commodity}</td>
                        <td className="px-2"><button onClick={() => toggleSelect(o.id)} className="text-gray-400 hover:text-red-500">✕</button></td>
                      </tr>
                    ))}</tbody>
                    <tfoot><tr className="border-t border-gray-300 bg-gray-100 font-semibold">
                      <td className="px-3 py-2 text-gray-700" colSpan={3}>Total</td>
                      <td className="px-3 py-2 text-right text-gray-900">{selectedOrders.reduce((s, o) => s + o.pieces, 0)}</td>
                      <td className="px-3 py-2 text-right text-gray-900" colSpan={3}>{selectedOrders.length} MAWB{selectedOrders.length > 1 ? 's' : ''}</td>
                    </tr></tfoot>
                  </table>
                </div>
              </div>

              {/* Driver & Vehicle Assignment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select driver...</option>
                    <option>Marcus Johnson</option>
                    <option>Robert Brown</option>
                    <option>David Kim</option>
                    <option>James Williams</option>
                    <option>Sarah Chen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select vehicle...</option>
                    <option>T-1029 — Sprinter Van</option>
                    <option>T-1042 — 24ft Box Truck</option>
                    <option>T-1055 — 26ft Box Truck</option>
                    <option>T-1070 — 53' Dry Van</option>
                    <option>T-1082 — Reefer Truck</option>
                    <option>T-1090 — Flatbed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck / Equipment Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Sprinter Van', icon: '🚐', desc: 'Up to 3,500 lbs' },
                    { type: '24ft Box Truck', icon: '🚛', desc: 'Up to 10,000 lbs' },
                    { type: '26ft Box Truck', icon: '🚛', desc: 'Up to 12,000 lbs' },
                    { type: '53\' Dry Van', icon: '📦', desc: 'Up to 44,000 lbs' },
                    { type: 'Reefer Truck', icon: '❄️', desc: 'Temp controlled' },
                    { type: 'Flatbed', icon: '🛻', desc: 'Oversize cargo' },
                  ].map(t => (
                    <label key={t.type} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="import_truck_type" className="text-violet-600" />
                      <div><span className="text-sm">{t.icon}</span> <span className="text-xs font-medium text-gray-800">{t.type}</span><p className="text-xs text-gray-400">{t.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label><input type="date" defaultValue="2026-04-14" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label><input type="time" defaultValue="14:00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>

              {/* Stop sequence */}
              {selectedOrders.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Stop Sequence</label>
                  <p className="text-xs text-gray-400 mb-2">Drag to reorder terminal stops. Driver will follow this route.</p>
                  <div className="space-y-1.5">
                    {selectedOrders.map((o, i) => (
                      <div key={o.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="w-6 h-6 bg-violet-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                        <div className="flex-1"><span className="text-xs font-semibold text-gray-800">{o.arrivalAirport} — {o.building}</span><br/><span className="text-xs text-gray-400">{o.mawb} · {o.pieces} pcs · {o.weight}</span></div>
                        <span className="text-gray-300 text-sm cursor-grab">☰</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Special instructions for driver..." /></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={() => { setShowAssignModal(false); setSelectedIds(new Set()); }} className="px-6 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">Assign Trip ({selectedIds.size} MAWB{selectedIds.size > 1 ? 's' : ''})</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Flyout */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[480px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-900">{selectedOrder.orderNumber}</h3><button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedOrder.status].color}`}>{STATUS_BADGE[selectedOrder.status].label}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMS_BADGE[selectedOrder.customsStatus].color}`}>{CUSTOMS_BADGE[selectedOrder.customsStatus].label}</span></div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-blue-600 font-semibold mb-1">Airway Bills</p><div className="flex justify-between text-xs"><span className="text-gray-500">MAWB</span><span className="font-mono font-bold text-gray-900">{selectedOrder.mawb}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-gray-500">HAWB</span><span className="font-mono font-bold text-gray-900">{selectedOrder.hawb}</span></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Airline / Flight</p><p className="text-sm font-semibold">{selectedOrder.airline} — {selectedOrder.flightNumber}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Route</p><p className="text-sm font-semibold">{selectedOrder.originAirport} → {selectedOrder.arrivalAirport}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Arrival</p><p className="text-sm font-semibold">{fmtDate(selectedOrder.arrivalDate)} {selectedOrder.arrivalTime}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Terminal / Bldg</p><p className="text-sm font-semibold">{selectedOrder.terminal} — {selectedOrder.building}</p></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Cargo Details</h4><div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Commodity</span><span className="text-gray-800">{selectedOrder.commodity}</span></div><div className="flex justify-between"><span className="text-gray-500">Pieces</span><span className="text-gray-800">{selectedOrder.pieces}</span></div><div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="text-gray-800">{selectedOrder.weight}</span></div><div className="flex justify-between"><span className="text-gray-500">Dimensions</span><span className="text-gray-800">{selectedOrder.dims}</span></div></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Shipper / Consignee</h4><div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs"><div><span className="text-gray-400">Shipper:</span> <span className="font-medium">{selectedOrder.shipper}</span></div><div><span className="text-gray-400">Consignee:</span> <span className="font-medium">{selectedOrder.consignee}</span></div><div><span className="text-gray-400">Deliver to:</span> <span className="font-medium">{selectedOrder.consigneeCity}, {selectedOrder.consigneeState}</span></div></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">ISF Filed</p><p className={`text-sm font-semibold ${selectedOrder.isfFiled ? 'text-green-600' : 'text-red-600'}`}>{selectedOrder.isfFiled ? '✓ Yes' : '✕ Not Filed'}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Storage Days</p><p className="text-sm font-semibold">{selectedOrder.storageDays}d</p></div></div>
              {selectedOrder.assignedDriver && <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Dispatch</h4><div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1"><div className="flex justify-between"><span className="text-gray-500">Driver</span><span className="text-gray-800 font-medium">{selectedOrder.assignedDriver}</span></div><div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="text-gray-800 font-medium">{selectedOrder.assignedVehicle}</span></div></div></div>}
              {selectedOrder.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedOrder.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {['CUSTOMS_CLEARED', 'READY_PICKUP'].includes(selectedOrder.status) && <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Dispatch for Pickup</button>}
              {selectedOrder.status === 'CUSTOMS_HOLD' && <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">View Hold Details</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Airline Cargo Tracking Modal */}
      {showAirlineTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAirlineTrack(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">✈ Airline Cargo Tracking — Live Status</h2><p className="text-xs text-gray-400 mt-0.5">Real-time cargo status from airline tracking portals</p></div>
            <div className="px-6 py-4">
              <div className="flex gap-2 mb-4"><input type="text" placeholder="Enter MAWB # (e.g. 176-82445521)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" /><button className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Track</button></div>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airline</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Route</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Flight</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Update</th>
              </tr></thead><tbody>
                {[
                  { mawb: '176-82445521', airline: 'Korean Air', route: 'ICN → JFK', flight: 'KE 082', status: 'ARRIVED', milestone: 'Arrived JFK — cleared at cargo terminal', time: '14 Apr, 6:30 AM', color: 'bg-green-100 text-green-800' },
                  { mawb: '180-99321100', airline: 'Cathay Pacific', route: 'HKG → JFK', flight: 'CX 840', status: 'ARRIVED', milestone: 'Arrived JFK — customs hold (FDA)', time: '14 Apr, 8:15 AM', color: 'bg-yellow-100 text-yellow-800' },
                  { mawb: '131-55782100', airline: 'Emirates', route: 'DXB → JFK', flight: 'EK 202', status: 'IN_TRANSIT', milestone: 'Departed Dubai — ETA JFK 14:20', time: '14 Apr, 2:00 AM', color: 'bg-blue-100 text-blue-800' },
                  { mawb: '235-11887400', airline: 'LATAM', route: 'GRU → MIA', flight: 'LA 500', status: 'DEPARTED', milestone: 'Departed São Paulo — ETA MIA 18:45', time: '14 Apr, 5:30 AM', color: 'bg-blue-100 text-blue-800' },
                  { mawb: '618-77200100', airline: 'ANA', route: 'NRT → ORD', flight: 'NH 112', status: 'BOOKED', milestone: 'Cargo accepted at origin — awaiting departure', time: '13 Apr, 11:00 PM', color: 'bg-gray-100 text-gray-700' },
                  { mawb: '297-88100345', airline: 'Lufthansa', route: 'FRA → DFW', flight: 'LH 438', status: 'IN_TRANSIT', milestone: 'In flight — ETA DFW 13:00', time: '14 Apr, 7:00 AM', color: 'bg-blue-100 text-blue-800' },
                ].map((t, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono font-bold text-violet-600">{t.mawb}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.airline}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.route}</td>
                    <td className="px-3 py-2.5 text-gray-600">{t.flight}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.color}`}>{t.status.replace('_', ' ')}</span><br/><span className="text-xs text-gray-500">{t.milestone}</span></td>
                    <td className="px-3 py-2.5 text-gray-500">{t.time}</td>
                  </tr>
                ))}
              </tbody></table>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400"><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span>Auto-refresh every 15 min</span></div><span>Sources: Korean Air Cargo, Cathay Pacific Cargo, Emirates SkyCargo, LATAM Cargo, ANA Cargo, Lufthansa Cargo</span></div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowAirlineTrack(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
