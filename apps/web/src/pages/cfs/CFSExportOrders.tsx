import { useState, useMemo } from 'react';

interface ExportOrder {
  id: string; orderNumber: string; mawb: string; hawb: string; airline: string; flightNumber: string;
  departureAirport: string; destinationAirport: string; departureDate: string; departureTime: string;
  cutoffTime: string; terminal: string; building: string;
  shipper: string; shipperCity: string; shipperState: string; consignee: string;
  pieces: number; weight: string; commodity: string; dims: string;
  status: 'BOOKING_CONFIRMED' | 'CARGO_RECEIVED' | 'TSA_SCREENING' | 'TSA_CLEARED' | 'CONSOLIDATED' | 'DISPATCHED_TO_TERMINAL' | 'AT_TERMINAL' | 'ACCEPTED_BY_AIRLINE' | 'DEPARTED';
  tsaStatus: 'NOT_SCREENED' | 'SCREENING' | 'CLEARED' | 'ALARM' | 'EXEMPT';
  screeningMethod: 'XRAY' | 'ETD' | 'PHYSICAL' | 'CANINE' | 'KNOWN_SHIPPER' | '';
  assignedDriver: string; assignedVehicle: string;
  hoursUntilCutoff: number; notes: string;
}

const MOCK_EXPORTS: ExportOrder[] = [
  { id: 'exp1', orderNumber: 'JFK-EXP-0501', mawb: '180-44210501', hawb: 'GE-E-20260414-001', airline: 'Korean Air', flightNumber: 'KE 081', departureAirport: 'JFK', destinationAirport: 'ICN', departureDate: '2026-04-15', departureTime: '01:30', cutoffTime: '2026-04-14T18:00:00Z', terminal: 'Terminal 1', building: 'Bldg 75', shipper: 'US Tech Export Corp', shipperCity: 'Newark', shipperState: 'NJ', consignee: 'Seoul Electronics Ltd', pieces: 8, weight: '1,600 kg', commodity: 'Server Equipment', dims: '120x80x100 cm', status: 'TSA_CLEARED', tsaStatus: 'CLEARED', screeningMethod: 'XRAY', assignedDriver: 'Marcus Johnson', assignedVehicle: 'T-1042', hoursUntilCutoff: 4, notes: 'High value — requires airline acceptance signature' },
  { id: 'exp2', orderNumber: 'JFK-EXP-0502', mawb: '176-88100502', hawb: 'GE-E-20260414-002', airline: 'Cathay Pacific', flightNumber: 'CX 841', departureAirport: 'JFK', destinationAirport: 'HKG', departureDate: '2026-04-15', departureTime: '02:15', cutoffTime: '2026-04-14T19:00:00Z', terminal: 'Terminal 1', building: 'Bldg 151', shipper: 'NY Fashion Export LLC', shipperCity: 'New York', shipperState: 'NY', consignee: 'HK Garment Import Co.', pieces: 32, weight: '4,200 kg', commodity: 'Textile / Fashion', dims: '80x60x80 cm', status: 'CONSOLIDATED', tsaStatus: 'CLEARED', screeningMethod: 'ETD', assignedDriver: '', assignedVehicle: '', hoursUntilCutoff: 5, notes: 'Consolidation of 4 shippers into 1 MAWB' },
  { id: 'exp3', orderNumber: 'JFK-EXP-0503', mawb: '131-22100503', hawb: 'GE-E-20260414-003', airline: 'Emirates', flightNumber: 'EK 203', departureAirport: 'JFK', destinationAirport: 'DXB', departureDate: '2026-04-14', departureTime: '23:45', cutoffTime: '2026-04-14T16:00:00Z', terminal: 'Terminal 4', building: 'Bldg 22', shipper: 'American Auto Parts Inc.', shipperCity: 'Edison', shipperState: 'NJ', consignee: 'Gulf Auto Trading LLC', pieces: 20, weight: '3,800 kg', commodity: 'Auto Parts', dims: '100x80x60 cm', status: 'TSA_SCREENING', tsaStatus: 'SCREENING', screeningMethod: 'XRAY', assignedDriver: '', assignedVehicle: '', hoursUntilCutoff: 2, notes: 'URGENT — cutoff in 2 hours' },
  { id: 'exp4', orderNumber: 'ORD-EXP-0220', mawb: '618-55100504', hawb: 'GE-E-20260414-004', airline: 'ANA', flightNumber: 'NH 111', departureAirport: 'ORD', destinationAirport: 'NRT', departureDate: '2026-04-15', departureTime: '11:30', cutoffTime: '2026-04-15T04:00:00Z', terminal: 'Terminal 5', building: 'Cargo Area F', shipper: 'Midwest Machinery Inc.', shipperCity: 'Chicago', shipperState: 'IL', consignee: 'Tokyo Industrial Corp', pieces: 4, weight: '2,800 kg', commodity: 'Industrial Equipment — Heavy', dims: '200x150x130 cm', status: 'CARGO_RECEIVED', tsaStatus: 'NOT_SCREENED', screeningMethod: '', assignedDriver: '', assignedVehicle: '', hoursUntilCutoff: 14, notes: 'Oversize — requires special cargo acceptance' },
  { id: 'exp5', orderNumber: 'MIA-EXP-0180', mawb: '235-77100505', hawb: 'GE-E-20260414-005', airline: 'LATAM', flightNumber: 'LA 501', departureAirport: 'MIA', destinationAirport: 'GRU', departureDate: '2026-04-14', departureTime: '22:00', cutoffTime: '2026-04-14T15:00:00Z', terminal: 'Terminal N', building: 'MIA Cargo', shipper: 'US Pharma Export', shipperCity: 'Tampa', shipperState: 'FL', consignee: 'Brasil Farma Distribution', pieces: 10, weight: '680 kg', commodity: 'Pharmaceutical — Cold Chain', dims: '60x40x40 cm', status: 'DISPATCHED_TO_TERMINAL', tsaStatus: 'CLEARED', screeningMethod: 'KNOWN_SHIPPER', assignedDriver: 'Robert Brown', assignedVehicle: 'T-1070', hoursUntilCutoff: 1, notes: 'CRITICAL — temp controlled 2-8°C, driver en route to MIA' },
  { id: 'exp6', orderNumber: 'JFK-EXP-0498', mawb: '074-33100506', hawb: 'GE-E-20260413-006', airline: 'KLM', flightNumber: 'KL 643', departureAirport: 'JFK', destinationAirport: 'AMS', departureDate: '2026-04-13', departureTime: '20:30', cutoffTime: '2026-04-13T14:00:00Z', terminal: 'Terminal 4', building: 'Bldg 22', shipper: 'East Coast Chemical', shipperCity: 'Philadelphia', shipperState: 'PA', consignee: 'Amsterdam Chemical BV', pieces: 6, weight: '1,200 kg', commodity: 'DG — Chemical Samples', dims: '60x40x50 cm', status: 'DEPARTED', tsaStatus: 'CLEARED', screeningMethod: 'PHYSICAL', assignedDriver: 'David Kim', assignedVehicle: 'T-1029', hoursUntilCutoff: 0, notes: 'DG Class 8 — corrosive. Departed on KL 643.' },
  { id: 'exp7', orderNumber: 'ATL-EXP-0095', mawb: '057-11100507', hawb: 'GE-E-20260414-007', airline: 'Delta Cargo', flightNumber: 'DL 201', departureAirport: 'ATL', destinationAirport: 'LHR', departureDate: '2026-04-15', departureTime: '18:00', cutoffTime: '2026-04-15T10:00:00Z', terminal: 'Cargo Complex', building: 'ATL Cargo Bldg', shipper: 'Georgia Peach Farms', shipperCity: 'Atlanta', shipperState: 'GA', consignee: 'London Fresh Markets PLC', pieces: 50, weight: '5,200 kg', commodity: 'Perishable — Fresh Produce', dims: '100x80x60 cm', status: 'BOOKING_CONFIRMED', tsaStatus: 'NOT_SCREENED', screeningMethod: '', assignedDriver: '', assignedVehicle: '', hoursUntilCutoff: 20, notes: 'Perishable — temp 34°F. Pickup from farm scheduled 4/15 6 AM.' },
];

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  BOOKING_CONFIRMED: { label: 'Booking Confirmed', color: 'bg-gray-100 text-gray-700' },
  CARGO_RECEIVED: { label: 'Cargo Received', color: 'bg-indigo-100 text-indigo-800' },
  TSA_SCREENING: { label: 'TSA Screening', color: 'bg-yellow-100 text-yellow-800' },
  TSA_CLEARED: { label: 'TSA Cleared', color: 'bg-green-100 text-green-800' },
  CONSOLIDATED: { label: 'Consolidated', color: 'bg-purple-100 text-purple-800' },
  DISPATCHED_TO_TERMINAL: { label: 'En Route to Terminal', color: 'bg-blue-100 text-blue-800' },
  AT_TERMINAL: { label: 'At Terminal', color: 'bg-orange-100 text-orange-800' },
  ACCEPTED_BY_AIRLINE: { label: 'Accepted by Airline', color: 'bg-teal-100 text-teal-800' },
  DEPARTED: { label: 'Departed', color: 'bg-green-100 text-green-800' },
};

