import { useState, useMemo } from 'react';

// ─ Types ─
type WarehouseTab = 'inventory' | 'receiving' | 'consolidation' | 'storage';

interface WarehouseItem {
  id: string; hawb: string; mawb: string; orderNumber: string;
  shipper: string; consignee: string; consigneeCity: string; consigneeState: string;
  commodity: string; pieces: number; weight: string; dims: string;
  zone: string; location: string; receivedAt: string; storageDays: number;
  status: 'PENDING_RECEIPT' | 'RECEIVED' | 'IN_STORAGE' | 'CONSOLIDATING' | 'DECONSOLIDATING' | 'STAGED' | 'RELEASED' | 'PICKED_UP';
  actionNeeded: string; temperature: string; hazmat: boolean; highValue: boolean;
}

interface ReceivingRecord {
  id: string; orderNumber: string; mawb: string; airline: string; flightNumber: string;
  airport: string; terminal: string; expectedPieces: number; receivedPieces: number;
  receivedAt: string; receivedBy: string; condition: 'GOOD' | 'DAMAGED' | 'WET' | 'PARTIAL' | 'OVER';
  notes: string; status: 'EXPECTED' | 'IN_PROGRESS' | 'COMPLETE' | 'DISCREPANCY';
}

interface ConsolJob {
  id: string; type: 'CONSOLIDATION' | 'DECONSOLIDATION'; jobNumber: string;
  mawb: string; hawbs: string[]; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';
  totalPieces: number; processedPieces: number;
  startedAt: string; completedAt: string; assignedTo: string; notes: string;
}

