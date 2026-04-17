import { useState, useMemo } from 'react';

// ─ Types ─
type ReceivingTab = 'on_hand' | 'receive_new' | 'awb_matching' | 'reports' | 'damages';
type OnHandStatus = 'AWAITING_AWB' | 'LINKED' | 'RELEASED_TO_EXPORT' | 'ON_HOLD';
type CargoCondition = 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE' | 'WET' | 'REPACKED';

interface OnHandPiece {
  id: string;
  receivingNumber: string; // RCV-2026-XXXX
  receivedDate: string;
  receivedTime: string;
  clientName: string;
  clientCwOrg: string;
  clientReference: string; // PO, shipper ref, etc
  commodity: string;
  pieces: number;
  weight: number; // in kg
  weightLb: number;
  dimensions: { length: number; width: number; height: number; unit: 'IN' | 'CM' }[];
  chargableWeight: number;
  volumeWeight: number;
  cbm: number;
  stackable: boolean;
  dangerous: boolean;
  specialHandling: string[];
  condition: CargoCondition;
  damageNotes: string;
  photos: string[];
  linkedAWB: string | null;
  linkedExportOrder: string | null;
  destinationAirport: string | null;
  status: OnHandStatus;
  storageLocation: string; // Zone-Rack-Bin
  storageDays: number;
  receivedBy: string;
  notes: string;
  reportSentToClient: boolean;
  reportSentDate: string | null;
}

