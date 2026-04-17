import { useState, useMemo } from 'react';

// ─ Types ─
type PortalScreen = 'shipments' | 'tracking' | 'documents' | 'invoices' | 'quote';

interface CustomerShipment {
  id: string; loadNumber: string; status: 'BOOKED' | 'DISPATCHED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  origin: string; originState: string; destination: string; destinationState: string;
  pickupDate: string; deliveryDate: string; commodity: string; weight: string;
  carrier: string; equipment: string; rate: number;
  lastLocation: string; lastUpdate: string; etaMinutes: number;
}

interface CustomerInvoice {
  id: string; invoiceNumber: string; loadNumber: string; amount: number; status: 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE';
  invoiceDate: string; dueDate: string; paidDate: string;
}

interface CustomerDocument {
  id: string; loadNumber: string; type: string; name: string; date: string;
}

// ─ Mock Data ─
const MOCK_CUSTOMERS: Record<string, { name: string; company: string; email: string; phone: string; shipments: CustomerShipment[]; invoices: CustomerInvoice[]; documents: CustomerDocument[] }> = {
  'acme': {
    name: 'John Reynolds', company: 'Acme Manufacturing', email: 'john.r@acmemfg.com', phone: '(555) 200-1001',
    shipments: [
      { id: 's1', loadNumber: 'SH-10421', status: 'IN_TRANSIT', origin: 'Detroit', originState: 'MI', destination: 'Nashville', destinationState: 'TN', pickupDate: '2026-04-13', deliveryDate: '2026-04-13', commodity: 'Auto Parts', weight: '42,000 lbs', carrier: 'Eagle Freight Lines', equipment: 'Dry Van 53\'', rate: 2800, lastLocation: 'Bowling Green, KY', lastUpdate: '04/14/2026 8:12 PM', etaMinutes: 95 },
      { id: 's8', loadNumber: 'SH-10428', status: 'BOOKED', origin: 'Detroit', originState: 'MI', destination: 'Columbus', destinationState: 'OH', pickupDate: '2026-04-15', deliveryDate: '2026-04-15', commodity: 'Building Materials', weight: '45,000 lbs', carrier: 'TBD', equipment: 'Dry Van 53\'', rate: 3200, lastLocation: '—', lastUpdate: '', etaMinutes: 0 },
      { id: 's20', loadNumber: 'SH-10415', status: 'DELIVERED', origin: 'Detroit', originState: 'MI', destination: 'Chicago', destinationState: 'IL', pickupDate: '2026-04-10', deliveryDate: '2026-04-10', commodity: 'Auto Parts', weight: '40,000 lbs', carrier: 'Midwest Express', equipment: 'Dry Van 53\'', rate: 2600, lastLocation: 'Chicago, IL', lastUpdate: '04/10/2026 3:45 PM', etaMinutes: 0 },
      { id: 's21', loadNumber: 'SH-10408', status: 'DELIVERED', origin: 'Detroit', originState: 'MI', destination: 'Indianapolis', destinationState: 'IN', pickupDate: '2026-04-08', deliveryDate: '2026-04-08', commodity: 'Engine Components', weight: '38,000 lbs', carrier: 'Thunder Road Inc.', equipment: 'Dry Van 53\'', rate: 2400, lastLocation: 'Indianapolis, IN', lastUpdate: '04/08/2026 2:30 PM', etaMinutes: 0 },
    ],
    invoices: [
      { id: 'inv1', invoiceNumber: 'INV-20260401', loadNumber: 'SH-10421', amount: 2800, status: 'SENT', invoiceDate: '2026-04-14', dueDate: '2026-05-14', paidDate: '' },
      { id: 'inv2', invoiceNumber: 'INV-20260320', loadNumber: 'SH-10415', amount: 2600, status: 'PAID', invoiceDate: '2026-04-10', dueDate: '2026-05-10', paidDate: '2026-04-28' },
      { id: 'inv3', invoiceNumber: 'INV-20260310', loadNumber: 'SH-10408', amount: 2400, status: 'PAID', invoiceDate: '2026-04-08', dueDate: '2026-05-08', paidDate: '2026-04-25' },
    ],
    documents: [
      { id: 'doc1', loadNumber: 'SH-10421', type: 'Rate Confirmation', name: 'Rate_Con_SH10421.pdf', date: '2026-04-12' },
      { id: 'doc2', loadNumber: 'SH-10421', type: 'BOL', name: 'BOL_SH10421_Signed.pdf', date: '2026-04-13' },
      { id: 'doc3', loadNumber: 'SH-10415', type: 'Rate Confirmation', name: 'Rate_Con_SH10415.pdf', date: '2026-04-09' },
      { id: 'doc4', loadNumber: 'SH-10415', type: 'BOL', name: 'BOL_SH10415.pdf', date: '2026-04-10' },
      { id: 'doc5', loadNumber: 'SH-10415', type: 'POD', name: 'POD_SH10415_Signed.pdf', date: '2026-04-10' },
      { id: 'doc6', loadNumber: 'SH-10408', type: 'POD', name: 'POD_SH10408_Signed.pdf', date: '2026-04-08' },
    ],
  },
};