// ─ Mock Data ─
const MOCK_INVENTORY: WarehouseItem[] = [
  { id: 'wi1', hawb: 'GE-H-20260414-002A', mawb: '180-99321100', orderNumber: 'JFK-IMP-0902', shipper: 'Global Textile Co.', consignee: 'NY Fashion Import Inc.', consigneeCity: 'New York', consigneeState: 'NY', commodity: 'Textile / Garments', pieces: 12, weight: '1,400 kg', dims: '80x60x80 cm', zone: 'A', location: 'A-14-02', receivedAt: '2026-04-14T10:30:00Z', storageDays: 0, status: 'DECONSOLIDATING', actionNeeded: 'Decon in progress  6 sub-lots', temperature: 'Ambient', hazmat: false, highValue: false },
  { id: 'wi2', hawb: 'GE-H-20260414-002B', mawb: '180-99321100', orderNumber: 'JFK-IMP-0902', shipper: 'Global Textile Co.', consignee: 'Fashion Hub NYC', consigneeCity: 'New York', consigneeState: 'NY', commodity: 'Textile / Garments', pieces: 8, weight: '920 kg', dims: '80x60x80 cm', zone: 'A', location: 'A-14-03', receivedAt: '2026-04-14T10:30:00Z', storageDays: 0, status: 'DECONSOLIDATING', actionNeeded: 'Part of decon job DCN-0042', temperature: 'Ambient', hazmat: false, highValue: false },
  { id: 'wi3', hawb: 'GE-H-20260413-008', mawb: '131-55782100', orderNumber: 'JFK-IMP-0892', shipper: 'Arabian Fresh Foods', consignee: 'Gourmet Imports USA', consigneeCity: 'Brooklyn', consigneeState: 'NY', commodity: 'Perishable  Fresh Dates', pieces: 24, weight: '3,800 kg', dims: '100x80x60 cm', zone: 'B', location: 'B-03-01', receivedAt: '2026-04-13T18:00:00Z', storageDays: 1, status: 'IN_STORAGE', actionNeeded: 'FDA hold  awaiting clearance', temperature: '35-45°F', hazmat: false, highValue: false },
  { id: 'wi4', hawb: 'GE-H-20260412-010', mawb: '074-88321500', orderNumber: 'JFK-IMP-0875', shipper: 'Swiss Pharma AG', consignee: 'US Medical Supply', consigneeCity: 'White Plains', consigneeState: 'NY', commodity: 'Pharmaceutical  Cold Chain', pieces: 4, weight: '280 kg', dims: '60x40x40 cm', zone: 'B', location: 'B-01-04', receivedAt: '2026-04-12T14:00:00Z', storageDays: 2, status: 'STAGED', actionNeeded: 'Ready for pickup  consignee notified', temperature: '2-8°C', hazmat: false, highValue: true },
  { id: 'wi5', hawb: 'GE-H-20260414-011', mawb: '618-77200100', orderNumber: 'ORD-IMP-0450', shipper: 'Tokyo Chemical Corp', consignee: 'Midwest Chemical Dist.', consigneeCity: 'Indianapolis', consigneeState: 'IN', commodity: 'DG  Chemical Reagents', pieces: 8, weight: '640 kg', dims: '40x30x30 cm', zone: 'C', location: 'C-02-01', receivedAt: '2026-04-14T09:00:00Z', storageDays: 0, status: 'IN_STORAGE', actionNeeded: 'DG Class 6  MSDS on file', temperature: 'Ventilated', hazmat: true, highValue: false },
  { id: 'wi6', hawb: 'GE-H-20260413-012', mawb: '176-44500200', orderNumber: 'JFK-IMP-0895', shipper: 'De Beers International', consignee: 'Diamond Exchange NYC', consigneeCity: 'New York', consigneeState: 'NY', commodity: 'Precious Stones', pieces: 2, weight: '12 kg', dims: '30x20x15 cm', zone: 'D', location: 'D-VAULT-03', receivedAt: '2026-04-13T16:00:00Z', storageDays: 1, status: 'IN_STORAGE', actionNeeded: 'Bonded  customs broker pickup required', temperature: 'Secured', hazmat: false, highValue: true },
  { id: 'wi7', hawb: 'GE-H-20260412-013', mawb: '057-33100800', orderNumber: 'ATL-IMP-0150', shipper: 'Caterpillar Export', consignee: 'Southern Equipment Co.', consigneeCity: 'Birmingham', consigneeState: 'AL', commodity: 'Heavy Machinery Parts', pieces: 3, weight: '4,200 kg', dims: '250x150x200 cm', zone: 'E', location: 'E-BAY-02', receivedAt: '2026-04-12T11:00:00Z', storageDays: 2, status: 'STAGED', actionNeeded: 'Oversize  flatbed required for pickup', temperature: 'Open Bay', hazmat: false, highValue: false },
  { id: 'wi8', hawb: 'GE-H-20260414-014', mawb: '131-99100300', orderNumber: 'JFK-IMP-0905', shipper: 'Bangladesh RMG Export', consignee: 'H&M Distribution', consigneeCity: 'Secaucus', consigneeState: 'NJ', commodity: 'Ready-Made Garments', pieces: 60, weight: '7,800 kg', dims: '80x60x80 cm', zone: 'A', location: 'A-20-01', receivedAt: '2026-04-14T08:00:00Z', storageDays: 0, status: 'RECEIVED', actionNeeded: 'Pending customs clearance', temperature: 'Ambient', hazmat: false, highValue: false },
  { id: 'wi9', hawb: 'GE-E-20260414-002', mawb: '176-88100502', orderNumber: 'JFK-EXP-0502', shipper: 'NY Fashion Export LLC', consignee: 'HK Garment Import Co.', consigneeCity: 'Hong Kong', consigneeState: 'HK', commodity: 'Textile / Fashion (Export)', pieces: 32, weight: '4,200 kg', dims: '80x60x80 cm', zone: 'A', location: 'A-EXPORT-05', receivedAt: '2026-04-14T07:00:00Z', storageDays: 0, status: 'CONSOLIDATING', actionNeeded: 'Export consol  4 shippers → 1 MAWB', temperature: 'Ambient', hazmat: false, highValue: false },
];

