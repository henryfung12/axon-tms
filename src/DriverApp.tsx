import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
type Screen = 'load' | 'documents' | 'hos' | 'inspection' | 'messages' | 'fuel' | 'photos' | 'signature' | 'cfs';

interface ActiveLoad {
  loadNumber: string; status: 'ASSIGNED' | 'EN_ROUTE_PICKUP' | 'AT_PICKUP' | 'LOADED' | 'IN_TRANSIT' | 'AT_DELIVERY' | 'DELIVERED';
  shipper: string; shipperAddress: string; shipperCity: string; shipperState: string;
  consignee: string; consigneeAddress: string; consigneeCity: string; consigneeState: string;
  pickupDate: string; pickupTime: string; deliveryDate: string; deliveryTime: string;
  commodity: string; weight: string; pieces: string; rate: number;
  instructions: string; bolNumber: string; refNumber: string;
  miles: number; etaMinutes: number;
}

interface Document {
  id: string; type: 'BOL' | 'POD' | 'LUMPER' | 'SCALE_TICKET' | 'OTHER'; name: string;
  uploadedAt: string; status: 'UPLOADED' | 'PENDING' | 'APPROVED'; loadNumber: string;
}

interface HOSData {
  currentStatus: 'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY';
  drivingAvailable: number; drivingUsed: number;
  onDutyAvailable: number; onDutyUsed: number;
  cycleUsed: number; cycleAvailable: number;
  breakTimeRemaining: number; lastStatusChange: string;
  todayLog: { status: string; start: string; end: string; duration: number }[];
}

interface InspectionItem {
  id: string; category: string; item: string; status: 'PASS' | 'FAIL' | 'NA' | null; notes: string;
}

interface Message {
  id: string; from: 'DRIVER' | 'DISPATCH'; senderName: string; text: string; timestamp: string; read: boolean;
}

interface FuelEntry {
  id: string; date: string; station: string; city: string; state: string;
  gallons: number; pricePerGallon: number; total: number; odometer: number; fuelType: 'DIESEL' | 'DEF';
}

interface Expense {
  id: string; date: string; category: 'FUEL' | 'TOLLS' | 'LUMPER' | 'SCALE' | 'PARKING' | 'FOOD' | 'REPAIR' | 'OTHER';
  description: string; amount: number; receipt: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_LOAD: ActiveLoad = {
  loadNumber: 'LD-4521', status: 'IN_TRANSIT',
  shipper: 'Acme Manufacturing', shipperAddress: '4200 Industrial Pkwy', shipperCity: 'Detroit', shipperState: 'MI',
  consignee: 'Midwest Distribution Center', consigneeAddress: '8800 Commerce Dr', consigneeCity: 'Nashville', consigneeState: 'TN',
  pickupDate: '2026-04-13', pickupTime: '06:00 AM', deliveryDate: '2026-04-13', deliveryTime: '4:00 PM',
  commodity: 'Auto Parts — Palletized', weight: '42,000 lbs', pieces: '24 pallets',
  rate: 2800, instructions: 'Dock #7 at pickup. Call 30 min before delivery. No tail-gate, must have dock.',
  bolNumber: 'BOL-88421', refNumber: 'PO-2026-4521', miles: 530, etaMinutes: 142,
};

const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', type: 'BOL', name: 'BOL-88421.pdf', uploadedAt: '2026-04-13T06:30:00Z', status: 'APPROVED', loadNumber: 'LD-4521' },
  { id: 'doc2', type: 'SCALE_TICKET', name: 'Scale_Ticket_Detroit.jpg', uploadedAt: '2026-04-13T06:45:00Z', status: 'UPLOADED', loadNumber: 'LD-4521' },
];

const MOCK_HOS: HOSData = {
  currentStatus: 'DRIVING', drivingAvailable: 6.5, drivingUsed: 4.5, onDutyAvailable: 5.0, onDutyUsed: 6.0,
  cycleUsed: 48.5, cycleAvailable: 21.5, breakTimeRemaining: 3.5, lastStatusChange: '2026-04-13T06:00:00Z',
  todayLog: [
    { status: 'OFF_DUTY', start: '12:00 AM', end: '5:30 AM', duration: 5.5 },
    { status: 'ON_DUTY', start: '5:30 AM', end: '6:00 AM', duration: 0.5 },
    { status: 'DRIVING', start: '6:00 AM', end: '9:00 AM', duration: 3.0 },
    { status: 'ON_DUTY', start: '9:00 AM', end: '9:30 AM', duration: 0.5 },
    { status: 'DRIVING', start: '9:30 AM', end: '11:00 AM', duration: 1.5 },
    { status: 'DRIVING', start: '11:00 AM', end: 'NOW', duration: 0 },
  ],
};

