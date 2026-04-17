import { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Types ──────────────────────────────────────────────────────────
type ELDProvider = 'motive' | 'samsara';

interface MapVehicle {
  id: string; unitNumber: string; type: 'TRUCK' | 'TRAILER'; driverName: string; provider: ELDProvider;
  lat: number; lng: number; city: string; state: string; speed: number; heading: string;
  engineStatus: 'ON' | 'OFF' | 'IDLE'; fuelLevelPct: number; odometerToday: number; lastUpdate: string;
  loadNumber: string | null; destination: string | null; eta: string | null;
  make: string; model: string; year: number; trailerNumber: string;
}

interface TrackingLink {
  id: string; unitNumber: string; loadNumber: string; customerName: string; customerEmail: string;
  duration: number; createdAt: string; expiresAt: string; url: string; active: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_VEHICLES: MapVehicle[] = [
  { id: 'v1', unitNumber: 'T-1042', type: 'TRUCK', driverName: 'Marcus Johnson', provider: 'motive', lat: 35.1495, lng: -90.0490, city: 'Memphis', state: 'TN', speed: 62, heading: 'NE', engineStatus: 'ON', fuelLevelPct: 68, odometerToday: 284, lastUpdate: '2026-04-13T12:30:00Z', loadNumber: 'LD-4521', destination: 'Nashville, TN', eta: '2:30 PM', make: 'Freightliner', model: 'Cascadia', year: 2022, trailerNumber: 'TR-2201' },
  { id: 'v2', unitNumber: 'T-1038', type: 'TRUCK', driverName: 'Sarah Chen', provider: 'samsara', lat: 32.7767, lng: -96.7970, city: 'Dallas', state: 'TX', speed: 0, heading: 'N', engineStatus: 'IDLE', fuelLevelPct: 82, odometerToday: 0, lastUpdate: '2026-04-13T12:28:00Z', loadNumber: 'LD-4522', destination: 'Houston, TX', eta: '6:00 PM', make: 'Peterbilt', model: '579', year: 2024, trailerNumber: 'TR-2204' },
  { id: 'v3', unitNumber: 'T-1055', type: 'TRUCK', driverName: 'James Williams', provider: 'motive', lat: 39.7684, lng: -86.1581, city: 'Indianapolis', state: 'IN', speed: 58, heading: 'E', engineStatus: 'ON', fuelLevelPct: 45, odometerToday: 196, lastUpdate: '2026-04-13T12:31:00Z', loadNumber: 'LD-4523', destination: 'Columbus, OH', eta: '12:00 PM', make: 'International', model: 'LT', year: 2021, trailerNumber: 'TR-2208' },
  { id: 'v4', unitNumber: 'T-1061', type: 'TRUCK', driverName: 'Maria Rodriguez', provider: 'samsara', lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA', speed: 0, heading: 'S', engineStatus: 'OFF', fuelLevelPct: 91, odometerToday: 0, lastUpdate: '2026-04-13T12:25:00Z', loadNumber: 'LD-4525', destination: 'Jacksonville, FL', eta: '8:00 PM', make: 'Kenworth', model: 'W990', year: 2024, trailerNumber: 'TR-2215' },
  { id: 'v5', unitNumber: 'T-1070', type: 'TRUCK', driverName: 'Robert Brown', provider: 'motive', lat: 36.1627, lng: -86.7816, city: 'Nashville', state: 'TN', speed: 65, heading: 'N', engineStatus: 'ON', fuelLevelPct: 52, odometerToday: 312, lastUpdate: '2026-04-13T12:32:00Z', loadNumber: 'LD-4524', destination: 'Louisville, KY', eta: '3:00 PM', make: 'Freightliner', model: 'Cascadia', year: 2023, trailerNumber: 'TR-2231' },
  { id: 'v6', unitNumber: 'T-1033', type: 'TRUCK', driverName: 'Lisa Nguyen', provider: 'samsara', lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', speed: 0, heading: 'W', engineStatus: 'OFF', fuelLevelPct: 74, odometerToday: 0, lastUpdate: '2026-04-13T12:20:00Z', loadNumber: 'LD-4526', destination: 'Salt Lake City, UT', eta: 'Tomorrow 6 AM', make: 'Kenworth', model: 'T680', year: 2022, trailerNumber: 'TR-2199' },
  { id: 'v7', unitNumber: 'T-1029', type: 'TRUCK', driverName: 'David Kim', provider: 'motive', lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', speed: 0, heading: 'N', engineStatus: 'OFF', fuelLevelPct: 88, odometerToday: 0, lastUpdate: '2026-04-13T08:00:00Z', loadNumber: null, destination: null, eta: null, make: 'Freightliner', model: 'Cascadia', year: 2023, trailerNumber: 'TR-2190' },
  { id: 'v8', unitNumber: 'T-1044', type: 'TRUCK', driverName: 'Emily Taylor', provider: 'samsara', lat: 33.4484, lng: -112.0740, city: 'Phoenix', state: 'AZ', speed: 0, heading: 'E', engineStatus: 'OFF', fuelLevelPct: 61, odometerToday: 0, lastUpdate: '2026-04-13T10:15:00Z', loadNumber: null, destination: null, eta: null, make: 'Volvo', model: 'VNL 860', year: 2023, trailerNumber: 'TR-2222' },
];

const MOCK_LINKS: TrackingLink[] = [
  { id: 'tl1', unitNumber: 'T-1042', loadNumber: 'LD-4521', customerName: 'Acme Corp - LAX', customerEmail: 'logistics@acmelax.com', duration: 24, createdAt: '2026-04-13T06:00:00Z', expiresAt: '2026-04-14T06:00:00Z', url: 'https://track.geminiexpress.com/s/a8f2k9x', active: true },
  { id: 'tl2', unitNumber: 'T-1055', loadNumber: 'LD-4523', customerName: 'Acme Corp - EWR', customerEmail: 'dispatch@acmeewr.com', duration: 12, createdAt: '2026-04-13T04:00:00Z', expiresAt: '2026-04-13T16:00:00Z', url: 'https://track.geminiexpress.com/s/b3m7p2w', active: true },
];

// ── Helpers ────────────────────────────────────────────────────────
const PROV: Record<string, { bg: string; text: string; label: string }> = { motive: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Motive' }, samsara: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Samsara' } };
const ENG_C: Record<string, string> = { ON: '#22c55e', OFF: '#9ca3af', IDLE: '#eab308' };
const ENG_L: Record<string, string> = { ON: 'Running', OFF: 'Off', IDLE: 'Idle' };
function fmtDT(d: string) { const t = new Date(d); return `${t.toLocaleDateString('en-US',{month:'short',day:'numeric'})} ${t.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`; }

function popupHTML(v: MapVehicle): string {
  const pc = v.provider === 'motive' ? 'background:#fff7ed;color:#9a3412' : 'background:#f0fdfa;color:#134e4a';
  const fc = v.fuelLevelPct < 25 ? '#dc2626' : v.fuelLevelPct < 50 ? '#ca8a04' : '#16a34a';
  const load = v.loadNumber ? `<div style="margin-top:8px;padding:6px 8px;background:#eff6ff;border-radius:6px;font-size:12px"><strong style="color:#2563eb">${v.loadNumber}</strong> &rarr; ${v.destination}${v.eta ? `<span style="color:#6b7280"> &middot; ETA ${v.eta}</span>` : ''}</div>` : '';
  return `<div style="min-width:240px;font-family:system-ui">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong style="font-size:14px">${v.unitNumber}</strong><span style="font-size:11px;padding:2px 6px;border-radius:4px;${pc}">${PROV[v.provider].label}</span></div>
<div style="font-size:12px;color:#6b7280;margin-bottom:4px">${v.driverName} &middot; ${v.make} ${v.model} ${v.year}</div>
<div style="font-size:12px;color:#6b7280;margin-bottom:4px">${v.city}, ${v.state} &middot; Trailer: ${v.trailerNumber}</div>
<div style="display:flex;gap:12px;margin-top:8px"><div><span style="font-size:11px;color:#9ca3af">Engine</span><br/><strong style="color:${ENG_C[v.engineStatus]};font-size:13px">${ENG_L[v.engineStatus]}</strong></div><div><span style="font-size:11px;color:#9ca3af">Speed</span><br/><strong style="font-size:13px">${v.speed > 0 ? v.speed+' mph '+v.heading : 'Parked'}</strong></div><div><span style="font-size:11px;color:#9ca3af">Fuel</span><br/><strong style="font-size:13px;color:${fc}">${v.fuelLevelPct}%</strong></div></div>
${load}
<div style="margin-top:8px"><button onclick="window.__shareTL__('${v.id}')" style="width:100%;padding:5px 0;font-size:11px;font-weight:600;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;cursor:pointer">Share Tracking Link</button></div></div>`;
}

// ── Component ──────────────────────────────────────────────────────
export function LiveMapPage() {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [provFilter, setProvFilter] = useState<'all' | ELDProvider>('all');
  const [selVehicle, setSelVehicle] = useState<MapVehicle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [trkVehicle, setTrkVehicle] = useState<MapVehicle | null>(null);
  const [links, setLinks] = useState<TrackingLink[]>(MOCK_LINKS);
  const [showLinks, setShowLinks] = useState(false);
  const [lnkCust, setLnkCust] = useState(''); const [lnkEmail, setLnkEmail] = useState('');
  const [lnkDur, setLnkDur] = useState(24); const [lnkLoad, setLnkLoad] = useState('');

  const vehicles = useMemo(() => provFilter === 'all' ? MOCK_VEHICLES : MOCK_VEHICLES.filter(v => v.provider === provFilter), [provFilter]);
  const st = useMemo(() => ({ total: MOCK_VEHICLES.length, moving: MOCK_VEHICLES.filter(v => v.speed > 0).length, idle: MOCK_VEHICLES.filter(v => v.engineStatus === 'IDLE').length, parked: MOCK_VEHICLES.filter(v => v.engineStatus === 'OFF').length, loaded: MOCK_VEHICLES.filter(v => v.loadNumber).length, activeLinks: links.filter(l => l.active).length }), [links]);

  useEffect(() => {
    (window as any).__shareTL__ = (id: string) => { const v = MOCK_VEHICLES.find(x => x.id === id); if (v) { setTrkVehicle(v); setLnkLoad(v.loadNumber || ''); setShowModal(true); } };
    return () => { delete (window as any).__shareTL__; };
  }, []);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const m = L.map(mapElRef.current, { center: [37.5, -95], zoom: 4 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(m);
    mapRef.current = m;
    return () => { m.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const m = mapRef.current; if (!m) return;
    Object.values(markersRef.current).forEach(mk => mk.remove());
    markersRef.current = {};
    vehicles.forEach(v => {
      const c = v.speed > 0 ? '#2563eb' : v.engineStatus === 'IDLE' ? '#eab308' : '#6b7280';
      const arr = v.speed > 0 ? `<div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);font-size:10px;color:${c}">&#9650;</div>` : '';
      const icon = L.divIcon({ className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -20],
        html: `<div style="position:relative;width:32px;height:32px">${arr}<div style="width:28px;height:28px;margin:2px;border-radius:6px;background:${c};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:8px;font-weight:700;font-family:system-ui">${v.unitNumber.replace('T-','')}</span></div></div>` });
      const mk = L.marker([v.lat, v.lng], { icon }).bindPopup(popupHTML(v), { maxWidth: 280 }).on('click', () => setSelVehicle(v)).addTo(m);
      markersRef.current[v.id] = mk;
    });
    if (vehicles.length > 0) m.fitBounds(L.latLngBounds(vehicles.map(v => [v.lat, v.lng])), { padding: [50, 50], maxZoom: 6 });
  }, [vehicles]);

  const panTo = (v: MapVehicle) => { setSelVehicle(v); mapRef.current?.setView([v.lat, v.lng], 10, { animate: true }); markersRef.current[v.id]?.openPopup(); };

  const createLink = () => {
    if (!trkVehicle || !lnkCust) return;
    const now = new Date(); const exp = new Date(now.getTime() + lnkDur * 3600000);
    setLinks(p => [{ id: `tl${Date.now()}`, unitNumber: trkVehicle.unitNumber, loadNumber: lnkLoad || trkVehicle.loadNumber || '', customerName: lnkCust, customerEmail: lnkEmail, duration: lnkDur, createdAt: now.toISOString(), expiresAt: exp.toISOString(), url: `https://track.geminiexpress.com/s/${Math.random().toString(36).slice(2,10)}`, active: true }, ...p]);
    setShowModal(false); setLnkCust(''); setLnkEmail(''); setLnkDur(24); setLnkLoad(''); setTrkVehicle(null); setShowLinks(true);
  };

  return (
    <div className="flex flex-col -m-6" style={{ height: 'calc(100vh - 40px)' }}>
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Live Map</h2>
          <div className="flex gap-4 text-xs text-gray-500">
            <span><strong className="text-gray-800">{st.total}</strong> vehicles</span>
            <span className="text-green-600"><strong>{st.moving}</strong> moving</span>
            <span className="text-yellow-600"><strong>{st.idle}</strong> idle</span>
            <span className="text-gray-400"><strong>{st.parked}</strong> parked</span>
            <span className="text-blue-600"><strong>{st.loaded}</strong> loaded</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLinks(!showLinks)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showLinks ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            Tracking Links {st.activeLinks > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">{st.activeLinks}</span>}
          </button>
          <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
            {(['all','motive','samsara'] as const).map(p => (
              <button key={p} onClick={() => setProvFilter(p)} className={`px-3 py-1.5 font-medium capitalize ${provFilter === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{p === 'all' ? 'All' : PROV[p].label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          {vehicles.map(v => (
            <button key={v.id} onClick={() => panTo(v)} className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-blue-50 transition-colors ${selVehicle?.id === v.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ENG_C[v.engineStatus] }} />
                <span className="text-xs font-semibold text-gray-900">{v.unitNumber}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PROV[v.provider].bg} ${PROV[v.provider].text}`} style={{ fontSize: '9px' }}>{PROV[v.provider].label}</span>
              </div>
              <p className="text-xs text-gray-600 ml-4">{v.driverName}</p>
              <div className="flex items-center gap-2 ml-4 mt-0.5">
                <span className="text-xs text-gray-400">{v.city}, {v.state}</span>
                {v.speed > 0 && <span className="text-xs text-blue-600 font-medium">{v.speed}mph</span>}
              </div>
              {v.loadNumber && <div className="ml-4 mt-1 flex items-center gap-1"><span className="text-xs text-blue-600 font-medium">{v.loadNumber}</span><span className="text-xs text-gray-400">→ {v.destination}</span></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <div ref={mapElRef} style={{ height: '100%', width: '100%' }} />
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-[1000]">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#2563eb' }} /><span className="text-gray-600">Moving</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#eab308' }} /><span className="text-gray-600">Idle</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#6b7280' }} /><span className="text-gray-600">Parked</span></div>
            </div>
          </div>

          {showLinks && (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000] max-h-96 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">Tracking Links</h3>
                <button onClick={() => setShowLinks(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {links.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No tracking links yet.</p>}
                {links.map(lk => (
                  <div key={lk.id} className={`p-3 rounded-lg mb-2 ${lk.active ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">{lk.unitNumber} · {lk.loadNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${lk.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{lk.active ? 'Active' : 'Revoked'}</span>
                    </div>
                    <p className="text-xs text-gray-600">{lk.customerName}</p>
                    <p className="text-xs text-gray-400">{lk.customerEmail}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400"><span>Duration: {lk.duration}h</span><span>·</span><span>Expires: {fmtDT(lk.expiresAt)}</span></div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="text" value={lk.url} readOnly className="flex-1 text-xs font-mono bg-white border border-gray-200 rounded px-2 py-1 text-gray-600" onClick={e => (e.target as HTMLInputElement).select()} />
                      <button onClick={() => navigator.clipboard.writeText(lk.url)} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Copy</button>
                      {lk.active && <button onClick={() => setLinks(p => p.map(l => l.id === lk.id ? { ...l, active: false } : l))} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">Revoke</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && trkVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Create Tracking Link</h2>
              <p className="text-xs text-gray-400 mt-0.5">Share real-time location of {trkVehicle.unitNumber}</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-gray-900">{trkVehicle.unitNumber}</span><span className="text-xs text-gray-500">·</span><span className="text-xs text-gray-600">{trkVehicle.driverName}</span></div>
                <p className="text-xs text-gray-500">{trkVehicle.city}, {trkVehicle.state} → {trkVehicle.destination || 'No active load'}</p>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Load Number</label><input type="text" value={lnkLoad} onChange={e => setLnkLoad(e.target.value)} placeholder="LD-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Customer Name *</label><input type="text" value={lnkCust} onChange={e => setLnkCust(e.target.value)} placeholder="Acme Corp" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Customer Email</label><input type="email" value={lnkEmail} onChange={e => setLnkEmail(e.target.value)} placeholder="logistics@acme.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Tracking Duration *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{v:4,l:'4 hours'},{v:12,l:'12 hours'},{v:24,l:'24 hours'},{v:48,l:'48 hours'}].map(o => (
                    <button key={o.v} onClick={() => setLnkDur(o.v)} className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${lnkDur === o.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{o.l}</button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">Or custom (hours)</label>
                  <input type="number" min={1} max={168} value={lnkDur} onChange={e => setLnkDur(parseInt(e.target.value)||24)} className="w-24 border border-gray-300 rounded px-2 py-1.5 text-xs" />
                  <span className="text-xs text-gray-400 ml-2">Expires: {new Date(Date.now()+lnkDur*3600000).toLocaleDateString('en-US',{month:'short',day:'numeric'})} at {new Date(Date.now()+lnkDur*3600000).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={createLink} disabled={!lnkCust} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Create & Copy Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