// ─ Mock Data ─
const MOCK_ON_HAND: OnHandPiece[] = [
  {
    id: 'oh1',
    receivingNumber: 'RCV-2026-1042',
    receivedDate: '2026-04-14',
    receivedTime: '10:30',
    clientName: 'Samsung Electronics America',
    clientCwOrg: 'SAMSUNG-US',
    clientReference: 'PO-SSE-88421',
    commodity: 'Electronic Components  Circuit Boards',
    pieces: 12,
    weight: 485,
    weightLb: 1069,
    dimensions: [
      { length: 48, width: 40, height: 32, unit: 'IN' },
      { length: 48, width: 40, height: 32, unit: 'IN' },
      { length: 48, width: 40, height: 32, unit: 'IN' },
    ],
    chargableWeight: 550,
    volumeWeight: 520,
    cbm: 3.12,
    stackable: true,
    dangerous: false,
    specialHandling: ['Fragile', 'Keep Dry'],
    condition: 'GOOD',
    damageNotes: '',
    photos: ['cargo_overview.jpg', 'label_close_up.jpg', 'pallet_side.jpg'],
    linkedAWB: '180-88421100',
    linkedExportOrder: 'JFK-EXP-2201',
    destinationAirport: 'ICN',
    status: 'LINKED',
    storageLocation: 'A-12-3',
    storageDays: 1,
    receivedBy: 'Tom Garcia',
    notes: 'Customer requested photo of each pallet before loading',
    reportSentToClient: true,
    reportSentDate: '2026-04-14T11:15:00Z',
  },
  {
    id: 'oh2',
    receivingNumber: 'RCV-2026-1043',
    receivedDate: '2026-04-14',
    receivedTime: '11:45',
    clientName: 'Global Auto Parts Inc',
    clientCwOrg: 'GLOBAL-AUTO',
    clientReference: 'GA-PO-55432',
    commodity: 'Auto Parts  Brake Components',
    pieces: 28,
    weight: 1240,
    weightLb: 2734,
    dimensions: [
      { length: 40, width: 48, height: 36, unit: 'IN' },
      { length: 40, width: 48, height: 36, unit: 'IN' },
    ],
    chargableWeight: 1340,
    volumeWeight: 1180,
    cbm: 7.08,
    stackable: false,
    dangerous: false,
    specialHandling: ['Heavy', 'Forklift Required'],
    condition: 'MINOR_DAMAGE',
    damageNotes: '2 cartons have corner scuffs, contents appear intact. Customer notified, awaiting response.',
    photos: ['damage_carton_1.jpg', 'damage_carton_2.jpg', 'overview.jpg'],
    linkedAWB: null,
    linkedExportOrder: null,
    destinationAirport: null,
    status: 'AWAITING_AWB',
    storageLocation: 'B-05-2',
    storageDays: 1,
    receivedBy: 'Tom Garcia',
    notes: 'Awaiting AWB and export booking from client',
    reportSentToClient: false,
    reportSentDate: null,
  },
  {
    id: 'oh3',
    receivingNumber: 'RCV-2026-1044',
    receivedDate: '2026-04-13',
    receivedTime: '14:20',
    clientName: 'Pharma Direct Distribution',
    clientCwOrg: 'PHARMA-DIR',
    clientReference: 'PD-RX-99102',
    commodity: 'Pharmaceutical  Cold Chain Required',
    pieces: 6,
    weight: 185,
    weightLb: 408,
    dimensions: [{ length: 32, width: 24, height: 20, unit: 'IN' }],
    chargableWeight: 200,
    volumeWeight: 175,
    cbm: 0.94,
    stackable: false,
    dangerous: false,
    specialHandling: ['Temperature Controlled', '2-8°C', 'Time Sensitive'],
    condition: 'GOOD',
    damageNotes: '',
    photos: ['temp_log.jpg', 'cargo.jpg'],
    linkedAWB: '176-55123400',
    linkedExportOrder: 'JFK-EXP-2198',
    destinationAirport: 'FRA',
    status: 'RELEASED_TO_EXPORT',
    storageLocation: 'COLD-03',
    storageDays: 2,
    receivedBy: 'Maria Santos',
    notes: 'Released to export team for build-up. Temp log attached.',
    reportSentToClient: true,
    reportSentDate: '2026-04-13T15:00:00Z',
  },
  {
    id: 'oh4',
    receivingNumber: 'RCV-2026-1045',
    receivedDate: '2026-04-14',
    receivedTime: '09:15',
    clientName: 'Textile Imports LLC',
    clientCwOrg: 'TEXTILE-IMP',
    clientReference: 'TI-2026-0412',
    commodity: 'Textiles  Cotton Fabric Rolls',
    pieces: 45,
    weight: 890,
    weightLb: 1962,
    dimensions: [{ length: 72, width: 12, height: 12, unit: 'IN' }],
    chargableWeight: 920,
    volumeWeight: 785,
    cbm: 4.71,
    stackable: true,
    dangerous: false,
    specialHandling: ['Keep Dry'],
    condition: 'WET',
    damageNotes: '8 rolls show water damage on outer layer. Photos taken. Customer notified urgently. Hold pending client instructions.',
    photos: ['water_damage_1.jpg', 'water_damage_2.jpg', 'affected_rolls.jpg', 'undamaged.jpg'],
    linkedAWB: null,
    linkedExportOrder: null,
    destinationAirport: null,
    status: 'ON_HOLD',
    storageLocation: 'HOLD-01',
    storageDays: 1,
    receivedBy: 'Tom Garcia',
    notes: 'HOLD  damage claim in progress with client',
    reportSentToClient: true,
    reportSentDate: '2026-04-14T09:45:00Z',
  },
  {
    id: 'oh5',
    receivingNumber: 'RCV-2026-1046',
    receivedDate: '2026-04-14',
    receivedTime: '13:00',
    clientName: 'Fiscal IOR USA',
    clientCwOrg: 'FISCALIOR',
    clientReference: 'FISC-EXP-7721',
    commodity: 'Machinery Parts  Industrial',
    pieces: 8,
    weight: 2100,
    weightLb: 4630,
    dimensions: [
      { length: 96, width: 48, height: 60, unit: 'IN' },
      { length: 48, width: 48, height: 48, unit: 'IN' },
    ],
    chargableWeight: 2280,
    volumeWeight: 2050,
    cbm: 12.30,
    stackable: false,
    dangerous: false,
    specialHandling: ['Heavy', 'Oversized', 'Crate Required'],
    condition: 'GOOD',
    damageNotes: '',
    photos: ['machinery_1.jpg', 'machinery_2.jpg'],
    linkedAWB: '160-22109800',
    linkedExportOrder: 'JFK-EXP-2205',
    destinationAirport: 'LHR',
    status: 'LINKED',
    storageLocation: 'HEAVY-02',
    storageDays: 1,
    receivedBy: 'Maria Santos',
    notes: '',
    reportSentToClient: true,
    reportSentDate: '2026-04-14T14:00:00Z',
  },
];