const MOCK_RECEIVING: ReceivingRecord[] = [
  { id: 'rc1', orderNumber: 'JFK-IMP-0905', mawb: '131-99100300', airline: 'Emirates', flightNumber: 'EK 202', airport: 'JFK', terminal: 'Bldg 22', expectedPieces: 60, receivedPieces: 60, receivedAt: '2026-04-14T08:00:00Z', receivedBy: 'Tony Russo', condition: 'GOOD', notes: 'All 60 cartons received in good condition', status: 'COMPLETE' },
  { id: 'rc2', orderNumber: 'JFK-IMP-0902', mawb: '180-99321100', airline: 'Cathay Pacific', flightNumber: 'CX 840', airport: 'JFK', terminal: 'Bldg 151', expectedPieces: 48, receivedPieces: 48, receivedAt: '2026-04-14T10:30:00Z', receivedBy: 'Tony Russo', condition: 'GOOD', notes: 'Received  deconsolidation started', status: 'COMPLETE' },
  { id: 'rc3', orderNumber: 'ORD-IMP-0450', mawb: '618-77200100', airline: 'ANA', flightNumber: 'NH 112', airport: 'ORD', terminal: 'Cargo F', expectedPieces: 8, receivedPieces: 8, receivedAt: '2026-04-14T09:00:00Z', receivedBy: 'Carlos Mendez', condition: 'GOOD', notes: 'DG  MSDS verified at receiving. Stored in Zone C.', status: 'COMPLETE' },
  { id: 'rc4', orderNumber: 'MIA-IMP-0325', mawb: '235-22100400', airline: 'LATAM', flightNumber: 'LA 502', airport: 'MIA', terminal: 'MIA Cargo', expectedPieces: 20, receivedPieces: 18, receivedAt: '2026-04-14T11:00:00Z', receivedBy: 'Maria Santos', condition: 'PARTIAL', notes: '2 pieces short  carrier signed exception. Claim being filed.', status: 'DISCREPANCY' },
  { id: 'rc5', orderNumber: 'JFK-IMP-0908', mawb: '074-11200500', airline: 'KLM', flightNumber: 'KL 642', airport: 'JFK', terminal: 'Bldg 22', expectedPieces: 15, receivedPieces: 0, receivedAt: '', receivedBy: '', condition: 'GOOD', notes: 'Flight arrived  pickup dispatched. ETA 3:30 PM.', status: 'EXPECTED' },
  { id: 'rc6', orderNumber: 'DFW-IMP-0212', mawb: '297-55100600', airline: 'Lufthansa', flightNumber: 'LH 438', airport: 'DFW', terminal: 'DFW Cargo', expectedPieces: 10, receivedPieces: 5, receivedAt: '2026-04-14T13:30:00Z', receivedBy: 'James Harper', condition: 'DAMAGED', notes: 'In progress  2 cartons show water damage. Photos taken.', status: 'IN_PROGRESS' },
];

const MOCK_CONSOL: ConsolJob[] = [
  { id: 'cj1', type: 'DECONSOLIDATION', jobNumber: 'DCN-0042', mawb: '180-99321100', hawbs: ['GE-H-20260414-002A', 'GE-H-20260414-002B', 'GE-H-20260414-002C', 'GE-H-20260414-002D', 'GE-H-20260414-002E', 'GE-H-20260414-002F'], status: 'IN_PROGRESS', totalPieces: 48, processedPieces: 20, startedAt: '2026-04-14T11:00:00Z', completedAt: '', assignedTo: 'Tony Russo', notes: 'Splitting MAWB 180-99321100 into 6 HAWBs for separate consignees' },
  { id: 'cj2', type: 'CONSOLIDATION', jobNumber: 'CON-0088', mawb: '176-88100502', hawbs: ['EXP-HAWB-001', 'EXP-HAWB-002', 'EXP-HAWB-003', 'EXP-HAWB-004'], status: 'IN_PROGRESS', totalPieces: 32, processedPieces: 24, startedAt: '2026-04-14T09:00:00Z', completedAt: '', assignedTo: 'Carlos Mendez', notes: 'Consolidating 4 shippers into 1 MAWB for CX 841 to HKG' },
  { id: 'cj3', type: 'DECONSOLIDATION', jobNumber: 'DCN-0041', mawb: '131-55100700', hawbs: ['GE-H-20260413-020A', 'GE-H-20260413-020B', 'GE-H-20260413-020C'], status: 'COMPLETE', totalPieces: 30, processedPieces: 30, startedAt: '2026-04-13T14:00:00Z', completedAt: '2026-04-13T16:30:00Z', assignedTo: 'Tony Russo', notes: 'Complete  all 3 lots staged for delivery' },
  { id: 'cj4', type: 'CONSOLIDATION', jobNumber: 'CON-0087', mawb: '180-66100800', hawbs: ['EXP-HAWB-010', 'EXP-HAWB-011'], status: 'COMPLETE', totalPieces: 18, processedPieces: 18, startedAt: '2026-04-13T08:00:00Z', completedAt: '2026-04-13T10:00:00Z', assignedTo: 'Maria Santos', notes: 'Consolidated for KE 081 to ICN  departed' },
];