const STATUS_FLOW = ['BOOKED', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_LABELS: Record<string, string> = { BOOKED: 'Booked', DISPATCHED: 'Dispatched', PICKED_UP: 'Picked Up', IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered' };
const STATUS_COLORS: Record<string, string> = { BOOKED: 'bg-gray-100 text-gray-700', DISPATCHED: 'bg-blue-100 text-blue-800', PICKED_UP: 'bg-indigo-100 text-indigo-800', IN_TRANSIT: 'bg-yellow-100 text-yellow-800', OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800', DELIVERED: 'bg-green-100 text-green-800' };
const INV_STATUS: Record<string, string> = { PENDING: 'bg-gray-100 text-gray-600', SENT: 'bg-blue-100 text-blue-800', PAID: 'bg-green-100 text-green-800', OVERDUE: 'bg-red-100 text-red-800' };
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

// ─ Component ─
export function CustomerPortal() {
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [screen, setScreen] = useState<PortalScreen>('shipments');
  const [selectedShipment, setSelectedShipment] = useState<CustomerShipment | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');

  const customer = MOCK_CUSTOMERS[customerId];

  const handleLogin = () => {
    if (loginEmail.toLowerCase().includes('acme') || loginEmail.toLowerCase().includes('john')) {
      setCustomerId('acme'); setAuthed(true); setLoginError('');
    } else { setLoginError('No portal account found. Contact your AXON TMS rep.'); }
  };

  const handleLogout = () => { setAuthed(false); setCustomerId(''); setSelectedShipment(null); };

  const trackResult = useMemo(() => {
    if (!trackingSearch || !customer) return null;
    return customer.shipments.find(s => s.loadNumber.toLowerCase().includes(trackingSearch.toLowerCase()));
  }, [trackingSearch, customer]);

  // ─ Login Screen ─
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui' }}>
        <div style={{ width: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 6 }}>AXON TMS</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>Customer Portal</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Track shipments, view documents, and manage invoices</p>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@yourcompany.com" style={{ width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {loginError && <div style={{ fontSize: 13, color: '#dc2626', padding: '8px 12px', background: '#fef2f2', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>{loginError}</div>}
            <button onClick={handleLogin} style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, color: 'white', background: '#2563eb', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Sign In</button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Quick Track (no login required):</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input type="text" value={trackingSearch} onChange={e => setTrackingSearch(e.target.value)} placeholder="Enter shipment # (e.g. SH-10421)" style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }} />
                <button onClick={() => { if (trackingSearch) { setCustomerId('acme'); setAuthed(true); setScreen('tracking'); } }} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer' }}>Track</button>
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>Powered by AXON TMS TMS</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  // ─ Portal Layout ─
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', color: 'white', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div><span style={{ fontSize: 10, letterSpacing: 2, opacity: 0.5 }}>AXON TMS</span><br/><span style={{ fontSize: 15, fontWeight: 700 }}>Customer Portal</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13 }}>{customer.company}</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>|</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>{customer.name}</span>
            <button onClick={handleLogout} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
        {/* Nav */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {([
            { id: 'shipments' as PortalScreen, label: 'My Shipments', count: customer.shipments.length },
            { id: 'tracking' as PortalScreen, label: 'Track Shipment' },
            { id: 'documents' as PortalScreen, label: 'Documents', count: customer.documents.length },
            { id: 'invoices' as PortalScreen, label: 'Invoices', count: customer.invoices.filter(i => i.status !== 'PAID').length },
            { id: 'quote' as PortalScreen, label: 'Request Quote' },
          ]).map(tab => (
            <button key={tab.id} onClick={() => { setScreen(tab.id); setSelectedShipment(null); }} style={{ padding: '10px 16px', fontSize: 13, fontWeight: screen === tab.id ? 700 : 400, color: screen === tab.id ? 'white' : 'rgba(255,255,255,0.6)', background: screen === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', borderBottom: screen === tab.id ? '2px solid white' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {tab.label}
              {tab.count !== undefined && <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: screen === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>

        {/* ─ My Shipments ─ */}
        {screen === 'shipments' && !selectedShipment && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Active Shipments</p><p style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{customer.shipments.filter(s => s.status !== 'DELIVERED').length}</p></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>In Transit</p><p style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{customer.shipments.filter(s => s.status === 'IN_TRANSIT').length}</p></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Delivered (30d)</p><p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{customer.shipments.filter(s => s.status === 'DELIVERED').length}</p></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Open Invoices</p><p style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>{customer.invoices.filter(i => i.status !== 'PAID').length}</p></div>
            </div>

            <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Shipment #</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Origin</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Destination</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Pickup</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Delivery</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Last Location</th>
                </tr></thead>
                <tbody>
                  {customer.shipments.map((s, i) => (
                    <tr key={s.id} onClick={() => setSelectedShipment(s)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#2563eb' }}>{s.loadNumber}</td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{s.origin}, {s.originState}</td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{s.destination}, {s.destinationState}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(s.pickupDate)}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(s.deliveryDate)}</td>
                      <td style={{ padding: '10px 14px' }}><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</span></td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{s.lastLocation || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─ Shipment Detail ─ */}
        {screen === 'shipments' && selectedShipment && (
          <div>
            <button onClick={() => setSelectedShipment(null)} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}>Back to Shipments</button>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                {/* Status Bar */}
                <div style={{ background: 'white', borderRadius: 10, padding: 20, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{selectedShipment.loadNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedShipment.status]}`}>{STATUS_LABELS[selectedShipment.status]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(selectedShipment.status);
                      return <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= currentIdx ? '#2563eb' : '#e5e7eb' }} />;
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {STATUS_FLOW.map(s => <span key={s} style={{ fontSize: 9, color: '#9ca3af' }}>{STATUS_LABELS[s]}</span>)}
                  </div>
                </div>
                {/* Route */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: 'white', borderRadius: 10, padding: 14, borderLeft: '4px solid #22c55e', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>ORIGIN</p><p style={{ fontSize: 14, fontWeight: 600 }}>{selectedShipment.origin}, {selectedShipment.originState}</p><p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{fmtDate(selectedShipment.pickupDate)}</p></div>
                  <div style={{ background: 'white', borderRadius: 10, padding: 14, borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>DESTINATION</p><p style={{ fontSize: 14, fontWeight: 600 }}>{selectedShipment.destination}, {selectedShipment.destinationState}</p><p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{fmtDate(selectedShipment.deliveryDate)}</p></div>
                </div>
                {/* Details */}
                <div style={{ background: 'white', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Shipment Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: '#9ca3af', fontSize: 11 }}>Commodity</span><br/><strong>{selectedShipment.commodity}</strong></div>
                    <div><span style={{ color: '#9ca3af', fontSize: 11 }}>Weight</span><br/><strong>{selectedShipment.weight}</strong></div>
                    <div><span style={{ color: '#9ca3af', fontSize: 11 }}>Equipment</span><br/><strong>{selectedShipment.equipment}</strong></div>
                    <div><span style={{ color: '#9ca3af', fontSize: 11 }}>Carrier</span><br/><strong>{selectedShipment.carrier}</strong></div>
                    <div><span style={{ color: '#9ca3af', fontSize: 11 }}>Rate</span><br/><strong>{fmtCurrency(selectedShipment.rate)}</strong></div>
                    {selectedShipment.etaMinutes > 0 && <div><span style={{ color: '#9ca3af', fontSize: 11 }}>ETA</span><br/><strong style={{ color: '#2563eb' }}>{Math.floor(selectedShipment.etaMinutes / 60)}h {selectedShipment.etaMinutes % 60}m</strong></div>}
                  </div>
                </div>
              </div>
              {/* Right: Tracking */}
              <div>
                <div style={{ background: 'white', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Live Tracking</h4>
                  {selectedShipment.lastLocation && selectedShipment.lastLocation !== '—' ? (
                    <div>
                      <div style={{ background: '#eff6ff', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>{selectedShipment.lastLocation}</p>
                        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{selectedShipment.lastUpdate}</p>
                        <p style={{ fontSize: 11, color: '#6b7280' }}>via Trucker Tools</p>
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: 8, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#9ca3af', fontSize: 13 }}>Map View</span></div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 20 }}>Tracking available once shipment is picked up</p>
                  )}
                </div>
                <div style={{ background: 'white', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Documents</h4>
                  {customer.documents.filter(d => d.loadNumber === selectedShipment.loadNumber).map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div><p style={{ fontSize: 12, fontWeight: 500, color: '#2563eb' }}>{d.name}</p><p style={{ fontSize: 11, color: '#9ca3af' }}>{d.type} · {fmtDate(d.date)}</p></div>
                      <button style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>⬇</button>
                    </div>
                  ))}
                  {customer.documents.filter(d => d.loadNumber === selectedShipment.loadNumber).length === 0 && <p style={{ fontSize: 12, color: '#9ca3af' }}>No documents yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ Track Shipment ─ */}
        {screen === 'tracking' && (
          <div>
            <div style={{ background: 'white', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Track a Shipment</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={trackingSearch} onChange={e => setTrackingSearch(e.target.value)} placeholder="Enter shipment number (e.g. SH-10421)" style={{ flex: 1, padding: '12px 16px', fontSize: 15, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none' }} onKeyDown={e => e.key === 'Enter'} />
                <button style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600, color: 'white', background: '#2563eb', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Track</button>
              </div>
            </div>
            {trackResult ? (
              <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{trackResult.loadNumber}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[trackResult.status]}`}>{STATUS_LABELS[trackResult.status]}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {STATUS_FLOW.map((s, i) => <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= STATUS_FLOW.indexOf(trackResult.status) ? '#2563eb' : '#e5e7eb' }} />)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div style={{ borderLeft: '3px solid #22c55e', paddingLeft: 12 }}><p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>ORIGIN</p><p style={{ fontSize: 14, fontWeight: 600 }}>{trackResult.origin}, {trackResult.originState}</p><p style={{ fontSize: 12, color: '#6b7280' }}>{fmtDate(trackResult.pickupDate)}</p></div>
                  <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: 12 }}><p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>DESTINATION</p><p style={{ fontSize: 14, fontWeight: 600 }}>{trackResult.destination}, {trackResult.destinationState}</p><p style={{ fontSize: 12, color: '#6b7280' }}>{fmtDate(trackResult.deliveryDate)}</p></div>
                  <div style={{ borderLeft: '3px solid #2563eb', paddingLeft: 12 }}><p style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>CURRENT LOCATION</p><p style={{ fontSize: 14, fontWeight: 600 }}>{trackResult.lastLocation || 'Awaiting update'}</p><p style={{ fontSize: 12, color: '#6b7280' }}>{trackResult.lastUpdate || '—'}</p></div>
                </div>
                {trackResult.etaMinutes > 0 && <div style={{ marginTop: 16, padding: 12, background: '#eff6ff', borderRadius: 8, textAlign: 'center' }}><p style={{ fontSize: 13, color: '#1e40af' }}>Estimated arrival in <strong>{Math.floor(trackResult.etaMinutes / 60)}h {trackResult.etaMinutes % 60}m</strong></p></div>}
              </div>
            ) : trackingSearch ? (
              <div style={{ background: 'white', borderRadius: 10, padding: 32, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}></p>
                <p style={{ fontSize: 14, color: '#6b7280' }}>No shipment found for "{trackingSearch}"</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Check the shipment number and try again</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ─ Documents ─ */}
        {screen === 'documents' && (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}><h3 style={{ fontSize: 15, fontWeight: 600 }}>All Documents</h3></div>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Shipment</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>File Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Action</th>
              </tr></thead>
              <tbody>
                {customer.documents.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#2563eb' }}>{d.loadNumber}</td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{d.type}</td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{d.name}</td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(d.date)}</td>
                    <td style={{ padding: '10px 14px' }}><button style={{ padding: '4px 10px', fontSize: 12, color: '#2563eb', background: '#eff6ff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─ Invoices ─ */}
        {screen === 'invoices' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Total Outstanding</p><p style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{fmtCurrency(customer.invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amount, 0))}</p></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Paid (30d)</p><p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{fmtCurrency(customer.invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0))}</p></div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><p style={{ fontSize: 12, color: '#9ca3af' }}>Total Invoiced</p><p style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{fmtCurrency(customer.invoices.reduce((s, i) => s + i.amount, 0))}</p></div>
            </div>
            <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Invoice #</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Shipment</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Invoice Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Paid Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                </tr></thead>
                <tbody>
                  {customer.invoices.map((inv, i) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '10px 14px', color: '#2563eb' }}>{inv.loadNumber}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(inv.amount)}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(inv.invoiceDate)}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(inv.dueDate)}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtDate(inv.paidDate)}</td>
                      <td style={{ padding: '10px 14px' }}><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INV_STATUS[inv.status]}`}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─ Request Quote ─ */}
        {screen === 'quote' && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}><h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Request a Quote</h3><p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Fill out the details below and we'll get back to you within 2 hours</p></div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Origin City *</label><input type="text" placeholder="e.g. Detroit, MI" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Destination City *</label><input type="text" placeholder="e.g. Chicago, IL" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Pickup Date *</label><input type="date" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Equipment Type *</label><select style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}><option>Dry Van 53'</option><option>Reefer 53'</option><option>Flatbed 48'</option><option>Step Deck</option><option>Sprinter Van</option></select></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Weight (lbs)</label><input type="number" placeholder="42,000" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Commodity</label><input type="text" placeholder="e.g. Auto parts, palletized" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Frequency</label><select style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}><option>One-time spot</option><option>Weekly</option><option>Monthly contract</option><option>Annual contract</option></select></div>
              </div>
              <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Special Requirements / Notes</label><textarea placeholder="Liftgate, driver assist, appointment required..." rows={3} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14 }} /></div>
              <button style={{ width: '100%', padding: '12px 24px', background: '#2563eb', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Submit Quote Request</button>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Quotes are typically returned within 2 business hours</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