const DVIR_ITEMS: InspectionItem[] = [
  { id: 'dv1', category: 'Cab', item: 'Windshield / Glass', status: null, notes: '' },
  { id: 'dv2', category: 'Cab', item: 'Wipers / Washers', status: null, notes: '' },
  { id: 'dv3', category: 'Cab', item: 'Mirrors', status: null, notes: '' },
  { id: 'dv4', category: 'Cab', item: 'Horn', status: null, notes: '' },
  { id: 'dv5', category: 'Cab', item: 'Seat Belt', status: null, notes: '' },
  { id: 'dv6', category: 'Cab', item: 'Gauges / Warning Indicators', status: null, notes: '' },
  { id: 'dv7', category: 'Exterior', item: 'Headlights / Taillights', status: null, notes: '' },
  { id: 'dv8', category: 'Exterior', item: 'Turn Signals / Hazards', status: null, notes: '' },
  { id: 'dv9', category: 'Exterior', item: 'Reflectors / Markers', status: null, notes: '' },
  { id: 'dv10', category: 'Exterior', item: 'Tires / Wheels / Lug Nuts', status: null, notes: '' },
  { id: 'dv11', category: 'Exterior', item: 'Brakes / Air Lines', status: null, notes: '' },
  { id: 'dv12', category: 'Exterior', item: 'Coupling Devices (5th wheel)', status: null, notes: '' },
  { id: 'dv13', category: 'Under Hood', item: 'Oil Level', status: null, notes: '' },
  { id: 'dv14', category: 'Under Hood', item: 'Coolant Level', status: null, notes: '' },
  { id: 'dv15', category: 'Under Hood', item: 'Belt Condition', status: null, notes: '' },
  { id: 'dv16', category: 'Under Hood', item: 'Leaks (oil, coolant, fuel)', status: null, notes: '' },
  { id: 'dv17', category: 'Trailer', item: 'Doors / Latches / Hinges', status: null, notes: '' },
  { id: 'dv18', category: 'Trailer', item: 'Landing Gear', status: null, notes: '' },
  { id: 'dv19', category: 'Trailer', item: 'Lights & Reflectors', status: null, notes: '' },
  { id: 'dv20', category: 'Trailer', item: 'Tires / Wheels', status: null, notes: '' },
  { id: 'dv21', category: 'Safety', item: 'Fire Extinguisher', status: null, notes: '' },
  { id: 'dv22', category: 'Safety', item: 'Warning Triangles / Flares', status: null, notes: '' },
  { id: 'dv23', category: 'Safety', item: 'Spare Fuses', status: null, notes: '' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', from: 'DISPATCH', senderName: 'Karen Liu', text: 'Marcus, pickup confirmed at Acme Detroit. Dock #7. They open at 6 AM.', timestamp: '2026-04-13T05:30:00Z', read: true },
  { id: 'm2', from: 'DRIVER', senderName: 'Marcus Johnson', text: 'Copy, arriving at Acme now. Gate is open.', timestamp: '2026-04-13T05:55:00Z', read: true },
  { id: 'm3', from: 'DRIVER', senderName: 'Marcus Johnson', text: 'Loaded. 24 pallets, 42k lbs. BOL signed. Heading to Nashville.', timestamp: '2026-04-13T06:30:00Z', read: true },
  { id: 'm4', from: 'DISPATCH', senderName: 'Karen Liu', text: 'Great. ETA looks good for 4 PM. Call consignee 30 min out. Contact: Mike at (615) 555-8800.', timestamp: '2026-04-13T06:35:00Z', read: true },
  { id: 'm5', from: 'DISPATCH', senderName: 'Karen Liu', text: 'Heads up — construction on I-65 SB near Bowling Green. Use I-24 alternate if backed up.', timestamp: '2026-04-13T10:00:00Z', read: false },
];

const MOCK_FUEL: FuelEntry[] = [
  { id: 'fe1', date: '2026-04-13T07:15:00Z', station: 'Pilot Travel Center #412', city: 'Memphis', state: 'TN', gallons: 98.4, pricePerGallon: 3.82, total: 375.89, odometer: 223816, fuelType: 'DIESEL' },
  { id: 'fe2', date: '2026-04-12T06:00:00Z', station: 'Pilot Travel Center #412', city: 'Memphis', state: 'TN', gallons: 12.5, pricePerGallon: 4.22, total: 52.75, odometer: 223532, fuelType: 'DEF' },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'ex1', date: '2026-04-13T07:15:00Z', category: 'FUEL', description: 'Pilot #412 — Diesel', amount: 375.89, receipt: true },
  { id: 'ex2', date: '2026-04-13T06:50:00Z', category: 'SCALE', description: 'CAT Scale — Detroit', amount: 12.50, receipt: true },
  { id: 'ex3', date: '2026-04-12T21:00:00Z', category: 'PARKING', description: 'Pilot #412 — overnight', amount: 18.00, receipt: true },
  { id: 'ex4', date: '2026-04-12T12:00:00Z', category: 'TOLLS', description: 'I-90 Tollway — IL', amount: 4.80, receipt: false },
  { id: 'ex5', date: '2026-04-12T06:00:00Z', category: 'FUEL', description: 'Pilot #412 — DEF', amount: 52.75, receipt: true },
];