// ─ Helpers ─
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  PENDING_RECEIPT: { label: 'Pending Receipt', color: 'bg-gray-100 text-gray-600' },
  RECEIVED: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  IN_STORAGE: { label: 'In Storage', color: 'bg-indigo-100 text-indigo-800' },
  CONSOLIDATING: { label: 'Consolidating', color: 'bg-orange-100 text-orange-800' },
  DECONSOLIDATING: { label: 'Deconsolidating', color: 'bg-purple-100 text-purple-800' },
  STAGED: { label: 'Staged', color: 'bg-teal-100 text-teal-800' },
  RELEASED: { label: 'Released', color: 'bg-green-100 text-green-800' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-green-100 text-green-800' },
};

const ZONE_COLORS: Record<string, string> = { A: 'bg-blue-500', B: 'bg-cyan-500', C: 'bg-red-500', D: 'bg-yellow-500', E: 'bg-gray-500' };
const ZONE_NAMES: Record<string, string> = { A: 'General Cargo', B: 'Temp Controlled', C: 'Hazmat / DG', D: 'High Value / Bonded', E: 'Oversize / Heavy' };
const RECV_STATUS: Record<string, string> = { EXPECTED: 'bg-gray-100 text-gray-600', IN_PROGRESS: 'bg-yellow-100 text-yellow-800', COMPLETE: 'bg-green-100 text-green-800', DISCREPANCY: 'bg-red-100 text-red-800' };
const COND_BADGE: Record<string, string> = { GOOD: 'bg-green-100 text-green-800', DAMAGED: 'bg-red-100 text-red-800', WET: 'bg-blue-100 text-blue-800', PARTIAL: 'bg-orange-100 text-orange-800', OVER: 'bg-purple-100 text-purple-800' };

function fmtDT(d: string) { return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''; }