// ─ Badge Mappings ─
const STATUS_BADGE: Record<OnHandStatus, { label: string; color: string }> = {
  AWAITING_AWB: { label: 'Awaiting AWB', color: 'bg-yellow-100 text-yellow-800' },
  LINKED: { label: 'Linked to Export', color: 'bg-blue-100 text-blue-800' },
  RELEASED_TO_EXPORT: { label: 'Released', color: 'bg-green-100 text-green-800' },
  ON_HOLD: { label: 'On Hold', color: 'bg-red-100 text-red-800' },
};

const CONDITION_BADGE: Record<CargoCondition, { label: string; color: string; icon: string }> = {
  GOOD: { label: 'Good', color: 'bg-green-100 text-green-800', icon: '✓' },
  MINOR_DAMAGE: { label: 'Minor Damage', color: 'bg-yellow-100 text-yellow-800', icon: '⚠' },
  MAJOR_DAMAGE: { label: 'Major Damage', color: 'bg-red-100 text-red-800', icon: '⚠' },
  WET: { label: 'Wet/Water', color: 'bg-blue-100 text-blue-800', icon: 'ðŸ§' },
  REPACKED: { label: 'Repacked', color: 'bg-purple-100 text-purple-800', icon: 'ðŸ¦' },
};

const fmtWeight = (kg: number) => `${kg.toLocaleString()} kg`;
const fmtVolume = (cbm: number) => `${cbm.toFixed(2)} CBM`;

