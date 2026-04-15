import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────
type SettingsSection = 'profile' | 'company' | 'users' | 'integrations' | 'edi' | 'email' | 'billing' | 'api' | 'developer_portal';
type UserRole = 'FULL_ADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATIONS' | 'ACCOUNTING';

interface TeamMember {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  role: UserRole; status: 'ACTIVE' | 'INVITED' | 'DISABLED'; lastLogin: string; avatar: string;
  cfsLocation: string; // CFS station restriction — empty means ALL locations
}

interface APIKey {
  id: string; name: string; description: string; clientId: string; clientSecret: string;
  createdAt: string; lastUsed: string; expiresAt: string | null;
  status: 'ACTIVE' | 'REVOKED'; permissions: string[];
}

interface Integration {
  id: string; name: string; provider: string; type: string; status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync: string; icon: string; description: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_TEAM: TeamMember[] = [
  { id: 'u1', firstName: 'Jake', lastName: 'Martinez', email: 'jake.martinez@geminiexpress.com', phone: '(555) 100-0001', role: 'FULL_ADMIN', status: 'ACTIVE', lastLogin: '2026-04-13T12:30:00Z', avatar: 'JM', cfsLocation: '' },
  { id: 'u2', firstName: 'Henry', lastName: 'Fung', email: 'henry.fung@geminiexpress.com', phone: '(555) 100-0002', role: 'FULL_ADMIN', status: 'ACTIVE', lastLogin: '2026-04-13T14:00:00Z', avatar: 'HF', cfsLocation: '' },
  { id: 'u3', firstName: 'Karen', lastName: 'Liu', email: 'karen.liu@geminiexpress.com', phone: '(555) 100-0003', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-04-13T09:15:00Z', avatar: 'KL', cfsLocation: '' },
  { id: 'u4', firstName: 'Mike', lastName: 'Santos', email: 'mike.santos@geminiexpress.com', phone: '(555) 100-0004', role: 'MANAGER', status: 'ACTIVE', lastLogin: '2026-04-12T18:00:00Z', avatar: 'MS', cfsLocation: 'JFK' },
  { id: 'u5', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@geminiexpress.com', phone: '(555) 100-0005', role: 'OPERATIONS', status: 'ACTIVE', lastLogin: '2026-04-13T10:00:00Z', avatar: 'PP', cfsLocation: 'JFK' },
  { id: 'u6', firstName: 'Tom', lastName: 'Garcia', email: 'tom.garcia@geminiexpress.com', phone: '(555) 100-0006', role: 'OPERATIONS', status: 'ACTIVE', lastLogin: '2026-04-13T08:30:00Z', avatar: 'TG', cfsLocation: 'MIA' },
  { id: 'u7', firstName: 'Linda', lastName: 'Kim', email: 'linda.kim@geminiexpress.com', phone: '(555) 100-0007', role: 'ACCOUNTING', status: 'ACTIVE', lastLogin: '2026-04-12T16:00:00Z', avatar: 'LK', cfsLocation: '' },
  { id: 'u8', firstName: 'Rachel', lastName: 'Thompson', email: 'rachel.t@geminiexpress.com', phone: '', role: 'OPERATIONS', status: 'INVITED', lastLogin: '', avatar: 'RT', cfsLocation: 'ORD' },
];

const MOCK_API_KEYS: APIKey[] = [
  { id: 'ak1', name: 'GeminiProd', description: 'Production — full API access', clientId: 'kkwAojxFs2ccslyxyGx1NYALNJD9Qb', clientSecret: '••••••••••••••••••••••••••••••', createdAt: '2026-01-15', lastUsed: '2026-04-13T12:00:00Z', expiresAt: null, status: 'ACTIVE', permissions: ['loads.read', 'loads.write', 'drivers.read', 'drivers.write', 'assets.read', 'assets.write', 'tracking.read', 'accounting.read', 'accounting.write', 'reports.read', 'webhooks.manage'] },
  { id: 'ak2', name: 'StagingTest', description: 'Staging — limited read access', clientId: 'XiQjGNEsc8m5Pns5aMsYUKlcBk4zRt', clientSecret: '••••••••••••••••••••••••••••••', createdAt: '2026-03-01', lastUsed: '2026-04-10T09:00:00Z', expiresAt: '2026-09-24', status: 'ACTIVE', permissions: ['loads.read', 'drivers.read', 'assets.read', 'tracking.read', 'reports.read'] },
  { id: 'ak3', name: 'OldPartnerKey', description: 'Deprecated partner integration', clientId: 'x1y2z3aBcDeFgHiJkLmNoPqRsTuVwX', clientSecret: '••••••••••••••••••••••••••••••', createdAt: '2025-06-10', lastUsed: '2025-12-01T14:00:00Z', expiresAt: '2026-01-01', status: 'REVOKED', permissions: ['loads.read', 'tracking.read'] },
];

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int1', name: 'CargoWise One', provider: 'WiseTech Global', type: 'Accounting / TMS', status: 'CONNECTED', lastSync: '2026-04-13T12:30:00Z', icon: '📊', description: 'Push loads, sync invoices, and manage AR/AP through CargoWise.' },
  { id: 'int2', name: 'Motive (KeepTruckin)', provider: 'Motive Technologies', type: 'ELD / Telematics', status: 'CONNECTED', lastSync: '2026-04-13T12:32:00Z', icon: '🟠', description: 'GPS tracking, HOS, IFTA mileage, fuel cards, dashcam events.' },
  { id: 'int3', name: 'Samsara', provider: 'Samsara Inc.', type: 'ELD / Telematics', status: 'CONNECTED', lastSync: '2026-04-13T12:28:00Z', icon: '🟢', description: 'GPS tracking, HOS, IFTA mileage, AI dashcam, temperature monitoring.' },
  { id: 'int4', name: 'QuickBooks Online', provider: 'Intuit', type: 'Accounting', status: 'DISCONNECTED', lastSync: '', icon: '💰', description: 'Sync invoices, payments, and chart of accounts.' },
  { id: 'int5', name: 'TriumphPay', provider: 'Triumph Financial', type: 'Factoring / Payments', status: 'CONNECTED', lastSync: '2026-04-14T10:00:00Z', icon: '🏦', description: 'Automated carrier payment network — audit, match, and pay carriers.' },
  { id: 'int5b', name: 'RTS Financial', provider: 'RTS Financial Services', type: 'Factoring / Quick-Pay', status: 'CONNECTED', lastSync: '2026-04-14T09:30:00Z', icon: '💳', description: 'Quick-pay factoring — same-day carrier funding with 3% fee.' },
  { id: 'int5c', name: 'OTR Solutions', provider: 'OTR Solutions Inc.', type: 'Factoring / Quick-Pay', status: 'CONNECTED', lastSync: '2026-04-13T14:00:00Z', icon: '🚛', description: 'Carrier factoring, fuel card programs, and quick-pay services.' },
  { id: 'int6', name: 'DAT Load Board', provider: 'DAT Solutions', type: 'Load Board', status: 'CONNECTED', lastSync: '2026-04-13T11:00:00Z', icon: '📋', description: 'Post loads, search trucks, rate intelligence.' },
  { id: 'int7', name: 'Truckstop.com', provider: 'Truckstop', type: 'Load Board', status: 'CONNECTED', lastSync: '2026-04-13T10:30:00Z', icon: '🚛', description: 'Load posting, rate analytics, carrier onboarding.' },
  { id: 'int8', name: 'RMIS (Registry Monitoring)', provider: 'RMIS', type: 'Carrier Compliance', status: 'CONNECTED', lastSync: '2026-04-12T06:00:00Z', icon: '🛡', description: 'Automated carrier monitoring — insurance, authority, safety scores.' },
  { id: 'int9', name: 'I-PASS', provider: 'Illinois Tollway', type: 'Tolls', status: 'CONNECTED', lastSync: '2026-04-13T06:00:00Z', icon: '🛣', description: 'Illinois Tollway transponder integration — automatic toll tracking, transaction history, and account balance sync.' },
  { id: 'int10', name: 'E-ZPass New York', provider: 'NY Thruway Authority', type: 'Tolls', status: 'CONNECTED', lastSync: '2026-04-13T05:30:00Z', icon: '🛣', description: 'E-ZPass NY toll transactions — automated toll tracking across NY, NJ, PA, and 18 other E-ZPass states.' },
  { id: 'int11', name: 'Bestpass', provider: 'Bestpass / Fleetworthy', type: 'Tolls', status: 'DISCONNECTED', lastSync: '', icon: '🏷', description: 'Consolidated toll management — single account for all toll roads, bridges, and tunnels nationwide.' },
];

// ── Helpers ────────────────────────────────────────────────────────
const ROLE_BADGES: Record<UserRole, { bg: string; text: string; label: string }> = {
  FULL_ADMIN: { bg: 'bg-red-100', text: 'text-red-800', label: 'Full Admin' },
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin' },
  MANAGER: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Manager' },
  OPERATIONS: { bg: 'bg-green-100', text: 'text-green-800', label: 'Operations' },
  ACCOUNTING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Accounting' },
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  FULL_ADMIN: ['All modules', 'User management', 'Billing', 'API keys', 'Integrations', 'Company settings', 'Delete data'],
  ADMIN: ['All modules', 'User management', 'Integrations', 'Company settings'],
  MANAGER: ['Loads', 'Dispatch', 'Drivers', 'Assets', 'Reports', 'Fleet Intelligence', 'Live Map', 'Safety'],
  OPERATIONS: ['Loads', 'Dispatch', 'Drivers', 'Assets', 'Fleet Intelligence', 'Live Map'],
  ACCOUNTING: ['Accounting', 'Reports', 'Companies (view)', 'Billing'],
};

const INT_STATUS: Record<string, string> = { CONNECTED: 'bg-green-100 text-green-800', DISCONNECTED: 'bg-gray-100 text-gray-500', ERROR: 'bg-red-100 text-red-800' };

function fmtDT(d: string) { if (!d) return '—'; const t = new Date(d); return `${t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} ${t.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`; }
function fmtDate(d: string) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

// ── Component ──────────────────────────────────────────────────────
export function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>('company');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
  const [expandedCred, setExpandedCred] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('OPERATIONS');
  const [newKeyName, setNewKeyName] = useState('');

  const NAV: { id: SettingsSection; label: string; icon: string }[] = [
    { id: 'company', label: 'Company Profile', icon: '🏢' },
    { id: 'users', label: 'Users & Access', icon: '👥' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'edi', label: 'EDI & Visibility', icon: '📡' },
    { id: 'email', label: 'Email', icon: '✉' },
    { id: 'api', label: 'API Access', icon: '🔑' },
    { id: 'developer_portal', label: 'Developer Portal', icon: '📖' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className="flex gap-6 -m-6">
      {/* Settings Sidebar */}
      <div className="w-52 bg-white border-r border-gray-200 min-h-screen pt-6 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 px-5 mb-4">Settings</h2>
        <nav className="space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)} className={`w-full text-left px-5 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${section === n.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 py-6 pr-6 max-w-4xl">

        {/* ── Company Profile ──────────────────────────────────── */}
        {section === 'company' && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Company Profile</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label><input type="text" defaultValue="Gemini Express Transport Corp" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">DBA</label><input type="text" defaultValue="Gemini Express" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">MC Number</label><input type="text" defaultValue="MC-1234567" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">DOT Number</label><input type="text" defaultValue="DOT-9876543" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">SCAC Code</label><input type="text" defaultValue="GMEX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">EIN</label><input type="text" defaultValue="XX-XXXXXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Address</label><input type="text" defaultValue="1234 Logistics Blvd, Suite 100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input type="text" defaultValue="Memphis" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 mb-1">State</label><input type="text" defaultValue="TN" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-xs font-medium text-gray-700 mb-1">ZIP</label><input type="text" defaultValue="38118" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone</label><input type="tel" defaultValue="(555) 000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Website</label><input type="url" defaultValue="https://www.geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end pt-2"><button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Changes</button></div>
            </div>
          </div>
        )}

        {/* ── Users & Access ───────────────────────────────────── */}
        {section === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Users & Access Levels</h3>
              <button onClick={() => setShowInviteModal(true)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">+ Invite User</button>
            </div>

            {/* Role Legend */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">Access Level Permissions</h4>
              <div className="grid grid-cols-5 gap-3">
                {(Object.entries(ROLE_PERMISSIONS) as [UserRole, string[]][]).map(([role, perms]) => (
                  <div key={role} className="text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-medium mb-1.5 ${ROLE_BADGES[role].bg} ${ROLE_BADGES[role].text}`}>{ROLE_BADGES[role].label}</span>
                    <ul className="space-y-0.5">
                      {perms.map(p => <li key={p} className="text-gray-500">• {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">User</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Role</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">CFS Location</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Modules</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Login</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>
                  {MOCK_TEAM.map(u => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">{u.avatar}</div>
                          <div><p className="text-xs font-medium text-gray-900">{u.firstName} {u.lastName}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <select defaultValue={u.role} className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer ${ROLE_BADGES[u.role].bg} ${ROLE_BADGES[u.role].text}`} onChange={e => { /* update role */ }}>
                          {(Object.keys(ROLE_BADGES) as UserRole[]).map(r => <option key={r} value={r}>{ROLE_BADGES[r].label}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        {u.role === 'FULL_ADMIN' || u.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">All Locations</span>
                        ) : u.cfsLocation ? (
                          <select defaultValue={u.cfsLocation} className="text-xs font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer bg-violet-100 text-violet-800">
                            <option value="JFK">JFK</option>
                            <option value="MIA">MIA</option>
                            <option value="ORD">ORD</option>
                            <option value="LAX">LAX</option>
                            <option value="ATL">ATL</option>
                            <option value="DFW">DFW</option>
                            <option value="">All Locations</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {(u.role === 'FULL_ADMIN' || u.role === 'ADMIN') ? (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">All</span>
                          ) : (
                            <>
                              {['OPERATIONS', 'MANAGER'].includes(u.role) && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">🚛</span>}
                              {u.role !== 'ACCOUNTING' && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">📦</span>}
                              {u.cfsLocation && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800">✈</span>}
                              {u.role === 'ACCOUNTING' && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">💰</span>}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : u.status === 'INVITED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{u.lastLogin ? fmtDT(u.lastLogin) : <span className="text-gray-400 italic">Never</span>}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Edit</button>
                          {u.status === 'INVITED' && <button className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded hover:bg-gray-100">Resend</button>}
                          {u.status !== 'DISABLED' && <button className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Disable</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-4">
              <div className="px-4 py-3 border-b border-gray-200"><h4 className="text-sm font-semibold text-gray-900">Role-Based Permission Matrix</h4></div>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 w-48">Page / Feature</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Full Admin</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Admin</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Manager</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Operations</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Accounting</th>
              </tr></thead><tbody>
                {[
                  { page: 'Dashboard', perms: ['full', 'full', 'full', 'view', 'view'] },
                  { page: 'Loads / Shipments', perms: ['full', 'full', 'full', 'full', 'view'] },
                  { page: 'Dispatch', perms: ['full', 'full', 'full', 'full', 'none'] },
                  { page: 'Drivers', perms: ['full', 'full', 'edit', 'view', 'none'] },
                  { page: 'Assets / Fleet', perms: ['full', 'full', 'edit', 'view', 'none'] },
                  { page: 'Carriers / LSP', perms: ['full', 'full', 'full', 'edit', 'view'] },
                  { page: 'Customers', perms: ['full', 'full', 'full', 'view', 'view'] },
                  { page: 'Accounting (AR/AP)', perms: ['full', 'full', 'view', 'none', 'full'] },
                  { page: 'Billing / Invoices', perms: ['full', 'full', 'view', 'none', 'full'] },
                  { page: 'Reports', perms: ['full', 'full', 'full', 'view', 'full'] },
                  { page: 'Safety & Claims', perms: ['full', 'full', 'full', 'edit', 'none'] },
                  { page: 'CFS Operations', perms: ['full', 'full', 'full', 'full', 'view'] },
                  { page: 'Customs / Compliance', perms: ['full', 'full', 'full', 'edit', 'none'] },
                  { page: 'Settings', perms: ['full', 'edit', 'none', 'none', 'none'] },
                  { page: 'User Management', perms: ['full', 'full', 'none', 'none', 'none'] },
                  { page: 'API Access / EDI', perms: ['full', 'edit', 'none', 'none', 'none'] },
                  { page: 'Audit Trail', perms: ['full', 'full', 'view', 'none', 'view'] },
                ].map((row, i) => {
                  const permIcon: Record<string, { icon: string; color: string }> = { full: { icon: '✓', color: 'text-green-600 bg-green-50' }, edit: { icon: '✎', color: 'text-blue-600 bg-blue-50' }, view: { icon: '👁', color: 'text-gray-500 bg-gray-50' }, none: { icon: '—', color: 'text-gray-300 bg-white' } };
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{row.page}</td>
                      {row.perms.map((p, j) => { const s = permIcon[p]; return <td key={j} className="text-center px-2 py-2"><span className={`inline-block w-6 h-6 rounded text-xs font-bold leading-6 ${s.color}`}>{s.icon}</span></td>; })}
                    </tr>
                  );
                })}
              </tbody></table>
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                <span><span className="text-green-600 font-bold">✓</span> Full Access</span>
                <span><span className="text-blue-600 font-bold">✎</span> Edit</span>
                <span><span className="text-gray-500">👁</span> View Only</span>
                <span><span className="text-gray-300">—</span> No Access</span>
              </div>
            </div>

            {/* CFS Location Assignment */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-4">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div><h4 className="text-sm font-semibold text-gray-900">CFS Location-Based Access Control</h4><p className="text-xs text-gray-400 mt-0.5">Restrict Operations users to see only their assigned CFS station</p></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">Enforced</span></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                  <strong>How it works:</strong> When a user is assigned to a specific CFS location (e.g., JFK), they will only see import/export orders, warehouse inventory, customs entries, dispatch trips, and billing for that station. Full Admin and Admin roles always see all locations.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { station: 'JFK — John F. Kennedy Intl', city: 'New York, NY', users: MOCK_TEAM.filter(u => u.cfsLocation === 'JFK'), color: 'border-blue-200 bg-blue-50' },
                    { station: 'MIA — Miami Intl', city: 'Miami, FL', users: MOCK_TEAM.filter(u => u.cfsLocation === 'MIA'), color: 'border-orange-200 bg-orange-50' },
                    { station: 'ORD — O\'Hare Intl', city: 'Chicago, IL', users: MOCK_TEAM.filter(u => u.cfsLocation === 'ORD'), color: 'border-green-200 bg-green-50' },
                    { station: 'LAX — Los Angeles Intl', city: 'Los Angeles, CA', users: [] as TeamMember[], color: 'border-gray-200 bg-gray-50' },
                    { station: 'ATL — Hartsfield-Jackson', city: 'Atlanta, GA', users: [] as TeamMember[], color: 'border-gray-200 bg-gray-50' },
                    { station: 'DFW — Dallas/Fort Worth', city: 'Dallas, TX', users: [] as TeamMember[], color: 'border-gray-200 bg-gray-50' },
                  ].map((loc, i) => (
                    <div key={i} className={`rounded-lg border p-3 ${loc.color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div><p className="text-xs font-bold text-gray-800">{loc.station}</p><p className="text-xs text-gray-400">{loc.city}</p></div>
                        <span className="text-xs font-medium text-gray-500">{loc.users.length} user{loc.users.length !== 1 ? 's' : ''}</span>
                      </div>
                      {loc.users.length > 0 ? (
                        <div className="space-y-1">{loc.users.map(u => (
                          <div key={u.id} className="flex items-center justify-between py-1 px-2 bg-white rounded">
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">{u.avatar}</div><span className="text-xs text-gray-800">{u.firstName} {u.lastName}</span></div>
                            <span className={`text-xs font-medium ${ROLE_BADGES[u.role].text}`}>{ROLE_BADGES[u.role].label}</span>
                          </div>
                        ))}</div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No users assigned</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                  <p><strong>Access rules:</strong></p>
                  <p>• <strong>Full Admin / Admin:</strong> See all CFS locations — no restriction</p>
                  <p>• <strong>Manager:</strong> Assigned location only — can view/edit orders, dispatch, customs for their station</p>
                  <p>• <strong>Operations:</strong> Assigned location only — can only see and process shipments at their CFS station</p>
                  <p>• <strong>Accounting:</strong> All locations (billing is cross-location) — but CFS operations read-only</p>
                  <p>• <strong>Data filtered:</strong> Import Orders, Export Orders, Warehouse, Customs, Dispatch, Billing — all filtered by user's CFS location</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Integrations ─────────────────────────────────────── */}
        {section === 'integrations' && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Integrations</h3>
            <div className="space-y-3">
              {MOCK_INTEGRATIONS.map(int => (
                <div key={int.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <div className="text-2xl w-10 text-center">{int.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{int.name}</span>
                      <span className="text-xs text-gray-400">by {int.provider}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INT_STATUS[int.status]}`}>{int.status === 'CONNECTED' ? 'Connected' : int.status === 'ERROR' ? 'Error' : 'Not Connected'}</span>
                    </div>
                    <p className="text-xs text-gray-500">{int.description}</p>
                    {int.lastSync && <p className="text-xs text-gray-400 mt-1">Last sync: {fmtDT(int.lastSync)}</p>}
                  </div>
                  <div className="flex gap-2">
                    {int.status === 'CONNECTED' ? (
                      <>
                        <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">Configure</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Disconnect</button>
                      </>
                    ) : (
                      <button className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Connect</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EDI & Visibility ─────────────────────────────────── */}
        {section === 'edi' && (() => {
          const EDI_TRANSACTIONS = [
            { id: 'e1', type: '204', direction: 'IN', partner: 'Acme Manufacturing', ref: 'SH-10428', status: 'ACCEPTED', timestamp: '2026-04-14T09:15:00Z', details: 'Load tender — Detroit, MI → Columbus, OH, 45,000 lbs' },
            { id: 'e2', type: '990', direction: 'OUT', partner: 'Acme Manufacturing', ref: 'SH-10428', status: 'SENT', timestamp: '2026-04-14T09:16:00Z', details: 'Tender accepted — auto-response' },
            { id: 'e3', type: '214', direction: 'OUT', partner: 'Heartland Foods', ref: 'SH-10432', status: 'SENT', timestamp: '2026-04-14T08:30:00Z', details: 'Status: In Transit — Omaha, NE' },
            { id: 'e4', type: '214', direction: 'OUT', partner: 'Acme Manufacturing', ref: 'SH-10421', status: 'SENT', timestamp: '2026-04-14T08:00:00Z', details: 'Status: In Transit — Bowling Green, KY' },
            { id: 'e5', type: '204', direction: 'IN', partner: 'Pacific Retail Group', ref: 'SH-10430', status: 'ACCEPTED', timestamp: '2026-04-14T05:10:00Z', details: 'Load tender — Houston, TX → Atlanta, GA, 40,000 lbs' },
            { id: 'e6', type: '990', direction: 'OUT', partner: 'Pacific Retail Group', ref: 'SH-10430', status: 'SENT', timestamp: '2026-04-14T05:11:00Z', details: 'Tender accepted — auto-response' },
            { id: 'e7', type: '210', direction: 'OUT', partner: 'Great Lakes Chemicals', ref: 'SH-10425', status: 'SENT', timestamp: '2026-04-13T16:00:00Z', details: 'Invoice $1,600.00 — INV-20260310' },
            { id: 'e8', type: '997', direction: 'IN', partner: 'Great Lakes Chemicals', ref: 'SH-10425', status: 'ACKNOWLEDGED', timestamp: '2026-04-13T16:05:00Z', details: 'Functional ACK for 210 invoice' },
            { id: 'e9', type: '214', direction: 'OUT', partner: 'NorthPoint Logistics', ref: 'SH-10426', status: 'SENT', timestamp: '2026-04-13T14:15:00Z', details: 'Status: In Transit — Lafayette, IN' },
            { id: 'e10', type: '210', direction: 'OUT', partner: 'Summit Healthcare', ref: 'SH-10429', status: 'SENT', timestamp: '2026-04-12T15:00:00Z', details: 'Invoice $1,200.00 — INV-20260301' },
            { id: 'e11', type: '204', direction: 'IN', partner: 'Southeastern Steel', ref: 'SH-10424', status: 'REJECTED', timestamp: '2026-04-11T14:00:00Z', details: 'Load tender rejected — no flatbed capacity available' },
            { id: 'e12', type: '990', direction: 'OUT', partner: 'Southeastern Steel', ref: 'SH-10424', status: 'SENT', timestamp: '2026-04-11T14:01:00Z', details: 'Tender declined — reason: capacity' },
          ];
          const TYPE_BADGE: Record<string, string> = { '204': 'bg-blue-100 text-blue-800', '990': 'bg-purple-100 text-purple-800', '214': 'bg-green-100 text-green-800', '210': 'bg-orange-100 text-orange-800', '997': 'bg-gray-100 text-gray-700' };
          const TYPE_LABEL: Record<string, string> = { '204': 'Load Tender', '990': 'Tender Response', '214': 'Status Update', '210': 'Invoice', '997': 'Func. ACK' };
          const STATUS_BADGE: Record<string, string> = { ACCEPTED: 'bg-green-100 text-green-800', SENT: 'bg-blue-100 text-blue-800', REJECTED: 'bg-red-100 text-red-800', ACKNOWLEDGED: 'bg-gray-100 text-gray-700', FAILED: 'bg-red-100 text-red-800' };
          const fmtDT2 = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
          return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-base font-semibold text-gray-900">EDI & Visibility</h3><p className="text-xs text-gray-400 mt-0.5">Electronic Data Interchange — load tenders, status updates, and invoices</p></div>
            </div>

            {/* EDI Summary Cards */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {[
                { label: 'EDI 204', sub: 'Load Tenders', count: EDI_TRANSACTIONS.filter(e => e.type === '204').length, color: 'text-blue-600' },
                { label: 'EDI 990', sub: 'Responses', count: EDI_TRANSACTIONS.filter(e => e.type === '990').length, color: 'text-purple-600' },
                { label: 'EDI 214', sub: 'Status Updates', count: EDI_TRANSACTIONS.filter(e => e.type === '214').length, color: 'text-green-600' },
                { label: 'EDI 210', sub: 'Invoices', count: EDI_TRANSACTIONS.filter(e => e.type === '210').length, color: 'text-orange-600' },
                { label: 'Errors', sub: 'Rejected / Failed', count: EDI_TRANSACTIONS.filter(e => e.status === 'REJECTED' || e.status === 'FAILED').length, color: EDI_TRANSACTIONS.some(e => e.status === 'REJECTED') ? 'text-red-600' : 'text-gray-400' },
              ].map(c => (
                <div key={c.label} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color}`}>{c.count}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* EDI Partners & Configuration */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">EDI Trading Partners</h4>
                <div className="space-y-2">
                  {[
                    { partner: 'Acme Manufacturing', isaId: 'ACME001', types: ['204', '990', '214', '210'], status: 'Active' },
                    { partner: 'Heartland Foods', isaId: 'HTFD001', types: ['204', '990', '214'], status: 'Active' },
                    { partner: 'Pacific Retail Group', isaId: 'PCRG001', types: ['204', '990', '214', '210'], status: 'Active' },
                    { partner: 'Great Lakes Chemicals', isaId: 'GLCH001', types: ['204', '990', '210', '997'], status: 'Active' },
                    { partner: 'Southeastern Steel', isaId: 'SEST001', types: ['204', '990'], status: 'Active' },
                    { partner: 'NorthPoint Logistics', isaId: 'NPTL001', types: ['214'], status: 'Active' },
                    { partner: 'Summit Healthcare', isaId: 'SMHS001', types: ['210'], status: 'Pending' },
                  ].map(p => (
                    <div key={p.partner} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-xs font-semibold text-gray-800">{p.partner}</span>
                        <span className="ml-2 text-xs font-mono text-gray-400">ISA: {p.isaId}</span>
                        <div className="flex gap-1 mt-1">{p.types.map(t => <span key={t} className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[t]}`}>{t}</span>)}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Automation Rules</h4>
                <div className="space-y-2">
                  {[
                    { rule: 'Auto-accept 204 Load Tenders', desc: 'Automatically accept inbound tenders from approved partners and create shipments', enabled: true },
                    { rule: 'Auto-send 990 Response', desc: 'Send tender accept/reject response within 60 seconds of 204 receipt', enabled: true },
                    { rule: 'Auto-send 214 on status change', desc: 'Push shipment status updates (pickup, in-transit, delivered) to shipper via EDI', enabled: true },
                    { rule: 'Auto-send 210 on delivery', desc: 'Generate and send EDI invoice when shipment is marked delivered', enabled: false },
                    { rule: 'Auto-acknowledge 997', desc: 'Send functional acknowledgement for all received EDI transactions', enabled: true },
                    { rule: 'Reject tenders over weight limit', desc: 'Auto-reject 204 tenders exceeding 48,000 lbs', enabled: false },
                  ].map(r => (
                    <div key={r.rule} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div><span className="text-xs font-medium text-gray-800">{r.rule}</span><br/><span className="text-xs text-gray-400">{r.desc}</span></div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" defaultChecked={r.enabled} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  ))}
                </div>
                <hr className="my-3" />
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Tracking Visibility</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Customer tracking links', desc: 'Allow customers to view real-time location via shareable links', enabled: true },
                    { label: 'Macropoint / FourKites', desc: 'Auto-push GPS updates to visibility platforms', enabled: false },
                    { label: 'Trucker Tools tracking', desc: 'Digital freight matching and real-time tracking', enabled: true },
                  ].map(v => (
                    <div key={v.label} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div><span className="text-xs font-medium text-gray-800">{v.label}</span><br/><span className="text-xs text-gray-400">{v.desc}</span></div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" defaultChecked={v.enabled} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EDI Transaction Log */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">EDI Transaction Log</h4>
                <span className="text-xs text-gray-400">{EDI_TRANSACTIONS.length} transactions</span>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Timestamp</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Direction</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Partner</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Ref #</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Details</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                </tr></thead>
                <tbody>
                  {EDI_TRANSACTIONS.map(e => (
                    <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${e.status === 'REJECTED' ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{fmtDT2(e.timestamp)}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-bold ${TYPE_BADGE[e.type]}`}>{e.type}</span><br/><span className="text-xs text-gray-400">{TYPE_LABEL[e.type]}</span></td>
                      <td className="px-3 py-2.5"><span className={`text-xs font-semibold ${e.direction === 'IN' ? 'text-green-600' : 'text-blue-600'}`}>{e.direction === 'IN' ? '⬇ Inbound' : '⬆ Outbound'}</span></td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium">{e.partner}</td>
                      <td className="px-3 py-2.5 font-mono text-blue-600">{e.ref}</td>
                      <td className="px-3 py-2.5 text-gray-600">{e.details}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[e.status]}`}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          );
        })()}

        {/* ── Email ────────────────────────────────────────────── */}
        {section === 'email' && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Email Settings</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Default From Address</label><input type="email" defaultValue="dispatch@geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Reply-To Address</label><input type="email" defaultValue="dispatch@geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">SMTP Host</label><input type="text" defaultValue="smtp.geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 mb-1">SMTP Port</label><input type="text" defaultValue="587" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-xs font-medium text-gray-700 mb-1">Encryption</label><select defaultValue="TLS" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>TLS</option><option>SSL</option><option>None</option></select></div></div>
              </div>
              <hr />
              <h4 className="text-xs font-semibold text-gray-700">Notification Preferences</h4>
              <div className="space-y-2">
                {['Load status updates', 'Invoice sent/paid confirmations', 'Driver HOS warnings', 'Compliance expiry reminders', 'Camera event alerts', 'Daily fleet summary digest'].map(n => (
                  <div key={n} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">{n}</span>
                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" /></label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2"><button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Email Settings</button></div>
            </div>
          </div>
        )}

        {/* ── API ──────────────────────────────────────────────── */}
        {section === 'api' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">API Access</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tenant ID: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-blue-700">GE-TMS-2026</code> <button className="ml-1 text-blue-500 hover:underline text-xs" onClick={() => navigator.clipboard.writeText('GE-TMS-2026')}>Copy</button></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSection('developer_portal')} className="px-4 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Developer Portal</button>
                <button onClick={() => setShowKeyModal(true)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">+ Generate New Credentials</button>
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_API_KEYS.map(k => {
                const daysLeft = k.expiresAt ? Math.ceil((new Date(k.expiresAt).getTime() - Date.now()) / 86400000) : null;
                return (
                  <div key={k.id} className={`bg-white border rounded-lg overflow-hidden ${k.status === 'ACTIVE' ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}>
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-gray-900">{k.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{k.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {daysLeft !== null && daysLeft > 0 && <span className={`text-xs ${daysLeft <= 30 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>Expires in {daysLeft} days</span>}
                          {daysLeft === null && k.status === 'ACTIVE' && <span className="text-xs text-gray-400">No expiration date</span>}
                          {k.status === 'ACTIVE' && <>
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Edit"><span className="text-xs">✏</span></button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete"><span className="text-xs">🗑</span></button>
                          </>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{k.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Client ID</label>
                          <div className="flex items-center gap-2">
                            <input type="text" readOnly value={k.clientId} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono text-gray-700" onClick={e => (e.target as HTMLInputElement).select()} />
                            <button onClick={() => navigator.clipboard.writeText(k.clientId)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Copy">📋</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Client Secret</label>
                          <div className="flex items-center gap-2">
                            <input type={visibleSecrets[k.id] ? 'text' : 'password'} readOnly value={k.clientSecret} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono text-gray-700" />
                            <button onClick={() => setVisibleSecrets(p => ({ ...p, [k.id]: !p[k.id] }))} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Show/Hide">👁</button>
                            <button onClick={() => navigator.clipboard.writeText(k.clientSecret)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Copy">📋</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => setExpandedCred(expandedCred === k.id ? null : k.id)}
                        className="w-full px-5 py-2 flex items-center gap-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <span className={`transition-transform ${expandedCred === k.id ? 'rotate-90' : ''}`}>▶</span>
                        Permissions <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{k.permissions.length}</span>
                      </button>
                      {expandedCred === k.id && (
                        <div className="px-5 pb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {k.permissions.map(p => (
                              <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Developer Portal ─────────────────────────────────── */}
        {section === 'developer_portal' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Developer Portal</h3>
                <p className="text-xs text-gray-400 mt-0.5">API reference, guides, and tools for integrating with Gemini Express TMS.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">v1.0</span>
                <button onClick={() => setSection('api')} className="px-4 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100">API Access</button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="text-2xl mb-2">🏠</div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Getting Started</h4>
                <p className="text-xs text-gray-500">Authentication, base URL, versioning, and your first API call.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="text-2xl mb-2">❓</div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Stay Informed</h4>
                <p className="text-xs text-gray-500">Changelog, release notes, and API status updates.</p>
              </div>
            </div>

            {/* Documentation Sidebar + Content */}
            <div className="flex gap-4">
              <div className="w-52 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Documentation</p>
                {['Overview', 'Getting Started', 'Authentication', 'Base URL', 'Versioning', 'Rate Limits', 'Response Codes', 'Dates & Timestamps', 'Pagination'].map((item, i) => (
                  <button key={item} className={`w-full text-left px-2 py-1.5 text-xs rounded ${i === 0 ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{item}</button>
                ))}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">API Reference</p>
                {['Loads', 'Drivers', 'Assets', 'Companies', 'Tracking', 'Accounting', 'Webhooks', 'Reports'].map(item => (
                  <button key={item} className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">{item}</button>
                ))}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Use Cases</p>
                {['Connecting to Power BI', 'Google Sheets Integration', 'Custom Webhooks', 'ELD Data Sync'].map(item => (
                  <button key={item} className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">{item}</button>
                ))}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Support</p>
                {['Privacy Policy', 'Knowledge Base', 'Terms of Service', 'Contact Us'].map(item => (
                  <button key={item} className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">{item}</button>
                ))}
              </div>

              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-1">Overview</h4>
                <p className="text-xs text-gray-400 mb-4">Updated 2 months ago</p>

                <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                  <p>The Gemini Express TMS API provides programmatic access to your transportation management data. Use it to build custom integrations, sync with external systems, and automate workflows.</p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Base URL</p>
                    <code className="bg-gray-900 text-green-400 px-3 py-1.5 rounded text-xs font-mono block">https://api.geminiexpress.com/v1</code>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Authentication</p>
                    <p>All API requests require authentication using your Client ID and Client Secret. Include them in the request header:</p>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs font-mono overflow-x-auto">
{`Authorization: Bearer <access_token>
X-Tenant-ID: GE-TMS-2026
Content-Type: application/json`}
                    </pre>
                    <p className="mt-2">Obtain an access token by calling the <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-700">/auth/token</code> endpoint with your Client ID and Secret.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">API Endpoints</p>
                    <div className="space-y-1.5">
                      {[
                        { method: 'POST', path: '/auth/token', desc: 'Exchange credentials for access token' },
                        { method: 'GET', path: '/loads', desc: 'List loads with filtering and pagination' },
                        { method: 'POST', path: '/loads', desc: 'Create a new load' },
                        { method: 'GET', path: '/loads/:id', desc: 'Get load details' },
                        { method: 'PUT', path: '/loads/:id/status', desc: 'Update load status' },
                        { method: 'GET', path: '/drivers', desc: 'List all drivers' },
                        { method: 'GET', path: '/drivers/:id/hos', desc: 'Get driver HOS data from ELD' },
                        { method: 'GET', path: '/assets', desc: 'List all trucks and trailers' },
                        { method: 'GET', path: '/assets/:id/eld', desc: 'Get asset ELD live data' },
                        { method: 'GET', path: '/tracking/:loadId', desc: 'Real-time GPS tracking for a load' },
                        { method: 'POST', path: '/tracking/links', desc: 'Create a shareable tracking link' },
                        { method: 'GET', path: '/accounting/invoices', desc: 'List invoices' },
                        { method: 'POST', path: '/accounting/invoices', desc: 'Create an invoice' },
                        { method: 'GET', path: '/reports/:type', desc: 'Generate a report (IFTA, HUT, P&L, etc.)' },
                        { method: 'GET', path: '/tolls', desc: 'List toll transactions (I-PASS, E-ZPass)' },
                        { method: 'GET', path: '/tolls/summary', desc: 'Toll spend summary by provider/vehicle/period' },
                        { method: 'POST', path: '/webhooks', desc: 'Register a webhook endpoint' },
                        { method: 'GET', path: '/webhooks', desc: 'List registered webhooks' },
                      ].map(ep => (
                        <div key={ep.path + ep.method} className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : ep.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ep.method}</span>
                          <code className="text-xs font-mono text-gray-700">{ep.path}</code>
                          <span className="text-xs text-gray-400 ml-auto">— {ep.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Rate Limits</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-sm font-bold text-gray-900">1,000</p><p className="text-xs text-gray-400">requests/minute</p></div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-sm font-bold text-gray-900">100,000</p><p className="text-xs text-gray-400">requests/day</p></div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-sm font-bold text-gray-900">10 MB</p><p className="text-xs text-gray-400">max payload</p></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Webhooks</p>
                    <p>Subscribe to real-time events including:</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['load.created', 'load.status_changed', 'load.delivered', 'driver.hos_warning', 'driver.violation', 'asset.dtc_alert', 'invoice.paid', 'tracking.update', 'camera.event', 'toll.posted'].map(e => (
                        <span key={e} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Billing ──────────────────────────────────────────── */}
        {section === 'billing' && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Billing</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div><p className="text-sm font-semibold text-blue-900">Enterprise Plan</p><p className="text-xs text-blue-600">Unlimited users, all modules, API access, priority support</p></div>
                <div className="text-right"><p className="text-lg font-bold text-blue-900">$299<span className="text-sm font-normal">/mo</span></p><p className="text-xs text-blue-600">Billed annually</p></div>
              </div>
              <hr />
              <h4 className="text-xs font-semibold text-gray-700">Payment Method</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3"><span className="text-lg">💳</span><div><p className="text-xs font-medium text-gray-800">Visa ending in 4242</p><p className="text-xs text-gray-400">Expires 12/2028</p></div></div>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Update</button>
              </div>
              <hr />
              <h4 className="text-xs font-semibold text-gray-700">Recent Invoices</h4>
              <div className="space-y-1">
                {[{ date: 'Apr 1, 2026', amount: '$299.00', status: 'Paid' }, { date: 'Mar 1, 2026', amount: '$299.00', status: 'Paid' }, { date: 'Feb 1, 2026', amount: '$299.00', status: 'Paid' }].map(inv => (
                  <div key={inv.date} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">{inv.date}</span>
                    <span className="text-xs font-medium text-gray-900">{inv.amount}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">{inv.status}</span>
                    <button className="text-xs text-blue-600 hover:underline">Download</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── My Profile ──────────────────────────────────────── */}
        {section === 'profile' && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">My Profile</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">JM</div>
                <div><p className="text-sm font-semibold text-gray-900">Jake Martinez</p><p className="text-xs text-gray-400">jake.martinez@geminiexpress.com</p><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Full Admin</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">First Name</label><input type="text" defaultValue="Jake" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label><input type="text" defaultValue="Martinez" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input type="email" defaultValue="jake.martinez@geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone</label><input type="tel" defaultValue="(555) 100-0001" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <hr />
              <h4 className="text-xs font-semibold text-gray-700">Change Password</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">New Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end pt-2"><button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Profile</button></div>
            </div>
          </div>
        )}
      </div>

      {/* ── Invite User Modal ──────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Invite Team Member</h2><p className="text-xs text-gray-400 mt-0.5">Set role, module access, and location permissions</p></div>
            <div className="px-6 py-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label><input type="text" placeholder="John" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label><input type="text" placeholder="Smith" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@geminiexpress.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone</label><input type="tel" placeholder="(555) 000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Access Level *</label>
                <div className="space-y-2">
                  {(Object.entries(ROLE_BADGES) as [UserRole, typeof ROLE_BADGES[UserRole]][]).map(([role, badge]) => (
                    <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${inviteRole === role ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="role" value={role} checked={inviteRole === role} onChange={() => setInviteRole(role)} className="text-blue-600" />
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{ROLE_PERMISSIONS[role].join(', ')}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Module Access */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-blue-800 mb-2">Module Access</h4>
                <p className="text-xs text-blue-600 mb-3">Select which modules this user can access. Full Admin / Admin have access to all modules by default.</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'carrier', label: 'Carrier', icon: '🚛', color: 'border-blue-300 bg-blue-100 text-blue-800' },
                    { id: 'brokerage', label: 'Brokerage', icon: '📦', color: 'border-emerald-300 bg-emerald-100 text-emerald-800' },
                    { id: 'cfs', label: 'CFS / Air', icon: '✈', color: 'border-violet-300 bg-violet-100 text-violet-800' },
                    { id: 'billing', label: 'Billing', icon: '💰', color: 'border-amber-300 bg-amber-100 text-amber-800' },
                  ].map(mod => (
                    <label key={mod.id} className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${mod.color}`}>
                      <input type="checkbox" defaultChecked={['FULL_ADMIN', 'ADMIN'].includes(inviteRole)} className="mb-1.5 rounded" />
                      <span className="text-lg">{mod.icon}</span>
                      <span className="text-xs font-bold mt-1">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CFS Location (only shown for non-admin roles) */}
              {!['FULL_ADMIN', 'ADMIN'].includes(inviteRole) && (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-violet-800 mb-2">CFS Location Assignment</h4>
                  <p className="text-xs text-violet-600 mb-3">Operations and Manager users can only see CFS data for their assigned location. Select the CFS station this user will operate from.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'JFK', name: 'JFK — New York', airport: 'John F. Kennedy Intl' },
                      { code: 'MIA', name: 'MIA — Miami', airport: 'Miami Intl' },
                      { code: 'ORD', name: 'ORD — Chicago', airport: "O'Hare Intl" },
                      { code: 'LAX', name: 'LAX — Los Angeles', airport: 'Los Angeles Intl' },
                      { code: 'ATL', name: 'ATL — Atlanta', airport: 'Hartsfield-Jackson' },
                      { code: 'DFW', name: 'DFW — Dallas', airport: 'Dallas/Fort Worth' },
                    ].map(loc => (
                      <label key={loc.code} className="flex items-center gap-2 p-2.5 rounded-lg border border-violet-200 bg-white cursor-pointer hover:bg-violet-50">
                        <input type="radio" name="cfsLocation" value={loc.code} className="text-violet-600" />
                        <div><p className="text-xs font-bold text-gray-800">{loc.code}</p><p className="text-xs text-gray-400">{loc.airport}</p></div>
                      </label>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 mt-2 p-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="cfsLocation" value="" className="text-gray-600" />
                    <div><p className="text-xs font-bold text-gray-800">All Locations</p><p className="text-xs text-gray-400">User can see all CFS stations (not recommended for Operations)</p></div>
                  </label>
                </div>
              )}

              {['FULL_ADMIN', 'ADMIN'].includes(inviteRole) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                  <strong>Full Admin / Admin</strong> — This user will automatically have access to all modules and all CFS locations. No location restriction needed.
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={!inviteEmail} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create API Key Modal ───────────────────────────────── */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowKeyModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Create API Key</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Key Name *</label><input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Production, Staging, Partner X" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <p className="text-xs text-gray-400">The API key will only be shown once. Save it in a secure location.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={!newKeyName} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Generate Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