const TSA_BADGE: Record<string, { label: string; color: string }> = {
  NOT_SCREENED: { label: 'Not Screened', color: 'bg-gray-100 text-gray-600' },
  SCREENING: { label: 'In Screening', color: 'bg-yellow-100 text-yellow-800' },
  CLEARED: { label: 'Cleared', color: 'bg-green-100 text-green-800' },
  ALARM: { label: 'Alarm', color: 'bg-red-100 text-red-800' },
  EXEMPT: { label: 'Exempt (Known Shipper)', color: 'bg-blue-100 text-blue-800' },
};

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; }

export function CFSExportOrders() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);

  const toggleSelect = (id: string) => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleAll = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id)));
  const selectedOrders = MOCK_EXPORTS.filter(o => selectedIds.has(o.id));
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showKSP, setShowKSP] = useState(false);
  const [parsedMAWB, setParsedMAWB] = useState<any>(null);
  const [parsing, setParsing] = useState(false);

  const handleMAWBUpload = () => {
    setParsing(true);
    setTimeout(() => {
      setParsedMAWB({
        awbNumber: '125-19994715',
        awbPrefix: '125',
        shipper: { name: 'FISCAL IOR USA INC', address: '200 S BISCAYNE BLVD 6TH FL', city: 'Miami', state: 'FL', zip: '33131-5351', country: 'US' },
        consignee: { name: 'PRO CARRIER LTD', address: 'THURROCK PARK WAY, PORTCENTRIC HOUSE', city: 'Tilbury', state: 'ESS RM187HD', country: 'UNITED KINGDOM', countryCode: 'GB' },
        issuingCarrier: 'BRITISH AIRWAYS PLC',
        issuingCarrierCode: 'BA',
        agent: 'ACCELERATED GLOBAL SOLUTIONS INC',
        agentLocation: 'JOHN F. KENNEDY APT/NEW YORK',
        agentIATA: '01-1 0631/0004',
        departureAirport: 'JFK',
        departureAirportFull: 'JOHN F. KENNEDY APT/NEW YORK',
        destinationAirport: 'LHR',
        destinationAirportFull: 'HEATHROW APT/LONDON',
        flightNumber: 'BA 0182/03',
        referenceNumber: 'C00080228',
        currency: 'USD',
        freightPayment: 'PREPAID',
        pieces: 5,
        grossWeight: '853.0 kg',
        rateClass: 'Q',
        chargeableWeight: '853.0',
        rate: 5.85,
        totalCharge: 4990.05,
        commodity: 'CLOTHING ACCESSORIES, FOOTWEAR',
        noeei: 'NOEEI §30.37(a)',
        slac: 1135,
        handlingInfo: 'THESE COMMODITIES, TECHNOLOGY OR SOFTWARE WERE EXPORTED FROM THE UNITED STATES IN ACCORDANCE WITH THE EXPORT ADMINISTRATION REGULATIONS.',
        shipperAgent: 'KYLE WENG',
        issuingAgent: 'ACCELERATED GLOBAL SOLUTIONS INC',
        issuingPlace: 'NEW HYDE PARK',
        executedDate: '02-Jan-26',
        totalPrepaid: 4990.05,
        sci: '',
      });
      setParsing(false);
    }, 1800);
  };

  const filtered = useMemo(() => MOCK_EXPORTS.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return o.orderNumber.toLowerCase().includes(q) || o.mawb.toLowerCase().includes(q) || o.airline.toLowerCase().includes(q) || o.consignee.toLowerCase().includes(q); }
    return true;
  }), [statusFilter, searchQuery]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Export Orders — Terminal Delivery</h2>
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search MAWB, airline, consignee..." className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => setShowKSP(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">🔒 KSP Management</button>
          <button onClick={() => { setShowUploadZone(true); setParsedMAWB(null); }} className="px-4 py-1.5 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">📄 Upload MAWB</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700">+ New Export</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Orders</p><p className="text-xl font-bold text-gray-900">{MOCK_EXPORTS.length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Awaiting TSA</p><p className="text-xl font-bold text-yellow-600">{MOCK_EXPORTS.filter(o => ['CARGO_RECEIVED', 'TSA_SCREENING'].includes(o.status)).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">TSA Cleared</p><p className="text-xl font-bold text-green-600">{MOCK_EXPORTS.filter(o => o.tsaStatus === 'CLEARED').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Cutoff &lt; 4hrs</p><p className={`text-xl font-bold ${MOCK_EXPORTS.filter(o => o.hoursUntilCutoff > 0 && o.hoursUntilCutoff <= 4 && o.status !== 'DEPARTED').length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{MOCK_EXPORTS.filter(o => o.hoursUntilCutoff > 0 && o.hoursUntilCutoff <= 4 && o.status !== 'DEPARTED').length}</p><p className="text-xs text-red-500 mt-1">Time critical</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">En Route</p><p className="text-xl font-bold text-blue-600">{MOCK_EXPORTS.filter(o => o.status === 'DISPATCHED_TO_TERMINAL').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Departed</p><p className="text-xl font-bold text-green-600">{MOCK_EXPORTS.filter(o => o.status === 'DEPARTED').length}</p></div>
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        {['All', 'BOOKING_CONFIRMED', 'CARGO_RECEIVED', 'TSA_SCREENING', 'TSA_CLEARED', 'CONSOLIDATED', 'DISPATCHED_TO_TERMINAL', 'DEPARTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 text-xs rounded font-medium ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : STATUS_BADGE[s]?.label || s}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded text-orange-600" /></th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Order #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airline / Flight</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Destination</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Shipper</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Commodity</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Pcs / Wt</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">TSA</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Cutoff</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedIds.has(o.id) ? 'bg-orange-50' : o.hoursUntilCutoff <= 2 && o.hoursUntilCutoff > 0 && o.status !== 'DEPARTED' ? 'bg-red-50 border-l-4 border-l-red-400' : o.hoursUntilCutoff <= 4 && o.hoursUntilCutoff > 0 && o.status !== 'DEPARTED' ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`} onClick={() => setSelectedOrder(o)}>
                  <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(o.id); }}><input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => {}} className="rounded text-orange-600" /></td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-700">{o.mawb}</td>
                  <td className="px-3 py-2.5"><span className="text-gray-800">{o.airline}</span><br/><span className="text-gray-400">{o.flightNumber}</span></td>
                  <td className="px-3 py-2.5 text-gray-700">{o.departureAirport}→{o.destinationAirport}</td>
                  <td className="px-3 py-2.5 text-gray-700">{o.shipper}<br/><span className="text-gray-400">{o.shipperCity}, {o.shipperState}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{o.commodity}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{o.pieces} pcs<br/><span className="text-gray-400">{o.weight}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${TSA_BADGE[o.tsaStatus].color}`}>{TSA_BADGE[o.tsaStatus].label}</span></td>
                  <td className="px-3 py-2.5">{o.hoursUntilCutoff > 0 ? <span className={`text-xs font-bold ${o.hoursUntilCutoff <= 2 ? 'text-red-600' : o.hoursUntilCutoff <= 4 ? 'text-yellow-600' : 'text-gray-600'}`}>{o.hoursUntilCutoff}h</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[o.status].color}`}>{STATUS_BADGE[o.status].label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MAWB Upload Modal ──────────────────────────── */}
      {showUploadZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowUploadZone(false); setParsedMAWB(null); }}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Upload Air Waybill (MAWB) — Auto-Create Export Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload an Air Waybill to auto-populate export shipment data</p>
            </div>

            {!parsedMAWB && !parsing && (
              <div className="px-6 py-6">
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleMAWBUpload(); }}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'}`}
                  onClick={handleMAWBUpload}
                >
                  <p className="text-4xl mb-3">✈️</p>
                  <p className="text-lg font-semibold text-gray-800">Drop Air Waybill (MAWB) file here or click to browse</p>
                  <p className="text-sm text-gray-500 mt-2">PDF, TIF, JPG, or scanned image — we'll auto-extract all fields</p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Air Waybill</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">MAWB</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">HAWB</span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Shipper's Letter</span>
                  </div>
                </div>
              </div>
            )}

            {parsing && (
              <div className="px-6 py-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-gray-800">Parsing Air Waybill...</p>
                <p className="text-xs text-gray-400 mt-1">Extracting shipper, consignee, flight, cargo, and charge data</p>
              </div>
            )}

            {parsedMAWB && (
              <div className="px-6 py-4 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div><p className="text-sm font-bold text-green-800">Air Waybill Parsed Successfully</p><p className="text-xs text-green-600">All fields extracted — review and confirm to create export order</p></div>
                </div>

                {/* AWB Header */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wide">Air Waybill — Not Negotiable</h4>
                    <span className="text-xs text-gray-500">Original 2 (for Consignee)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-0.5">AWB Number</label><input type="text" defaultValue={parsedMAWB.awbNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono font-bold bg-white" /></div>
                    <div><label className="block text-xs text-gray-400 mb-0.5">Issuing Carrier</label><input type="text" defaultValue={parsedMAWB.issuingCarrier} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  </div>
                </div>

                {/* Shipper & Consignee */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-2">Shipper</p>
                    <div className="space-y-1.5">
                      <div><label className="block text-xs text-gray-400">Name</label><input type="text" defaultValue={parsedMAWB.shipper.name} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      <div><label className="block text-xs text-gray-400">Address</label><input type="text" defaultValue={parsedMAWB.shipper.address} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      <div className="grid grid-cols-3 gap-1">
                        <div><label className="block text-xs text-gray-400">City</label><input type="text" defaultValue={parsedMAWB.shipper.city} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                        <div><label className="block text-xs text-gray-400">State</label><input type="text" defaultValue={parsedMAWB.shipper.state} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                        <div><label className="block text-xs text-gray-400">Country</label><input type="text" defaultValue={parsedMAWB.shipper.country} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-2">Consignee</p>
                    <div className="space-y-1.5">
                      <div><label className="block text-xs text-gray-400">Name</label><input type="text" defaultValue={parsedMAWB.consignee.name} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      <div><label className="block text-xs text-gray-400">Address</label><input type="text" defaultValue={parsedMAWB.consignee.address} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      <div className="grid grid-cols-3 gap-1">
                        <div><label className="block text-xs text-gray-400">City</label><input type="text" defaultValue={parsedMAWB.consignee.city} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                        <div><label className="block text-xs text-gray-400">State</label><input type="text" defaultValue={parsedMAWB.consignee.state} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                        <div><label className="block text-xs text-gray-400">Country</label><input type="text" defaultValue={parsedMAWB.consignee.countryCode} className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent & Routing */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Issuing Agent</label><input type="text" defaultValue={parsedMAWB.agent} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Agent IATA Code</label><input type="text" defaultValue={parsedMAWB.agentIATA} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-white" /></div>
                </div>

                {/* Flight & Route */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200"><p className="text-xs text-blue-600 font-semibold mb-1">DEPARTURE</p><p className="text-sm font-bold text-gray-900">{parsedMAWB.departureAirportFull}</p><p className="text-xs text-gray-500 mt-0.5">{parsedMAWB.departureAirport}</p></div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200"><p className="text-xs text-green-600 font-semibold mb-1">DESTINATION</p><p className="text-sm font-bold text-gray-900">{parsedMAWB.destinationAirportFull}</p><p className="text-xs text-gray-500 mt-0.5">{parsedMAWB.destinationAirport}</p></div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Flight #</label><input type="text" defaultValue={parsedMAWB.flightNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Reference #</label><input type="text" defaultValue={parsedMAWB.referenceNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Executed Date</label><input type="text" defaultValue={parsedMAWB.executedDate} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Freight Payment</label><input type="text" defaultValue={parsedMAWB.freightPayment} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white font-semibold" /></div>
                </div>

                {/* Cargo & Charges */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="text-xs font-bold text-orange-700 mb-3">Cargo & Charges (extracted)</h4>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-gray-900">{parsedMAWB.pieces}</p><p className="text-xs text-gray-500">Pieces</p></div>
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-gray-900">{parsedMAWB.grossWeight}</p><p className="text-xs text-gray-500">Gross Wt</p></div>
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-gray-900">{parsedMAWB.rateClass}</p><p className="text-xs text-gray-500">Class</p></div>
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-gray-900">${parsedMAWB.rate}</p><p className="text-xs text-gray-500">Rate</p></div>
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-green-600">${parsedMAWB.totalCharge.toLocaleString()}</p><p className="text-xs text-gray-500">Total</p></div>
                    <div className="bg-white rounded-lg p-2 text-center border border-orange-200"><p className="text-lg font-bold text-gray-900">{parsedMAWB.slac}</p><p className="text-xs text-gray-500">SLAC</p></div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div><label className="block text-xs text-gray-400 mb-0.5">Commodity Description</label><input type="text" defaultValue={parsedMAWB.commodity} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                    <div><label className="block text-xs text-gray-400 mb-0.5">NOEEI / EEI</label><input type="text" defaultValue={parsedMAWB.noeei} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  </div>
                </div>

                {/* Handling & Compliance */}
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-xs font-bold text-yellow-800 mb-1">Handling / Export Compliance</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{parsedMAWB.handlingInfo}</p>
                </div>

                {/* Shipper Agent */}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-0.5">Shipper's Agent</label><input type="text" defaultValue={parsedMAWB.shipperAgent} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Issuing Carrier Agent</label><input type="text" defaultValue={parsedMAWB.issuingAgent} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  <div><label className="block text-xs text-gray-400 mb-0.5">Issuing Place</label><input type="text" defaultValue={parsedMAWB.issuingPlace} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                </div>

                {/* Auto-create options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-orange-600" /> Auto-generate export order number (JFK-EXP-XXXX)</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-orange-600" /> Auto-calculate flight cutoff time (4 hours before departure)</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-orange-600" /> Initiate TSA screening process</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-orange-600" /> Sync to CargoWise after creation</label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setShowUploadZone(false); setParsedMAWB(null); }} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              {parsedMAWB && (
                <div className="flex gap-2">
                  <button onClick={() => setParsedMAWB(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Upload Different File</button>
                  <button onClick={() => { setShowUploadZone(false); setParsedMAWB(null); }} className="px-6 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">✓ Create Export Order</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-3 bg-orange-600 text-white rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected</span>
            <span className="text-xs text-orange-200">{selectedOrders.reduce((s, o) => s + o.pieces, 0)} total pieces · {selectedOrders.map(o => o.departureAirport).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAssignModal(true)} className="px-4 py-1.5 text-sm font-semibold bg-white text-orange-700 rounded-lg hover:bg-orange-50">🚛 Assign Driver & Truck</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-sm text-orange-200 hover:text-white">Clear</button>
          </div>
        </div>
      )}

      {/* Export Delivery Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Assign Export Delivery Trip</h2>
              <p className="text-xs text-gray-400 mt-0.5">Combine {selectedIds.size} MAWB{selectedIds.size > 1 ? 's' : ''} for terminal delivery</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Selected Orders Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Cargo to Deliver to Terminal</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-100"><th className="text-left px-3 py-2 text-gray-500">MAWB</th><th className="text-left px-3 py-2 text-gray-500">Airline</th><th className="text-left px-3 py-2 text-gray-500">Terminal</th><th className="text-left px-3 py-2 text-gray-500">Cutoff</th><th className="text-right px-3 py-2 text-gray-500">Pcs</th><th className="text-right px-3 py-2 text-gray-500">Weight</th><th className="w-6 px-2"></th></tr></thead>
                    <tbody>{selectedOrders.map(o => (
                      <tr key={o.id} className={`border-t border-gray-200 ${o.hoursUntilCutoff <= 2 && o.hoursUntilCutoff > 0 ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 font-mono font-medium text-gray-900">{o.mawb}</td>
                        <td className="px-3 py-2 text-gray-700">{o.airline} {o.flightNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{o.departureAirport} {o.building}</td>
                        <td className="px-3 py-2"><span className={`font-bold ${o.hoursUntilCutoff <= 2 ? 'text-red-600' : o.hoursUntilCutoff <= 4 ? 'text-yellow-600' : 'text-gray-600'}`}>{o.hoursUntilCutoff > 0 ? `${o.hoursUntilCutoff}h` : '—'}</span></td>
                        <td className="px-3 py-2 text-right text-gray-800">{o.pieces}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{o.weight}</td>
                        <td className="px-2"><button onClick={() => toggleSelect(o.id)} className="text-gray-400 hover:text-red-500">✕</button></td>
                      </tr>
                    ))}</tbody>
                    <tfoot><tr className="border-t border-gray-300 bg-gray-100 font-semibold">
                      <td className="px-3 py-2 text-gray-700" colSpan={4}>Total</td>
                      <td className="px-3 py-2 text-right text-gray-900">{selectedOrders.reduce((s, o) => s + o.pieces, 0)}</td>
                      <td className="px-3 py-2 text-right text-gray-900" colSpan={2}>{selectedOrders.length} MAWB{selectedOrders.length > 1 ? 's' : ''}</td>
                    </tr></tfoot>
                  </table>
                </div>
                {selectedOrders.some(o => o.hoursUntilCutoff > 0 && o.hoursUntilCutoff <= 3) && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5"><p className="text-xs font-bold text-red-800">⚠ Time-critical shipments included — earliest cutoff in {Math.min(...selectedOrders.filter(o => o.hoursUntilCutoff > 0).map(o => o.hoursUntilCutoff))} hours</p></div>
                )}
              </div>

              {/* Driver & Vehicle */}
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
                      <input type="radio" name="export_truck_type" className="text-orange-600" />
                      <div><span className="text-sm">{t.icon}</span> <span className="text-xs font-medium text-gray-800">{t.type}</span><p className="text-xs text-gray-400">{t.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label><input type="date" defaultValue="2026-04-14" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label><input type="time" defaultValue="13:00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>

              {/* Delivery stop sequence */}
              {selectedOrders.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terminal Drop-off Sequence</label>
                  <p className="text-xs text-gray-400 mb-2">Drag to reorder. Driver delivers in this sequence. Prioritize earliest cutoffs.</p>
                  <div className="space-y-1.5">
                    {[...selectedOrders].sort((a, b) => (a.hoursUntilCutoff || 999) - (b.hoursUntilCutoff || 999)).map((o, i) => (
                      <div key={o.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg border ${o.hoursUntilCutoff <= 2 && o.hoursUntilCutoff > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                        <div className="flex-1"><span className="text-xs font-semibold text-gray-800">{o.departureAirport} — {o.building}</span><br/><span className="text-xs text-gray-400">{o.mawb} · {o.airline} {o.flightNumber} · Cutoff: {o.hoursUntilCutoff > 0 ? `${o.hoursUntilCutoff}h` : '—'}</span></div>
                        <span className="text-gray-300 text-sm cursor-grab">☰</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Special delivery instructions, TSA requirements..." /></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={() => { setShowAssignModal(false); setSelectedIds(new Set()); }} className="px-6 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">Assign Trip ({selectedIds.size} MAWB{selectedIds.size > 1 ? 's' : ''})</button>
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
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedOrder.status].color}`}>{STATUS_BADGE[selectedOrder.status].label}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TSA_BADGE[selectedOrder.tsaStatus].color}`}>{TSA_BADGE[selectedOrder.tsaStatus].label}</span></div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Cutoff Warning */}
              {selectedOrder.hoursUntilCutoff > 0 && selectedOrder.hoursUntilCutoff <= 4 && selectedOrder.status !== 'DEPARTED' && (
                <div className={`rounded-lg p-3 ${selectedOrder.hoursUntilCutoff <= 2 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-sm font-bold ${selectedOrder.hoursUntilCutoff <= 2 ? 'text-red-800' : 'text-yellow-800'}`}>⚠ Flight Cutoff in {selectedOrder.hoursUntilCutoff} hours</p>
                  <p className="text-xs text-gray-600 mt-0.5">Cargo must be at terminal by cutoff time for flight acceptance</p>
                </div>
              )}
              <div className="bg-orange-50 rounded-lg p-3"><p className="text-xs text-orange-600 font-semibold mb-1">Airway Bills</p><div className="flex justify-between text-xs"><span className="text-gray-500">MAWB</span><span className="font-mono font-bold text-gray-900">{selectedOrder.mawb}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-gray-500">HAWB</span><span className="font-mono font-bold text-gray-900">{selectedOrder.hawb}</span></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Airline / Flight</p><p className="text-sm font-semibold">{selectedOrder.airline} — {selectedOrder.flightNumber}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Route</p><p className="text-sm font-semibold">{selectedOrder.departureAirport} → {selectedOrder.destinationAirport}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Departure</p><p className="text-sm font-semibold">{fmtDate(selectedOrder.departureDate)} {selectedOrder.departureTime}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Terminal / Bldg</p><p className="text-sm font-semibold">{selectedOrder.terminal} — {selectedOrder.building}</p></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">TSA Screening</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs"><div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full font-medium ${TSA_BADGE[selectedOrder.tsaStatus].color}`}>{TSA_BADGE[selectedOrder.tsaStatus].label}</span></div>{selectedOrder.screeningMethod && <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="text-gray-800">{selectedOrder.screeningMethod === 'KNOWN_SHIPPER' ? 'Known Shipper (Exempt)' : selectedOrder.screeningMethod}</span></div>}</div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Cargo</h4><div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Commodity</span><span className="text-gray-800">{selectedOrder.commodity}</span></div><div className="flex justify-between"><span className="text-gray-500">Pieces</span><span className="text-gray-800">{selectedOrder.pieces}</span></div><div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="text-gray-800">{selectedOrder.weight}</span></div><div className="flex justify-between"><span className="text-gray-500">Dims</span><span className="text-gray-800">{selectedOrder.dims}</span></div></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Shipper / Consignee</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs"><div><span className="text-gray-400">Shipper:</span> <span className="font-medium">{selectedOrder.shipper}</span> <span className="text-gray-400">({selectedOrder.shipperCity}, {selectedOrder.shipperState})</span></div><div><span className="text-gray-400">Consignee:</span> <span className="font-medium">{selectedOrder.consignee}</span></div></div></div>
              {selectedOrder.assignedDriver && <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Dispatch</h4><div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1"><div className="flex justify-between"><span className="text-gray-500">Driver</span><span className="font-medium">{selectedOrder.assignedDriver}</span></div><div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-medium">{selectedOrder.assignedVehicle}</span></div></div></div>}
              {selectedOrder.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedOrder.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedOrder.status === 'TSA_CLEARED' && <button className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700">Dispatch to Terminal</button>}
              {selectedOrder.tsaStatus === 'NOT_SCREENED' && <button className="flex-1 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700">Start TSA Screening</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Known Shipper Program Modal */}
      {showKSP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowKSP(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">🔒 Known Shipper Program (KSP) / TSA CCSP</h2><p className="text-xs text-gray-400 mt-0.5">TSA Certified Cargo Screening Program compliance management</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-xs text-gray-400">KSP Approved</p><p className="text-xl font-bold text-green-600">12</p></div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs text-gray-400">Pending Approval</p><p className="text-xl font-bold text-yellow-600">3</p></div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-xs text-gray-400">Expired / Revoked</p><p className="text-xl font-bold text-red-600">1</p></div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-xs font-bold text-blue-800 mb-1">Gemini Express — CCSP Certification</p><p className="text-xs text-blue-600">IAC # GEX-12345 · Certification Expiry: Dec 31, 2026 · TSA Region: Northeast</p></div>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Shipper</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">KSP ID</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Screening</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Approved</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Expiry</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              </tr></thead><tbody>
                {[
                  { shipper: 'Samsung Electronics', kspId: 'KSP-2024-001', screening: 'ETD + Physical', approved: 'Jan 15, 2024', expiry: 'Jan 15, 2027', status: 'APPROVED' },
                  { shipper: 'Global Textile Co.', kspId: 'KSP-2024-003', screening: 'ETD + X-Ray', approved: 'Mar 1, 2024', expiry: 'Mar 1, 2027', status: 'APPROVED' },
                  { shipper: 'Arabian Fresh Foods', kspId: 'KSP-2025-008', screening: 'Physical Only', approved: 'Jun 1, 2025', expiry: 'Jun 1, 2028', status: 'APPROVED' },
                  { shipper: 'Bangladesh RMG Export', kspId: 'KSP-2025-012', screening: 'ETD + X-Ray', approved: 'Sep 1, 2025', expiry: 'Sep 1, 2028', status: 'APPROVED' },
                  { shipper: 'NewTech Solutions', kspId: '', screening: 'Pending', approved: '', expiry: '', status: 'PENDING' },
                  { shipper: 'QuickShip Imports', kspId: '', screening: 'Pending', approved: '', expiry: '', status: 'PENDING' },
                  { shipper: 'Sunset Trading Co.', kspId: 'KSP-2022-005', screening: 'ETD', approved: 'Apr 1, 2022', expiry: 'Apr 1, 2025', status: 'EXPIRED' },
                ].map((s, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${s.status === 'EXPIRED' ? 'bg-red-50' : s.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{s.shipper}</td>
                    <td className="px-3 py-2.5 font-mono text-gray-600">{s.kspId || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600">{s.screening}</td>
                    <td className="px-3 py-2.5 text-gray-500">{s.approved || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-500">{s.expiry || '—'}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'APPROVED' ? 'bg-green-100 text-green-800' : s.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200"><button onClick={() => setShowKSP(false)} className="px-4 py-2 text-sm text-gray-600">Close</button><button className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">+ Add Known Shipper</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