// ─ Component ─
export function CFSWarehouse() {
  const [activeTab, setActiveTab] = useState<WarehouseTab>('inventory');
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const filteredInventory = useMemo(() => MOCK_INVENTORY.filter(i => zoneFilter === 'All' || i.zone === zoneFilter), [zoneFilter]);

  const zoneStats = useMemo(() => {
    const zones: Record<string, { pieces: number; items: number; cap: number }> = { A: { pieces: 0, items: 0, cap: 160 }, B: { pieces: 0, items: 0, cap: 60 }, C: { pieces: 0, items: 0, cap: 20 }, D: { pieces: 0, items: 0, cap: 40 }, E: { pieces: 0, items: 0, cap: 15 } };
    MOCK_INVENTORY.forEach(i => { if (zones[i.zone]) { zones[i.zone].pieces += i.pieces; zones[i.zone].items++; } });
    return zones;
  }, []);

  const tabs = [
    { id: 'inventory' as WarehouseTab, label: 'Inventory', count: MOCK_INVENTORY.length },
    { id: 'receiving' as WarehouseTab, label: 'Receiving', count: MOCK_RECEIVING.filter(r => r.status !== 'COMPLETE').length },
    { id: 'consolidation' as WarehouseTab, label: 'Consol / Decon', count: MOCK_CONSOL.filter(c => c.status !== 'COMPLETE').length },
    { id: 'storage' as WarehouseTab, label: 'Storage Zones' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">CFS Warehouse</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBarcodePrint(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ· Print Labels</button>
          <button onClick={() => setShowPhotoCapture(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ· Photo Capture</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ Receive Cargo</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Pieces</p><p className="text-xl font-bold text-gray-900">{MOCK_INVENTORY.reduce((s, i) => s + i.pieces, 0)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Active Items</p><p className="text-xl font-bold text-blue-600">{MOCK_INVENTORY.filter(i => !['RELEASED', 'PICKED_UP'].includes(i.status)).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Consol / Decon</p><p className="text-xl font-bold text-purple-600">{MOCK_CONSOL.filter(c => c.status !== 'COMPLETE').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Staged for Pickup</p><p className="text-xl font-bold text-teal-600">{MOCK_INVENTORY.filter(i => i.status === 'STAGED').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Storage &gt;2 days</p><p className={`text-xl font-bold ${MOCK_INVENTORY.filter(i => i.storageDays >= 2).length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{MOCK_INVENTORY.filter(i => i.storageDays >= 2).length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Hazmat / DG</p><p className={`text-xl font-bold ${MOCK_INVENTORY.filter(i => i.hazmat).length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{MOCK_INVENTORY.filter(i => i.hazmat).length}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label} {t.count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}</button>
        ))}
      </div>

      {/* ─ Inventory Tab ─ */}
      {activeTab === 'inventory' && (
        <div>
          <div className="flex gap-1 mb-3">
            {['All', 'A', 'B', 'C', 'D', 'E'].map(z => (
              <button key={z} onClick={() => setZoneFilter(z)} className={`px-3 py-1 text-xs rounded font-medium ${zoneFilter === z ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{z === 'All' ? 'All Zones' : `Zone ${z}  ${ZONE_NAMES[z]}`}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Zone</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">HAWB</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Consignee</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Commodity</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Pcs</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Weight</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Temp</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Days</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Action Needed</th>
            </tr></thead><tbody>
              {filteredInventory.map(i => (
                <tr key={i.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${i.hazmat ? 'bg-red-50' : i.highValue ? 'bg-yellow-50' : i.storageDays >= 2 ? 'bg-orange-50' : ''}`} onClick={() => setSelectedItem(i)}>
                  <td className="px-3 py-2.5"><span className={`inline-block w-6 h-6 rounded text-white text-xs font-bold text-center leading-6 ${ZONE_COLORS[i.zone]}`}>{i.zone}</span></td>
                  <td className="px-3 py-2.5 font-mono text-gray-700">{i.location}</td>
                  <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{i.hawb}</td>
                  <td className="px-3 py-2.5 text-gray-700">{i.consignee}<br/><span className="text-gray-400">{i.consigneeCity}, {i.consigneeState}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{i.commodity}{i.hazmat && <span className="ml-1 text-red-600 font-bold">☣</span>}{i.highValue && <span className="ml-1 text-yellow-600 font-bold">ðŸ</span>}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{i.pieces}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{i.weight}</td>
                  <td className="px-3 py-2.5 text-gray-600">{i.temperature}</td>
                  <td className="px-3 py-2.5"><span className={`font-bold ${i.storageDays >= 3 ? 'text-red-600' : i.storageDays >= 2 ? 'text-orange-600' : 'text-gray-600'}`}>{i.storageDays}d</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[i.status].color}`}>{STATUS_BADGE[i.status].label}</span></td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs truncate max-w-[180px]">{i.actionNeeded}</td>
                </tr>
              ))}
            </tbody></table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span>Items: <strong>{filteredInventory.length}</strong></span>
              <span>Pieces: <strong>{filteredInventory.reduce((s, i) => s + i.pieces, 0)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ─ Receiving Tab ─ */}
      {activeTab === 'receiving' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200"><h3 className="text-sm font-bold text-gray-900">Receiving Log</h3></div>
          <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Order</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airline / Flight</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airport</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Expected</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Received</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Condition</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Received By</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Time</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          </tr></thead><tbody>
            {MOCK_RECEIVING.map(r => (
              <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 ${r.status === 'DISCREPANCY' ? 'bg-red-50 border-l-4 border-l-red-400' : r.status === 'EXPECTED' ? 'bg-blue-50' : ''}`}>
                <td className="px-3 py-2.5 font-semibold text-blue-600">{r.orderNumber}</td>
                <td className="px-3 py-2.5 font-mono text-gray-700">{r.mawb}</td>
                <td className="px-3 py-2.5 text-gray-700">{r.airline} {r.flightNumber}</td>
                <td className="px-3 py-2.5 text-gray-600">{r.airport} {r.terminal}</td>
                <td className="px-3 py-2.5 text-right text-gray-700">{r.expectedPieces}</td>
                <td className="px-3 py-2.5 text-right font-medium"><span className={r.receivedPieces < r.expectedPieces && r.receivedPieces > 0 ? 'text-red-600' : 'text-gray-900'}>{r.receivedPieces || ''}</span></td>
                <td className="px-3 py-2.5">{r.receivedPieces > 0 ? <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${COND_BADGE[r.condition]}`}>{r.condition}</span> : ''}</td>
                <td className="px-3 py-2.5 text-gray-600">{r.receivedBy || ''}</td>
                <td className="px-3 py-2.5 text-gray-500">{fmtDT(r.receivedAt)}</td>
                <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${RECV_STATUS[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {/* ─ Consolidation / Deconsolidation Tab ─ */}
      {activeTab === 'consolidation' && (
        <div className="space-y-4">
          {MOCK_CONSOL.map(job => {
            const pct = Math.round((job.processedPieces / job.totalPieces) * 100);
            return (
              <div key={job.id} className={`bg-white border rounded-lg p-4 ${job.status === 'IN_PROGRESS' ? 'border-violet-200' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${job.type === 'CONSOLIDATION' ? 'bg-orange-500' : 'bg-purple-500'}`}>{job.type === 'CONSOLIDATION' ? 'ðŸ¥ CONSOL' : 'ðŸ¤ DECON'}</span>
                    <div><p className="text-sm font-bold text-gray-900">{job.jobNumber}</p><p className="text-xs text-gray-400">MAWB: {job.mawb}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'COMPLETE' ? 'bg-green-100 text-green-800' : job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{job.status.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">Assigned: {job.assignedTo}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Progress</span><span className="font-medium">{job.processedPieces} / {job.totalPieces} pieces ({pct}%)</span></div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3"><div className={`h-full rounded-full ${job.status === 'COMPLETE' ? 'bg-green-500' : 'bg-violet-500'}`} style={{ width: `${pct}%` }} /></div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">HAWBs:</span>
                  {job.hawbs.map(h => <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{h}</span>)}
                </div>
                {job.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">{job.notes}</p>}
                {job.status !== 'COMPLETE' && <div className="flex gap-2 mt-3"><button className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">Update Progress</button><button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print Labels</button></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ─ Storage Zones Tab ─ */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(zoneStats).map(([zone, stats]) => {
            const pct = Math.round((stats.pieces / stats.cap) * 100);
            const items = MOCK_INVENTORY.filter(i => i.zone === zone);
            return (
              <div key={zone} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block w-10 h-10 rounded-lg text-white text-lg font-bold text-center leading-10 ${ZONE_COLORS[zone]}`}>{zone}</span>
                    <div><p className="text-sm font-bold text-gray-900">Zone {zone}  {ZONE_NAMES[zone]}</p><p className="text-xs text-gray-400">{stats.items} items · {stats.pieces} pieces</p></div>
                  </div>
                  <div className="text-right"><p className={`text-lg font-bold ${pct > 85 ? 'text-red-600' : pct > 60 ? 'text-yellow-600' : 'text-green-600'}`}>{pct}%</p><p className="text-xs text-gray-400">{stats.pieces} / {stats.cap} capacity</p></div>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-3"><div className={`h-full rounded-full ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} /></div>
                {items.length > 0 && (
                  <div className="space-y-1">
                    {items.map(i => (
                      <div key={i.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-500">{i.location}</span>
                          <span className="font-medium text-gray-800">{i.commodity}{i.hazmat && ' ☣'}{i.highValue && ' ðŸ'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{i.pieces} pcs · {i.weight}</span>
                          <span className={`px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[i.status].color}`}>{STATUS_BADGE[i.status].label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─ Inventory Detail Flyout ─ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[460px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className={`inline-block w-7 h-7 rounded text-white text-xs font-bold text-center leading-7 ${ZONE_COLORS[selectedItem.zone]}`}>{selectedItem.zone}</span><h3 className="text-sm font-bold text-gray-900">{selectedItem.location}</h3></div><button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedItem.status].color}`}>{STATUS_BADGE[selectedItem.status].label}</span>{selectedItem.hazmat && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">☣ Hazmat</span>}{selectedItem.highValue && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">ðŸ High Value</span>}</div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-violet-50 rounded-lg p-3"><div className="flex justify-between text-xs"><span className="text-gray-500">HAWB</span><span className="font-mono font-bold text-gray-900">{selectedItem.hawb}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-gray-500">MAWB</span><span className="font-mono font-bold text-gray-900">{selectedItem.mawb}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-gray-500">Order</span><span className="font-mono font-bold text-blue-600">{selectedItem.orderNumber}</span></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Zone</p><p className="text-sm font-semibold">{selectedItem.zone}  {ZONE_NAMES[selectedItem.zone]}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Temperature</p><p className="text-sm font-semibold">{selectedItem.temperature}</p></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Cargo</h4><div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1"><div className="flex justify-between"><span className="text-gray-500">Commodity</span><span>{selectedItem.commodity}</span></div><div className="flex justify-between"><span className="text-gray-500">Pieces</span><span className="font-bold">{selectedItem.pieces}</span></div><div className="flex justify-between"><span className="text-gray-500">Weight</span><span>{selectedItem.weight}</span></div><div className="flex justify-between"><span className="text-gray-500">Dimensions</span><span>{selectedItem.dims}</span></div></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Shipper</p><p className="text-xs font-semibold">{selectedItem.shipper}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Consignee</p><p className="text-xs font-semibold">{selectedItem.consignee}</p><p className="text-xs text-gray-400">{selectedItem.consigneeCity}, {selectedItem.consigneeState}</p></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Received</p><p className="text-xs font-semibold">{fmtDT(selectedItem.receivedAt)}</p></div><div className={`rounded-lg p-2.5 ${selectedItem.storageDays >= 2 ? 'bg-orange-50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">Storage Days</p><p className={`text-xs font-bold ${selectedItem.storageDays >= 3 ? 'text-red-600' : selectedItem.storageDays >= 2 ? 'text-orange-600' : 'text-gray-900'}`}>{selectedItem.storageDays}d</p></div></div>
              {selectedItem.actionNeeded && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Action Required</h4><p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedItem.actionNeeded}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedItem.status === 'STAGED' && <button className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Release for Pickup</button>}
              {selectedItem.status === 'IN_STORAGE' && <button className="flex-1 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">Stage for Pickup</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Print Label</button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode / Label Print Modal */}
      {showBarcodePrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBarcodePrint(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ· Print Barcode Labels</h2><p className="text-xs text-gray-400 mt-0.5">Generate labels for pieces  scan-to-confirm receiving</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Cargo</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{MOCK_INVENTORY.map(i => <option key={i.id} value={i.id}>{i.mawb}  {i.consignee} ({i.pieces} pcs)</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Label Format</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>4x6 Shipping Label (ZPL)</option><option>2x1 Piece Label (ZPL)</option><option>4x6 PDF Label</option><option>Pallet Label 8x11</option></select></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Label Preview</h4>
                <div className="border border-gray-300 bg-white rounded-lg p-4 text-center" style={{ fontFamily: 'monospace' }}>
                  <div className="text-xs text-gray-400 mb-1">AXON TMS CFS</div>
                  <div className="text-lg font-bold mb-1">|||||||||||||||||||||||</div>
                  <div className="text-xs font-bold mb-1">MAWB: 176-82445521</div>
                  <div className="text-xs mb-1">PCS: 1 of 12 | WT: 200 kg</div>
                  <div className="text-xs mb-1">SAMSUNG ELECTRONICS CO.</div>
                  <div className="text-xs text-gray-500">Zone: A | Loc: A-04 | LOT: GE-L-240414-001</div>
                  <div className="text-lg font-bold mt-1">■■■■■■■■■■■■</div>
                  <div className="text-xs text-gray-400">QR: GE-WH-240414-001-01</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Pieces to Label</label><input type="number" defaultValue={12} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Printer</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Zebra ZT230  Warehouse</option><option>Zebra GK420d  Receiving</option><option>PDF (Download)</option></select></div>
                <div><label className="block text-xs text-gray-500 mb-1">Copies per Piece</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>1</option><option>2</option><option>3</option></select></div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowBarcodePrint(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <div className="flex gap-2"><button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Preview PDF</button><button className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">ðŸ¨ Print 12 Labels</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPhotoCapture(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ· Photo Capture  Receiving Inspection</h2><p className="text-xs text-gray-400 mt-0.5">Document cargo condition at receiving for damage claims</p></div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Cargo</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{MOCK_INVENTORY.map(i => <option key={i.id} value={i.id}>{i.mawb}  {i.consignee} ({i.pieces} pcs)</option>)}</select></div>
              <div className="grid grid-cols-3 gap-3">
                {['Overall Cargo', 'Damage Close-Up', 'Label / Markings'].map((label, i) => (
                  <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50">
                    <p className="text-2xl mb-2">ðŸ·</p>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400 mt-1">Click or drop image</p>
                  </div>
                ))}
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Condition</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Good  No visible damage</option><option>Minor  Cosmetic scuffs/dents</option><option>Moderate  Packaging compromised</option><option>Severe  Visible content damage</option><option>Wet / Water damage</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Describe any damage or special conditions..." /></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowPhotoCapture(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">Save Inspection Photos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