// ─ Component ─
export function CFSExportReceiving() {
  const [activeTab, setActiveTab] = useState<ReceivingTab>('on_hand');
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<OnHandPiece | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showLinkAWBModal, setShowLinkAWBModal] = useState(false);
  const [showSendReportModal, setShowSendReportModal] = useState(false);
  const [pieceToLink, setPieceToLink] = useState<OnHandPiece | null>(null);

  const clients = useMemo(() => {
    const set = new Set(MOCK_ON_HAND.map(p => p.clientName));
    return ['All', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ON_HAND.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (clientFilter !== 'All' && p.clientName !== clientFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.receivingNumber.toLowerCase().includes(q) ||
               p.clientName.toLowerCase().includes(q) ||
               p.clientReference.toLowerCase().includes(q) ||
               (p.linkedAWB?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [statusFilter, clientFilter, searchQuery]);

  // Summary metrics
  const metrics = useMemo(() => ({
    totalPieces: MOCK_ON_HAND.reduce((s, p) => s + p.pieces, 0),
    totalWeight: MOCK_ON_HAND.reduce((s, p) => s + p.weight, 0),
    totalCBM: MOCK_ON_HAND.reduce((s, p) => s + p.cbm, 0),
    awaitingAWB: MOCK_ON_HAND.filter(p => p.status === 'AWAITING_AWB').length,
    linked: MOCK_ON_HAND.filter(p => p.status === 'LINKED').length,
    onHold: MOCK_ON_HAND.filter(p => p.status === 'ON_HOLD').length,
    damaged: MOCK_ON_HAND.filter(p => p.condition !== 'GOOD').length,
  }), []);

  return (
    <div>
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Export Warehouse  On-Hand Receiving</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track incoming export cargo, record dims/weight/damages, link to AWB</p>
        </div>
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search RCV#, client, AWB, reference..." className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-80" />
          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ Client Reports</button>
          <button onClick={() => setShowReceiveModal(true)} className="px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ Receive Cargo</button>
        </div>
      </div>

      {/* ─ KPI Cards ─ */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">On-Hand Shipments</p><p className="text-xl font-bold text-gray-900">{MOCK_ON_HAND.length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Pieces</p><p className="text-xl font-bold text-violet-600">{metrics.totalPieces}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Weight</p><p className="text-xl font-bold text-gray-900">{metrics.totalWeight.toLocaleString()}<span className="text-xs font-normal text-gray-400"> kg</span></p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Volume</p><p className="text-xl font-bold text-gray-900">{metrics.totalCBM.toFixed(1)}<span className="text-xs font-normal text-gray-400"> CBM</span></p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Awaiting AWB</p><p className={`text-xl font-bold ${metrics.awaitingAWB > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{metrics.awaitingAWB}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Linked</p><p className="text-xl font-bold text-blue-600">{metrics.linked}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Damage/Hold</p><p className={`text-xl font-bold ${metrics.damaged > 0 ? 'text-red-600' : 'text-gray-400'}`}>{metrics.damaged}</p></div>
      </div>

      {/* ─ Tabs ─ */}
      <div className="flex gap-1 mb-3 border-b border-gray-200">
        {[
          { id: 'on_hand' as ReceivingTab, label: 'On-Hand Inventory', count: MOCK_ON_HAND.length },
          { id: 'awb_matching' as ReceivingTab, label: 'AWB Matching', count: metrics.awaitingAWB },
          { id: 'damages' as ReceivingTab, label: 'Damage Reports', count: metrics.damaged },
          { id: 'reports' as ReceivingTab, label: 'Client Reports' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}{t.count !== undefined && <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ─ On-Hand Inventory Tab ─ */}
      {activeTab === 'on_hand' && (
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {['All', 'AWAITING_AWB', 'LINKED', 'RELEASED_TO_EXPORT', 'ON_HOLD'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 text-xs rounded font-medium ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'All' ? 'All' : STATUS_BADGE[s as OnHandStatus]?.label || s}
              </button>
            ))}
            <div className="mx-1 w-px bg-gray-300" />
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="px-2.5 py-1 text-xs border border-gray-300 rounded">
              {clients.map(c => <option key={c} value={c}>{c === 'All' ? 'All Clients' : c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">RCV #</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Received</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Client / Reference</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Commodity</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Pcs / Wt / CBM</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Condition</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">AWB / Export</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${p.status === 'ON_HOLD' ? 'bg-red-50' : p.condition !== 'GOOD' ? 'bg-yellow-50' : ''}`} onClick={() => setSelectedPiece(p)}>
                    <td className="px-3 py-2.5"><span className="font-mono text-blue-600 font-bold">{p.receivingNumber}</span></td>
                    <td className="px-3 py-2.5 text-gray-600">{p.receivedDate}<br/><span className="text-xs text-gray-400">{p.receivedTime}</span></td>
                    <td className="px-3 py-2.5"><div className="font-medium text-gray-900">{p.clientName}</div><div className="text-xs text-gray-400 font-mono">{p.clientReference}</div></td>
                    <td className="px-3 py-2.5 text-gray-700">{p.commodity}{p.specialHandling.length > 0 && <div className="flex gap-1 mt-1 flex-wrap">{p.specialHandling.slice(0, 2).map(h => <span key={h} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{h}</span>)}</div>}</td>
                    <td className="px-3 py-2.5 text-right"><div className="font-bold text-gray-900">{p.pieces} pcs</div><div className="text-xs text-gray-500">{p.weight} kg</div><div className="text-xs text-gray-400">{p.cbm.toFixed(2)} CBM</div></td>
                    <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${CONDITION_BADGE[p.condition].color}`}>{CONDITION_BADGE[p.condition].icon} {CONDITION_BADGE[p.condition].label}</span></td>
                    <td className="px-3 py-2.5">
                      {p.linkedAWB ? (
                        <div><div className="font-mono text-violet-600 text-xs">{p.linkedAWB}</div><div className="text-xs text-gray-500">{p.linkedExportOrder} → {p.destinationAirport}</div></div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setPieceToLink(p); setShowLinkAWBModal(true); }} className="text-xs text-blue-600 hover:underline font-medium">ðŸ Link AWB</button>
                      )}
                    </td>
                    <td className="px-3 py-2.5"><span className="font-mono text-gray-700 text-xs">{p.storageLocation}</span><div className="text-xs text-gray-400">Day {p.storageDays}</div></td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status].color}`}>{STATUS_BADGE[p.status].label}</span></td>
                    <td className="px-3 py-2.5">
                      {p.reportSentToClient ? (
                        <span className="text-xs text-green-600 font-medium">✓ Sent</span>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setPieceToLink(p); setShowSendReportModal(true); }} className="text-xs text-blue-600 hover:underline font-medium">ðŸ§ Send</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─ AWB Matching Tab ─ */}
      {activeTab === 'awb_matching' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-gray-900">Unmatched On-Hand  Awaiting AWB Assignment</h3><p className="text-xs text-gray-400 mt-0.5">Match on-hand cargo to export AWBs and bookings</p></div>
          </div>
          <div className="p-4 space-y-3">
            {MOCK_ON_HAND.filter(p => p.status === 'AWAITING_AWB' || p.status === 'ON_HOLD').map(p => (
              <div key={p.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><span className="font-mono text-blue-600 font-bold">{p.receivingNumber}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status].color}`}>{STATUS_BADGE[p.status].label}</span></div>
                    <p className="text-sm font-medium text-gray-900">{p.clientName}  {p.commodity}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Received {p.receivedDate} at {p.receivedTime} · Day {p.storageDays} of storage · Ref: {p.clientReference}</p>
                  </div>
                  <div className="text-right"><p className="text-lg font-bold text-gray-900">{p.pieces} pcs</p><p className="text-xs text-gray-500">{p.weight} kg · {p.cbm.toFixed(2)} CBM</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setPieceToLink(p); setShowLinkAWBModal(true); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">ðŸ Link to AWB & Export Order</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ§ Email Client for AWB</button>
                  <button onClick={() => setSelectedPiece(p)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:underline">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─ Damage Reports Tab ─ */}
      {activeTab === 'damages' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="text-sm font-bold text-gray-900">Cargo with Damages / Issues</h3></div>
          <div className="p-4 space-y-3">
            {MOCK_ON_HAND.filter(p => p.condition !== 'GOOD').map(p => (
              <div key={p.id} className={`rounded-lg border p-4 ${p.condition === 'WET' || p.condition === 'MAJOR_DAMAGE' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">{CONDITION_BADGE[p.condition].icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-mono text-blue-600 font-bold">{p.receivingNumber}</span><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${CONDITION_BADGE[p.condition].color}`}>{CONDITION_BADGE[p.condition].label}</span></div>
                    <p className="text-sm font-medium text-gray-900">{p.clientName}</p>
                    <p className="text-xs text-gray-600 mt-1">{p.damageNotes}</p>
                    <div className="flex gap-2 mt-2"><span className="text-xs text-gray-500">{p.pieces} pcs · {p.weight} kg</span><span className="text-xs text-gray-500">·</span><span className="text-xs text-gray-500">{p.photos.length} photos attached</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg">View Photos</button>
                    <button onClick={() => { setPieceToLink(p); setShowSendReportModal(true); }} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">ðŸ§ Send Report</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─ Client Reports Tab ─ */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Client On-Hand Reports  Sent & Pending</h3>
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg">+ Generate Batch Report</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date Sent</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Client</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Shipments</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Report Type</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Recipient</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Actions</th>
            </tr></thead>
            <tbody>
              {MOCK_ON_HAND.filter(p => p.reportSentToClient).map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-600">{p.reportSentDate ? new Date(p.reportSentDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{p.clientName}</td>
                  <td className="px-3 py-2.5"><span className="font-mono text-blue-600">{p.receivingNumber}</span>{p.linkedAWB && <><span className="text-gray-400 mx-1">·</span><span className="font-mono text-violet-600 text-xs">{p.linkedAWB}</span></>}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.condition === 'GOOD' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.condition === 'GOOD' ? 'On-Hand Receipt' : 'Damage Report'}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">ops@{p.clientCwOrg.toLowerCase()}.com</td>
                  <td className="px-3 py-2.5"><span className="text-xs text-green-600 font-medium">✓ Delivered</span></td>
                  <td className="px-3 py-2.5"><button className="text-xs text-blue-600 hover:underline">View</button><span className="mx-2 text-gray-300">·</span><button className="text-xs text-blue-600 hover:underline">Resend</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─ Receive New Cargo Modal ─ */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowReceiveModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ¦ Receive New Export Cargo  On-Hand Entry</h2><p className="text-xs text-gray-400 mt-0.5">Record incoming export cargo, weight, dimensions, and condition</p></div>
            <div className="px-6 py-4 space-y-4">
              {/* Client Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-blue-800 mb-2">Client Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Client / Shipper *</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Select client...</option><option>Samsung Electronics America</option><option>Global Auto Parts Inc</option><option>Pharma Direct Distribution</option><option>Textile Imports LLC</option><option>Fiscal IOR USA</option><option>+ New Client</option></select></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Client Reference / PO #</label><input type="text" placeholder="PO number, shipper ref" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
              </div>

              {/* Commodity & Piece Count */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Commodity Description *</label><input type="text" placeholder="e.g. Electronic Components  Circuit Boards" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Piece Count *</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold" /></div>
              </div>

              {/* Weight */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Weight</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Gross Weight (kg) *</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Gross Weight (lb)</label><input type="number" placeholder="Auto" disabled className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Volume Weight (kg)</label><input type="number" placeholder="Auto" disabled className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Chargeable Wt (kg)</label><input type="number" placeholder="Auto" disabled className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500" /></div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2"><h4 className="text-xs font-bold text-gray-700">Dimensions (per piece/pallet)</h4><button className="text-xs text-blue-600 hover:underline">+ Add Another</button></div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Length</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Width</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Height</label><input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Unit</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>IN</option><option>CM</option></select></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Qty at size</label><input type="number" placeholder="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-300"><div className="text-xs"><span className="text-gray-500">Total Volume:</span> <strong className="text-gray-900"> CBM</strong></div><div className="text-xs"><span className="text-gray-500">Volume Weight:</span> <strong className="text-gray-900"> kg</strong></div></div>
              </div>

              {/* Special Handling */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Special Handling</label>
                <div className="flex flex-wrap gap-2">
                  {['Fragile', 'Keep Dry', 'Heavy', 'Oversized', 'Temperature Controlled', 'Time Sensitive', 'Stackable', 'Hazmat / DG', 'Forklift Required', 'Crate Required'].map(h => (
                    <label key={h} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-blue-50 hover:border-blue-300">
                      <input type="checkbox" className="rounded text-blue-600" /><span className="text-xs text-gray-700">{h}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Assessment */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-yellow-800 mb-2">Condition Assessment</h4>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {(Object.entries(CONDITION_BADGE) as [CargoCondition, typeof CONDITION_BADGE[CargoCondition]][]).map(([cond, badge]) => (
                    <label key={cond} className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all bg-white ${cond === 'GOOD' ? 'border-green-300' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="condition" className="hidden" defaultChecked={cond === 'GOOD'} />
                      <span className="text-lg">{badge.icon}</span>
                      <span className="text-xs font-medium">{badge.label}</span>
                    </label>
                  ))}
                </div>
                <textarea placeholder="Describe any damage, wet conditions, tears, repackaging required..." className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">ðŸ· Photo Documentation (Required)</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Overview', 'Labels/Markings', 'Piece Count', 'Damage (if any)'].map((label, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50">
                      <p className="text-2xl mb-1">ðŸ·</p>
                      <p className="text-xs text-gray-600 font-medium">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Tap to capture</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage Location */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Storage Location *</label><input type="text" placeholder="e.g. A-12-3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Received By</label><input type="text" defaultValue="Tom Garcia" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>

              {/* AWB Link (Optional) */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-violet-800 mb-2">Link to AWB (Optional  can link later)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">AWB Number</label><input type="text" placeholder="e.g. 180-88421100" className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Export Order #</label><input type="text" placeholder="e.g. JFK-EXP-2201" className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
              </div>

              {/* Notes */}
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label><textarea placeholder="Any special instructions..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} /></div>

              {/* Auto-Send Report Option */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-xs text-blue-800">Automatically send on-hand report to client after save</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowReceiveModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={() => setShowReceiveModal(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Save & Generate RCV#</button>
            </div>
          </div>
        </div>
      )}

      {/* ─ Link to AWB Modal ─ */}
      {showLinkAWBModal && pieceToLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinkAWBModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ Link {pieceToLink.receivingNumber} to AWB</h2><p className="text-xs text-gray-400 mt-0.5">{pieceToLink.clientName} · {pieceToLink.pieces} pcs · {pieceToLink.weight} kg</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Search Existing AWBs for {pieceToLink.clientName}</label>
                <input type="text" placeholder="Type AWB # or export order..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2">Suggested Matches (based on client + commodity)</h4>
                <div className="space-y-2">
                  {[
                    { awb: '180-99112233', order: 'JFK-EXP-2210', pcs: 12, kg: 500, dest: 'ICN', airline: 'Korean Air', match: 95 },
                    { awb: '180-77665544', order: 'JFK-EXP-2215', pcs: 24, kg: 890, dest: 'NRT', airline: 'ANA', match: 78 },
                  ].map((m, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="awb" className="text-violet-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><span className="font-mono text-violet-600 font-bold">{m.awb}</span><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${m.match > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{m.match}% match</span></div>
                        <p className="text-xs text-gray-600 mt-0.5">{m.order} · {m.pcs} pcs · {m.kg} kg → {m.dest} ({m.airline})</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Or Create New Export Order + AWB</label>
                <button className="w-full px-3 py-2 text-xs font-medium text-violet-700 bg-white border border-violet-300 rounded-lg hover:bg-violet-50">+ Create New Export Order</button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowLinkAWBModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={() => setShowLinkAWBModal(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Link to Selected AWB</button>
            </div>
          </div>
        </div>
      )}

      {/* ─ Send Report Modal ─ */}
      {showSendReportModal && pieceToLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSendReportModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ§ Send On-Hand Report to Client</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Recipient Email *</label><input type="email" defaultValue={`ops@${pieceToLink.clientCwOrg.toLowerCase()}.com`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">CC</label><input type="email" placeholder="cc@client.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Subject</label><input type="text" defaultValue={`On-Hand Receipt  ${pieceToLink.receivingNumber}  ${pieceToLink.clientName}`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>

              {/* Report Preview */}
              <div className="bg-white border border-gray-300 rounded-lg p-5" style={{ fontFamily: 'serif' }}>
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-300">
                  <div><p className="text-lg font-bold text-gray-900">AXON TMS</p><p className="text-xs text-gray-500">On-Hand Cargo Report</p></div>
                  <div className="text-right"><p className="text-xs text-gray-500">Report Date</p><p className="text-sm font-bold">{new Date().toLocaleDateString()}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div><span className="text-gray-500">RCV #:</span><br /><strong className="font-mono text-blue-600">{pieceToLink.receivingNumber}</strong></div>
                  <div><span className="text-gray-500">Client:</span><br /><strong>{pieceToLink.clientName}</strong></div>
                  <div><span className="text-gray-500">Received:</span><br /><strong>{pieceToLink.receivedDate} {pieceToLink.receivedTime}</strong></div>
                  <div><span className="text-gray-500">Reference:</span><br /><strong className="font-mono">{pieceToLink.clientReference}</strong></div>
                </div>
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">Cargo Details</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-500">Pieces:</span><br /><strong>{pieceToLink.pieces}</strong></div>
                    <div><span className="text-gray-500">Weight:</span><br /><strong>{pieceToLink.weight} kg</strong></div>
                    <div><span className="text-gray-500">Volume:</span><br /><strong>{pieceToLink.cbm.toFixed(2)} CBM</strong></div>
                    <div><span className="text-gray-500">Chargeable:</span><br /><strong>{pieceToLink.chargableWeight} kg</strong></div>
                  </div>
                  <p className="text-xs mt-2"><span className="text-gray-500">Commodity:</span> {pieceToLink.commodity}</p>
                </div>
                {pieceToLink.condition !== 'GOOD' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-xs font-bold text-yellow-800 mb-1">⚠ Condition Notice: {CONDITION_BADGE[pieceToLink.condition].label}</p>
                    <p className="text-xs text-yellow-700">{pieceToLink.damageNotes}</p>
                  </div>
                )}
                {pieceToLink.linkedAWB && (
                  <div className="bg-blue-50 rounded p-3 mb-3 text-xs">
                    <p><span className="text-gray-500">Linked AWB:</span> <strong className="font-mono text-violet-600">{pieceToLink.linkedAWB}</strong></p>
                    <p><span className="text-gray-500">Export Order:</span> <strong>{pieceToLink.linkedExportOrder}</strong> → {pieceToLink.destinationAirport}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">ðŸ· {pieceToLink.photos.length} photos attached · Storage location: {pieceToLink.storageLocation}</p>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Attachments</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded"><input type="checkbox" defaultChecked className="rounded" /><span className="text-xs">ðŸ On-Hand Report PDF</span></label>
                  <label className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded"><input type="checkbox" defaultChecked className="rounded" /><span className="text-xs">ðŸ· {pieceToLink.photos.length} cargo photos</span></label>
                  {pieceToLink.condition !== 'GOOD' && <label className="flex items-center gap-2 py-1.5 px-2 bg-yellow-50 rounded"><input type="checkbox" defaultChecked className="rounded" /><span className="text-xs">⚠ Damage report with photos</span></label>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowSendReportModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <div className="flex gap-2"><button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">ðŸ Download PDF</button><button onClick={() => setShowSendReportModal(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">ðŸ§ Send to Client</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ─ Detail Flyout ─ */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedPiece(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-25" />
          <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{selectedPiece.receivingNumber}</h2>
                <p className="text-xs text-gray-400">{selectedPiece.clientName}</p>
              </div>
              <button onClick={() => setSelectedPiece(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedPiece.status].color}`}>{STATUS_BADGE[selectedPiece.status].label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_BADGE[selectedPiece.condition].color}`}>{CONDITION_BADGE[selectedPiece.condition].icon} {CONDITION_BADGE[selectedPiece.condition].label}</span>
              </div>

              <div><h3 className="text-xs font-bold text-gray-700 mb-2">Cargo Details</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Commodity</span><span className="text-gray-900 text-right max-w-xs">{selectedPiece.commodity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pieces</span><span className="font-bold text-gray-900">{selectedPiece.pieces}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gross Weight</span><span className="text-gray-900">{selectedPiece.weight} kg ({selectedPiece.weightLb} lb)</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Volume Weight</span><span className="text-gray-900">{selectedPiece.volumeWeight} kg</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Chargeable Weight</span><span className="font-bold text-violet-600">{selectedPiece.chargableWeight} kg</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Volume</span><span className="text-gray-900">{selectedPiece.cbm.toFixed(2)} CBM</span></div>
                </div>
              </div>

              <div><h3 className="text-xs font-bold text-gray-700 mb-2">Dimensions</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {selectedPiece.dimensions.map((d, i) => (
                    <div key={i} className="text-xs py-1 border-b border-gray-200 last:border-0">Pallet {i + 1}: {d.length} × {d.width} × {d.height} {d.unit}</div>
                  ))}
                </div>
              </div>

              {selectedPiece.specialHandling.length > 0 && (
                <div><h3 className="text-xs font-bold text-gray-700 mb-2">Special Handling</h3>
                  <div className="flex flex-wrap gap-1">{selectedPiece.specialHandling.map(h => <span key={h} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{h}</span>)}</div>
                </div>
              )}

              {selectedPiece.damageNotes && (
                <div><h3 className="text-xs font-bold text-red-700 mb-2">⚠ Condition / Damage Notes</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-900">{selectedPiece.damageNotes}</div>
                </div>
              )}

              <div><h3 className="text-xs font-bold text-gray-700 mb-2">ðŸ· Photos ({selectedPiece.photos.length})</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedPiece.photos.map((photo, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-gray-200">ðŸ·<br/>{photo.substring(0, 15)}</div>
                  ))}
                </div>
              </div>

              {selectedPiece.linkedAWB ? (
                <div><h3 className="text-xs font-bold text-gray-700 mb-2">ðŸ Linked Export</h3>
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">AWB</span><span className="font-mono text-violet-600 font-bold">{selectedPiece.linkedAWB}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Export Order</span><span className="text-gray-900 font-medium">{selectedPiece.linkedExportOrder}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Destination</span><span className="text-gray-900 font-medium">{selectedPiece.destinationAirport}</span></div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs font-bold text-yellow-800 mb-2">⚠ Not linked to AWB yet</p><button onClick={() => { setPieceToLink(selectedPiece); setShowLinkAWBModal(true); }} className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg">ðŸ Link to AWB Now</button></div>
              )}

              <div><h3 className="text-xs font-bold text-gray-700 mb-2">Storage & Handling</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-mono text-gray-900 font-medium">{selectedPiece.storageLocation}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Storage Days</span><span className="text-gray-900">Day {selectedPiece.storageDays}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Received By</span><span className="text-gray-900">{selectedPiece.receivedBy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Client Reference</span><span className="font-mono text-gray-900">{selectedPiece.clientReference}</span></div>
                </div>
              </div>

              {selectedPiece.reportSentToClient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
                  <p className="text-green-800">✓ Report sent to client on {new Date(selectedPiece.reportSentDate!).toLocaleString()}</p>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button onClick={() => { setPieceToLink(selectedPiece); setShowSendReportModal(true); }} className="flex-1 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">ðŸ§ Send Report</button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">✎ Edit</button>
                <button className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">ðŸ¨</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
