// ── Driver API Service ─────────────────────────────────────────────
// Connects to the same backend as the TMS web app.
// Falls back to mock data when the API is unavailable.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DriverSession {
  driverId: string;
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitNumber: string;
  trailerNumber: string;
  provider: 'motive' | 'samsara';
  activated: boolean;
}

let session: DriverSession | null = null;

// Mock driver accounts (synced from TMS driver profiles)
const MOCK_DRIVER_ACCOUNTS: Record<string, DriverSession & { pin?: string }> = {
  'marcus.j@geminiexpress.com': { driverId: 'd1', token: 'mock-token-d1', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@geminiexpress.com', phone: '(555) 901-2345', unitNumber: 'T-1042', trailerNumber: 'TR-2201', provider: 'motive', activated: true, pin: '1234' },
  'sarah.c@geminiexpress.com': { driverId: 'd2', token: 'mock-token-d2', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.c@geminiexpress.com', phone: '(555) 234-5678', unitNumber: 'T-1038', trailerNumber: 'TR-2204', provider: 'samsara', activated: true, pin: '5678' },
  'james.w@geminiexpress.com': { driverId: 'd3', token: 'mock-token-d3', firstName: 'James', lastName: 'Williams', email: 'james.w@geminiexpress.com', phone: '(555) 567-8901', unitNumber: 'T-1055', trailerNumber: 'TR-2208', provider: 'motive', activated: false },
  'maria.r@geminiexpress.com': { driverId: 'd4', token: 'mock-token-d4', firstName: 'Maria', lastName: 'Rodriguez', email: 'maria.r@geminiexpress.com', phone: '(555) 678-9012', unitNumber: 'T-1061', trailerNumber: 'TR-2215', provider: 'samsara', activated: false },
  'david.k@geminiexpress.com': { driverId: 'd5', token: 'mock-token-d5', firstName: 'David', lastName: 'Kim', email: 'david.k@geminiexpress.com', phone: '(555) 789-0123', unitNumber: 'T-1029', trailerNumber: 'TR-2190', provider: 'motive', activated: false },
  'emily.t@geminiexpress.com': { driverId: 'd6', token: 'mock-token-d6', firstName: 'Emily', lastName: 'Taylor', email: 'emily.t@geminiexpress.com', phone: '(555) 345-6789', unitNumber: 'T-1044', trailerNumber: 'TR-2222', provider: 'samsara', activated: false },
  'robert.b@geminiexpress.com': { driverId: 'd7', token: 'mock-token-d7', firstName: 'Robert', lastName: 'Brown', email: 'robert.b@geminiexpress.com', phone: '(555) 456-7890', unitNumber: 'T-1070', trailerNumber: 'TR-2231', provider: 'motive', activated: true, pin: '9999' },
  'lisa.n@geminiexpress.com': { driverId: 'd8', token: 'mock-token-d8', firstName: 'Lisa', lastName: 'Nguyen', email: 'lisa.n@geminiexpress.com', phone: '(555) 012-3456', unitNumber: 'T-1033', trailerNumber: 'TR-2199', provider: 'samsara', activated: false },
};

// Also index by phone for phone login
const PHONE_TO_EMAIL: Record<string, string> = {};
Object.values(MOCK_DRIVER_ACCOUNTS).forEach(d => {
  const digits = d.phone.replace(/\D/g, '');
  PHONE_TO_EMAIL[digits] = d.email;
  PHONE_TO_EMAIL[d.phone] = d.email;
});

// ── Lookup driver by email or phone ────────────────────────────────
export async function lookupDriver(identifier: string): Promise<{ found: boolean; activated: boolean; driverName?: string; maskedContact?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/driver-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }

  // Mock fallback
  const normalized = identifier.trim().toLowerCase();
  const digits = normalized.replace(/\D/g, '');
  const email = MOCK_DRIVER_ACCOUNTS[normalized] ? normalized : PHONE_TO_EMAIL[digits] || PHONE_TO_EMAIL[identifier];
  const acct = email ? MOCK_DRIVER_ACCOUNTS[email] : null;

  if (!acct) return { found: false, activated: false };
  return {
    found: true,
    activated: acct.activated,
    driverName: `${acct.firstName} ${acct.lastName}`,
    maskedContact: acct.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
  };
}

// ── First-time activation: set PIN/password ────────────────────────
export async function activateDriver(identifier: string, pin: string): Promise<DriverSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/driver-activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, pin }),
    });
    if (res.ok) {
      const data = await res.json();
      session = data;
      localStorage.setItem('driver_session', JSON.stringify(data));
      return data;
    }
  } catch (e) { /* fallback */ }

  // Mock fallback
  const normalized = identifier.trim().toLowerCase();
  const digits = normalized.replace(/\D/g, '');
  const email = MOCK_DRIVER_ACCOUNTS[normalized] ? normalized : PHONE_TO_EMAIL[digits] || PHONE_TO_EMAIL[identifier];
  const acct = email ? MOCK_DRIVER_ACCOUNTS[email] : null;
  if (!acct) throw new Error('Driver not found');

  acct.activated = true;
  acct.pin = pin;
  session = { ...acct };
  localStorage.setItem('driver_session', JSON.stringify(session));
  return session;
}