// ── Helpers ────────────────────────────────────────────────────────
const STATUS_FLOW: ActiveLoad['status'][] = ['ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'LOADED', 'IN_TRANSIT', 'AT_DELIVERY', 'DELIVERED'];
const STATUS_LABELS: Record<string, string> = { ASSIGNED: 'Assigned', EN_ROUTE_PICKUP: 'En Route to Pickup', AT_PICKUP: 'At Pickup', LOADED: 'Loaded', IN_TRANSIT: 'In Transit', AT_DELIVERY: 'At Delivery', DELIVERED: 'Delivered' };
const HOS_STATUS_COLORS: Record<string, string> = { DRIVING: '#22c55e', ON_DUTY: '#3b82f6', SLEEPER: '#a855f7', OFF_DUTY: '#9ca3af' };
const HOS_LABELS: Record<string, string> = { DRIVING: 'Driving', ON_DUTY: 'On Duty', SLEEPER: 'Sleeper', OFF_DUTY: 'Off Duty' };
const EXPENSE_ICONS: Record<string, string> = { FUEL: '⛽', TOLLS: '🛣', LUMPER: '📦', SCALE: '⚖', PARKING: '🅿', FOOD: '🍔', REPAIR: '🔧', OTHER: '📝' };

function fmtTime(d: string) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

// ── Main App ───────────────────────────────────────────────────────
export default function DriverApp() {
  const [screen, setScreen] = useState<Screen>('load');
  const [load, setLoad] = useState<ActiveLoad>(MOCK_LOAD);
  const [dvirItems, setDvirItems] = useState<InspectionItem[]>(DVIR_ITEMS);
  const [dvirType, setDvirType] = useState<'PRE_TRIP' | 'POST_TRIP'>('PRE_TRIP');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [showGPSTracking, setShowGPSTracking] = useState(true);
  const [showSignPad, setShowSignPad] = useState(false);

  const unreadMessages = messages.filter(m => !m.read && m.from === 'DISPATCH').length;
  const currentStatusIdx = STATUS_FLOW.indexOf(load.status);

  const advanceStatus = () => {
    const nextIdx = currentStatusIdx + 1;
    if (nextIdx < STATUS_FLOW.length) {
      setLoad(prev => ({ ...prev, status: STATUS_FLOW[nextIdx] }));
    }
  };

  const updateDVIR = (id: string, status: 'PASS' | 'FAIL' | 'NA') => {
    setDvirItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, from: 'DRIVER', senderName: 'Marcus Johnson', text: newMessage, timestamp: new Date().toISOString(), read: true }]);
    setNewMessage('');
  };

  const TABS: { id: Screen; label: string; icon: string; badge?: number }[] = [
    { id: 'load', label: 'Load', icon: '📦' },
    { id: 'documents', label: 'Docs', icon: '📄' },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'hos', label: 'HOS', icon: '⏱' },
    { id: 'inspection', label: 'DVIR', icon: '🔍' },
    { id: 'messages', label: 'Chat', icon: '💬', badge: unreadMessages },
    { id: 'cfs', label: 'CFS', icon: '✈' },
    { id: 'fuel', label: 'Fuel', icon: '⛽' },
  ];

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ background: '#1e3a5f', color: 'white', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>GEMINI EXPRESS</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Driver App</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Marcus Johnson</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>T-1042 · TR-2201</div>
          </div>
        </div>
        {/* GPS Status Bar */}
        {showGPSTracking && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, padding: '6px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} /><span style={{ fontSize: 11, color: '#6ee7b7' }}>GPS Active — Sharing location with dispatch</span></div>
            <span style={{ fontSize: 10, color: '#6ee7b7' }}>62 mph NE</span>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* ── LOAD SCREEN ──────────────────────────────────── */}
        {screen === 'load' && (
          <div>
            {/* Status Progress */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{load.loadNumber}</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: load.status === 'DELIVERED' ? '#dcfce7' : '#dbeafe', color: load.status === 'DELIVERED' ? '#166534' : '#1e40af' }}>{STATUS_LABELS[load.status]}</span>
              </div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentStatusIdx ? '#2563eb' : '#e5e7eb' }} />
                ))}
              </div>
              {load.status !== 'DELIVERED' && (
                <button onClick={advanceStatus} style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 700, color: 'white', background: '#2563eb', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}>
                  {currentStatusIdx < STATUS_FLOW.length - 1 ? `Update: ${STATUS_LABELS[STATUS_FLOW[currentStatusIdx + 1]]}` : 'Complete'}
                </button>
              )}
            </div>

            {/* ETA / Miles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>{Math.floor(load.etaMinutes / 60)}h {load.etaMinutes % 60}m</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>ETA to Delivery</div>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>{load.miles}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Total Miles</div>
              </div>
            </div>

            {/* Pickup */}
            <div style={{ background: 'white', borderRadius: 10, padding: 14, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>PICKUP</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{load.shipper}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{load.shipperAddress}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{load.shipperCity}, {load.shipperState}</div>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 500, marginTop: 4 }}>{load.pickupDate} · {load.pickupTime}</div>
            </div>

            {/* Delivery */}
            <div style={{ background: 'white', borderRadius: 10, padding: 14, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>DELIVERY</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{load.consignee}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{load.consigneeAddress}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{load.consigneeCity}, {load.consigneeState}</div>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 500, marginTop: 4 }}>{load.deliveryDate} · {load.deliveryTime}</div>
            </div>

            {/* Load Details */}
            <div style={{ background: 'white', borderRadius: 10, padding: 14, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>Load Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div><span style={{ color: '#9ca3af' }}>Commodity</span><br/><strong>{load.commodity}</strong></div>
                <div><span style={{ color: '#9ca3af' }}>Weight</span><br/><strong>{load.weight}</strong></div>
                <div><span style={{ color: '#9ca3af' }}>Pieces</span><br/><strong>{load.pieces}</strong></div>
                <div><span style={{ color: '#9ca3af' }}>BOL #</span><br/><strong>{load.bolNumber}</strong></div>
                <div><span style={{ color: '#9ca3af' }}>Ref #</span><br/><strong>{load.refNumber}</strong></div>
                <div><span style={{ color: '#9ca3af' }}>Rate</span><br/><strong>${load.rate.toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Instructions */}
            {load.instructions && (
              <div style={{ background: '#fef3c7', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>INSTRUCTIONS</div>
                <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>{load.instructions}</div>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS SCREEN ─────────────────────────────── */}
        {screen === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Documents</div>
              <button onClick={() => setShowUploadDoc(true)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'white', background: '#2563eb', border: 'none', borderRadius: 8, cursor: 'pointer' }}>+ Upload</button>
            </div>
            {/* Quick Upload Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[{ label: 'Take Photo of BOL', icon: '📋', type: 'BOL' }, { label: 'Take Photo of POD', icon: '📝', type: 'POD' }, { label: 'Lumper Receipt', icon: '🧾', type: 'LUMPER' }, { label: 'Scale Ticket', icon: '⚖', type: 'SCALE_TICKET' }].map(btn => (
                <button key={btn.type} style={{ background: 'white', border: '2px dashed #d1d5db', borderRadius: 10, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', fontSize: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{btn.icon}</div>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{btn.label}</div>
                </button>
              ))}
            </div>
            {/* Uploaded Documents */}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Uploaded ({MOCK_DOCUMENTS.length})</div>
            {MOCK_DOCUMENTS.map(doc => (
              <div key={doc.id} style={{ background: 'white', borderRadius: 10, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{doc.type} · {doc.loadNumber} · {fmtTime(doc.uploadedAt)}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: doc.status === 'APPROVED' ? '#dcfce7' : '#fef3c7', color: doc.status === 'APPROVED' ? '#166534' : '#92400e' }}>{doc.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── HOS SCREEN ───────────────────────────────────── */}
        {screen === 'hos' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>Hours of Service</div>
            {/* Current Status */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: HOS_STATUS_COLORS[MOCK_HOS.currentStatus] }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: HOS_STATUS_COLORS[MOCK_HOS.currentStatus] }}>{HOS_LABELS[MOCK_HOS.currentStatus]}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>Since {fmtTime(MOCK_HOS.lastStatusChange)}</span>
              </div>
              {/* Status Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                {(['DRIVING', 'ON_DUTY', 'SLEEPER', 'OFF_DUTY'] as const).map(s => (
                  <button key={s} style={{ padding: '10px 0', fontSize: 11, fontWeight: 600, border: '2px solid', borderColor: MOCK_HOS.currentStatus === s ? HOS_STATUS_COLORS[s] : '#e5e7eb', borderRadius: 8, background: MOCK_HOS.currentStatus === s ? HOS_STATUS_COLORS[s] + '15' : 'white', color: MOCK_HOS.currentStatus === s ? HOS_STATUS_COLORS[s] : '#6b7280', cursor: 'pointer' }}>
                    {HOS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            {/* Hours Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Driving Available', value: `${MOCK_HOS.drivingAvailable}h`, color: MOCK_HOS.drivingAvailable <= 2 ? '#dc2626' : MOCK_HOS.drivingAvailable <= 4 ? '#ca8a04' : '#16a34a', max: 11, used: MOCK_HOS.drivingUsed },
                { label: 'On-Duty Available', value: `${MOCK_HOS.onDutyAvailable}h`, color: MOCK_HOS.onDutyAvailable <= 2 ? '#dc2626' : '#16a34a', max: 14, used: MOCK_HOS.onDutyUsed },
                { label: '30-Min Break', value: `${MOCK_HOS.breakTimeRemaining}h`, color: '#3b82f6', max: 8, used: 8 - MOCK_HOS.breakTimeRemaining },
                { label: '70h Cycle Left', value: `${MOCK_HOS.cycleAvailable}h`, color: MOCK_HOS.cycleAvailable <= 10 ? '#dc2626' : '#3b82f6', max: 70, used: MOCK_HOS.cycleUsed },
              ].map(h => (
                <div key={h.label} style={{ background: 'white', borderRadius: 10, padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{h.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: h.color }}>{h.value}</div>
                  <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: h.color, width: `${(h.used / h.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Today's Log */}
            <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>Today's Log</div>
              {MOCK_HOS.todayLog.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < MOCK_HOS.todayLog.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: HOS_STATUS_COLORS[entry.status], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', flex: 1 }}>{HOS_LABELS[entry.status]}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{entry.start} — {entry.end}</span>
                  {entry.duration > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{entry.duration}h</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DVIR SCREEN ──────────────────────────────────── */}
        {screen === 'inspection' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Vehicle Inspection</div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #d1d5db' }}>
                {(['PRE_TRIP', 'POST_TRIP'] as const).map(t => (
                  <button key={t} onClick={() => setDvirType(t)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: dvirType === t ? '#2563eb' : 'white', color: dvirType === t ? 'white' : '#6b7280' }}>{t === 'PRE_TRIP' ? 'Pre-Trip' : 'Post-Trip'}</button>
                ))}
              </div>
            </div>
            {/* Progress */}
            <div style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Progress</span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{dvirItems.filter(i => i.status !== null).length} / {dvirItems.length}</span>
              </div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: dvirItems.some(i => i.status === 'FAIL') ? '#ef4444' : '#22c55e', borderRadius: 3, width: `${(dvirItems.filter(i => i.status !== null).length / dvirItems.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
              {dvirItems.some(i => i.status === 'FAIL') && <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 6 }}>⚠ {dvirItems.filter(i => i.status === 'FAIL').length} defect(s) found</div>}
            </div>
            {/* Inspection Items by Category */}
            {['Cab', 'Exterior', 'Under Hood', 'Trailer', 'Safety'].map(cat => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat}</div>
                {dvirItems.filter(i => i.category === cat).map(item => (
                  <div key={item.id} style={{ background: 'white', borderRadius: 8, padding: '10px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderLeft: item.status === 'FAIL' ? '3px solid #ef4444' : item.status === 'PASS' ? '3px solid #22c55e' : '3px solid transparent' }}>
                    <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{item.item}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['PASS', 'FAIL', 'NA'] as const).map(s => (
                        <button key={s} onClick={() => updateDVIR(item.id, s)} style={{ width: 36, height: 28, fontSize: 10, fontWeight: 700, border: '1.5px solid', borderRadius: 6, cursor: 'pointer', borderColor: item.status === s ? (s === 'PASS' ? '#22c55e' : s === 'FAIL' ? '#ef4444' : '#9ca3af') : '#e5e7eb', background: item.status === s ? (s === 'PASS' ? '#dcfce7' : s === 'FAIL' ? '#fef2f2' : '#f3f4f6') : 'white', color: item.status === s ? (s === 'PASS' ? '#166534' : s === 'FAIL' ? '#991b1b' : '#374151') : '#9ca3af' }}>
                          {s === 'PASS' ? '✓' : s === 'FAIL' ? '✕' : 'N/A'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* Submit */}
            <button style={{ width: '100%', padding: '14px 0', fontSize: 14, fontWeight: 700, color: 'white', background: dvirItems.every(i => i.status !== null) ? '#22c55e' : '#9ca3af', border: 'none', borderRadius: 10, cursor: dvirItems.every(i => i.status !== null) ? 'pointer' : 'default', marginTop: 8 }} disabled={!dvirItems.every(i => i.status !== null)}>
              {dvirItems.every(i => i.status !== null) ? (dvirItems.some(i => i.status === 'FAIL') ? 'Submit with Defects' : 'Submit — All Clear') : `Complete all items (${dvirItems.filter(i => i.status === null).length} remaining)`}
            </button>
          </div>
        )}

        {/* ── MESSAGES SCREEN ──────────────────────────────── */}
        {screen === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>Messages — Dispatch</div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'DRIVER' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.from === 'DRIVER' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.from === 'DRIVER' ? '#2563eb' : 'white', color: m.from === 'DRIVER' ? 'white' : '#1f2937', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, opacity: 0.7 }}>{m.senderName} · {fmtTime(m.timestamp)}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 24, outline: 'none' }} />
              <button onClick={sendMessage} style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563eb', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
            </div>
          </div>
        )}

        {/* ── FUEL & EXPENSES SCREEN ────────────────────────── */}
        {screen === 'fuel' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Fuel & Expenses</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setShowAddFuel(true)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>+ Fuel</button>
                <button onClick={() => setShowAddExpense(true)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>+ Expense</button>
              </div>
            </div>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: 10, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>${MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0).toFixed(0)}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>Total (7d)</div></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 10, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>${MOCK_FUEL.filter(f => f.fuelType === 'DIESEL').reduce((s, f) => s + f.total, 0).toFixed(0)}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>Fuel Only</div></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 10, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{MOCK_FUEL.filter(f => f.fuelType === 'DIESEL').reduce((s, f) => s + f.gallons, 0).toFixed(0)}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>Gallons</div></div>
            </div>
            {/* Fuel Entries */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Fuel Stops</div>
            {MOCK_FUEL.map(f => (
              <div key={f.id} style={{ background: 'white', borderRadius: 10, padding: 14, marginBottom: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{f.station}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{f.city}, {f.state} · {fmtDate(f.date)} {fmtTime(f.date)}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{f.gallons.toFixed(1)} gal · ${f.pricePerGallon}/gal · {f.fuelType}</div></div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>${f.total.toFixed(2)}</div>
              </div>
            ))}
            {/* Expenses */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, marginTop: 12 }}>Expenses</div>
            {MOCK_EXPENSES.map(e => (
              <div key={e.id} style={{ background: 'white', borderRadius: 8, padding: '10px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 18 }}>{EXPENSE_ICONS[e.category]}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{e.description}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDate(e.date)} · {e.receipt ? '✓ Receipt' : 'No receipt'}</div></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>${e.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── PHOTOS SCREEN ────────────────────────────────── */}
        {screen === 'photos' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>📷 Photo Upload — POD & Cargo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {['Cargo at Pickup', 'BOL / Paperwork', 'Cargo at Delivery', 'Damage (if any)'].map((label, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Tap to capture</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSignPad(true)} style={{ width: '100%', padding: '14px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>✍ Capture Signature (POD)</button>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Recent Uploads</h4>
            {[{ name: 'Cargo_Pickup_LD4521.jpg', time: '2:15 PM', type: 'Pickup' }, { name: 'BOL_LD4521.jpg', time: '2:16 PM', type: 'BOL' }, { name: 'Signature_POD.png', time: '4:30 PM', type: 'Signature' }].map((p, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 8, padding: '10px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>📷</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{p.name}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{p.time} · {p.type}</div></div>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Synced</span>
              </div>
            ))}
          </div>
        )}

        {/* ── CFS SCREEN ───────────────────────────────────── */}
        {screen === 'cfs' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>✈ CFS Terminal Operations</h3>
            <div style={{ background: '#7c3aed', borderRadius: 12, padding: 16, color: 'white', marginBottom: 16 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Current Assignment</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>TRP-0414-001 — JFK Pickup</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Bldg 75 → Bldg 151 → CFS Warehouse</div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🛂 Terminal Check-In</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: 12, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Check In</button>
                <button style={{ flex: 1, padding: 12, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Scan Dock QR</button>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📦 Piece Count Verification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#6b7280' }}>Expected</div><div style={{ fontSize: 24, fontWeight: 700 }}>12</div></div>
                <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#6b7280' }}>Counted</div><div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>12</div></div>
              </div>
              <button style={{ width: '100%', padding: 10, background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>✓ Confirm — 12/12</button>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏭 Dock Assignment</h4>
              <div style={{ background: '#ede9fe', borderRadius: 8, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#6b7280' }}>Assigned</div><div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>DOCK B-3</div><div style={{ fontSize: 11, color: '#6b7280' }}>Zone A — General</div></div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Route Progress</h4>
              {[{ seq: 1, loc: 'JFK Bldg 75', pcs: 12, active: true }, { seq: 2, loc: 'JFK Bldg 151', pcs: 60, active: false }, { seq: 3, loc: 'CFS Warehouse', pcs: 72, active: false }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.active ? '#7c3aed' : '#e5e7eb', color: s.active ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.seq}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.loc}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{s.pcs} pcs</div></div>
                  {s.active && <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 10 }}>Current</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Pad */}
        {showSignPad && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowSignPad(false)}>
            <div style={{ background: 'white', borderRadius: 16, width: '90%', maxWidth: 400, padding: 20 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>✍ Digital Signature — POD</h3>
              <div style={{ border: '2px solid #d1d5db', borderRadius: 12, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14, marginBottom: 12, background: '#fafafa' }}>Sign here with finger</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}><div>Load: LD-4521 · Memphis → Nashville</div><div>Driver: <strong>Marcus Johnson</strong></div></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowSignPad(false)} style={{ flex: 1, padding: 12, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>Clear</button>
                <button onClick={() => setShowSignPad(false)} style={{ flex: 1, padding: 12, background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>✓ Save</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Tab Bar ──────────────────────────────────── */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setScreen(tab.id); if (tab.id === 'messages') setMessages(prev => prev.map(m => ({ ...m, read: true }))); }} style={{ flex: 1, padding: '8px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}>
            <span style={{ fontSize: 18, filter: screen === tab.id ? 'none' : 'grayscale(1)', opacity: screen === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: screen === tab.id ? 700 : 400, color: screen === tab.id ? '#2563eb' : '#9ca3af' }}>{tab.label}</span>
            {tab.badge && tab.badge > 0 && <span style={{ position: 'absolute', top: 4, right: 'calc(50% - 16px)', width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