// ── Login with PIN/password ────────────────────────────────────────
export async function driverLogin(identifier: string, pin: string): Promise<DriverSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/driver-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, pin }),
    });
    if (res.ok) {
      const data = await res.json();
      session = data;
      localStorage.setItem('driver_session', JSON.stringify(data));
      return data;
    }
  } catch (e) { /* fallback */ }

  // Mock fallback
  const normalized = identifier.trim().toLowerCase();
  const digits = normalized.replace(/\D/g, '');
  const email = MOCK_DRIVER_ACCOUNTS[normalized] ? normalized : PHONE_TO_EMAIL[digits] || PHONE_TO_EMAIL[identifier];
  const acct = email ? MOCK_DRIVER_ACCOUNTS[email] : null;

  if (!acct) throw new Error('No account found with that email or phone number');
  if (!acct.activated) throw new Error('NEEDS_ACTIVATION');
  if (acct.pin !== pin) throw new Error('Incorrect PIN or password');

  session = { ...acct };
  localStorage.setItem('driver_session', JSON.stringify(session));
  return session;
}

export function driverLogout() {
  session = null;
  localStorage.removeItem('driver_session');
}

export function getSession(): DriverSession | null {
  if (session) return session;
  const stored = localStorage.getItem('driver_session');
  if (stored) { session = JSON.parse(stored); return session; }
  return null;
}

// ── Authenticated fetch helper ─────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
  const s = getSession();
  if (!s) throw new Error('Not authenticated');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${s.token}`,
      'X-Driver-ID': s.driverId,
      ...options.headers,
    },
  });
}

// ── Loads (filtered by driver) ─────────────────────────────────────
export async function getAssignedLoads() {
  try {
    const res = await apiFetch(`/loads?driverId=${getSession()?.driverId}&status=active`);
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null; // caller uses mock fallback
}

export async function updateLoadStatus(loadId: string, newStatus: string) {
  try {
    const res = await apiFetch(`/loads/${loadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, timestamp: new Date().toISOString(), driverId: getSession()?.driverId }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── Documents ──────────────────────────────────────────────────────
export async function getDocuments(loadId: string) {
  try {
    const res = await apiFetch(`/loads/${loadId}/documents`);
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

export async function uploadDocument(loadId: string, file: File, docType: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('loadId', loadId);
    formData.append('driverId', getSession()?.driverId || '');
    const s = getSession();
    const res = await fetch(`${API_BASE}/loads/${loadId}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${s?.token}`, 'X-Driver-ID': s?.driverId || '' },
      body: formData,
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── HOS ────────────────────────────────────────────────────────────
export async function getHOS() {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/hos`);
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

export async function updateHOSStatus(newStatus: string) {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/hos/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, timestamp: new Date().toISOString() }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── DVIR ───────────────────────────────────────────────────────────
export async function submitDVIR(type: string, items: any[], defectsFound: boolean) {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/dvir`, {
      method: 'POST',
      body: JSON.stringify({ type, items, defectsFound, unitNumber: getSession()?.unitNumber, timestamp: new Date().toISOString() }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── Messages ───────────────────────────────────────────────────────
export async function getMessages() {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/messages`);
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

export async function sendDriverMessage(text: string) {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, timestamp: new Date().toISOString() }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── Fuel & Expenses ────────────────────────────────────────────────
export async function logFuelStop(data: any) {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/fuel`, {
      method: 'POST',
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

export async function logExpense(data: any) {
  try {
    const res = await apiFetch(`/drivers/${getSession()?.driverId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
    });
    if (res.ok) return res.json();
  } catch (e) { /* fallback */ }
  return null;
}

// ── GPS Location Push ──────────────────────────────────────────────
export async function pushLocation(lat: number, lng: number, speed: number, heading: string) {
  try {
    await apiFetch(`/tracking/location`, {
      method: 'POST',
      body: JSON.stringify({ driverId: getSession()?.driverId, unitNumber: getSession()?.unitNumber, lat, lng, speed, heading, timestamp: new Date().toISOString() }),
    });
  } catch (e) { /* silent fail */ }
}
