import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface Carrier {
  id: string; companyName: string; mcNumber: string; dotNumber: string; status: 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'BLACKLISTED';
  safetyRating: 'SATISFACTORY' | 'CONDITIONAL' | 'UNSATISFACTORY' | 'NONE';
  insuranceExpiry: string; autoLiability: number; cargoInsurance: number;
  primaryContact: string; primaryEmail: string; primaryPhone: string;
  city: string; state: string; fleetSize: number; equipmentTypes: string[];
  totalLoads: number; avgRate: number; onTimeRate: number; lastLoadDate: string;
  paymentTerms: string; factoringCompany: string; notes: string;
  // Onboarding
  onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
  onboardingDocs: { type: string; name: string; status: 'RECEIVED' | 'APPROVED' | 'MISSING' | 'EXPIRED' | 'REJECTED'; uploadedAt: string; expiresAt: string; notes: string }[];
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_CARRIERS: Carrier[] = [
  { id: 'cr1', companyName: 'Eagle Freight Lines', mcNumber: 'MC-889901', dotNumber: 'DOT-3456789', status: 'APPROVED', safetyRating: 'SATISFACTORY', insuranceExpiry: '2027-02-15', autoLiability: 1000000, cargoInsurance: 100000, primaryContact: 'Mike Hawkins', primaryEmail: 'dispatch@eaglefreight.com', primaryPhone: '(555) 300-1001', city: 'Dallas', state: 'TX', fleetSize: 45, equipmentTypes: ['Dry Van', 'Reefer'], totalLoads: 68, avgRate: 2850, onTimeRate: 94, lastLoadDate: '2026-04-13', paymentTerms: 'Quick Pay', factoringCompany: 'RTS Financial', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'Eagle_Freight_W9.pdf', status: 'APPROVED', uploadedAt: '2025-06-15', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Eagle_Freight_COI.pdf', status: 'APPROVED', uploadedAt: '2026-01-10', expiresAt: '2027-02-15', notes: '' }, { type: 'MC Authority', name: 'Eagle_Freight_MC_Authority.pdf', status: 'APPROVED', uploadedAt: '2025-06-15', expiresAt: '', notes: 'Active authority verified via FMCSA' }, { type: 'Carrier Agreement', name: 'Eagle_Freight_Broker_Carrier_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-06-16', expiresAt: '', notes: 'Signed 6/16/2025' }, { type: 'NOA (Notice of Assignment)', name: 'Eagle_Freight_NOA_RTS.pdf', status: 'APPROVED', uploadedAt: '2025-06-16', expiresAt: '', notes: 'Factoring: RTS Financial' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-06-17', expiresAt: '', notes: 'Active RMIS monitoring enrolled' }], notes: 'Reliable  priority carrier for TX lanes' },
  { id: 'cr2', companyName: 'Midwest Express Trucking', mcNumber: 'MC-776543', dotNumber: 'DOT-2345678', status: 'APPROVED', safetyRating: 'SATISFACTORY', insuranceExpiry: '2026-11-30', autoLiability: 1000000, cargoInsurance: 100000, primaryContact: 'Jim Patterson', primaryEmail: 'jim@midwestexpress.com', primaryPhone: '(555) 300-1002', city: 'Indianapolis', state: 'IN', fleetSize: 22, equipmentTypes: ['Dry Van'], totalLoads: 42, avgRate: 2400, onTimeRate: 91, lastLoadDate: '2026-04-12', paymentTerms: 'Net 30', factoringCompany: '', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'Midwest_Express_W9.pdf', status: 'APPROVED', uploadedAt: '2025-08-01', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Midwest_Express_COI.pdf', status: 'APPROVED', uploadedAt: '2025-12-01', expiresAt: '2026-11-30', notes: '' }, { type: 'MC Authority', name: 'Midwest_Express_MC.pdf', status: 'APPROVED', uploadedAt: '2025-08-01', expiresAt: '', notes: '' }, { type: 'Carrier Agreement', name: 'Midwest_Express_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-08-02', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'No factoring  direct pay' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-08-03', expiresAt: '', notes: '' }], notes: '' },
  { id: 'cr3', companyName: 'Summit Flatbed Services', mcNumber: 'MC-667890', dotNumber: 'DOT-1234567', status: 'APPROVED', safetyRating: 'SATISFACTORY', insuranceExpiry: '2027-05-01', autoLiability: 1000000, cargoInsurance: 250000, primaryContact: 'Carlos Reyes', primaryEmail: 'creyes@summitflat.com', primaryPhone: '(555) 300-1003', city: 'Birmingham', state: 'AL', fleetSize: 18, equipmentTypes: ['Flatbed', 'Step Deck'], totalLoads: 31, avgRate: 3200, onTimeRate: 88, lastLoadDate: '2026-04-11', paymentTerms: 'Quick Pay', factoringCompany: 'Triumph Pay', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'Summit_Flatbed_W9.pdf', status: 'APPROVED', uploadedAt: '2025-09-10', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Summit_Flatbed_COI.pdf', status: 'APPROVED', uploadedAt: '2026-03-01', expiresAt: '2027-05-01', notes: 'Cargo at $250k' }, { type: 'MC Authority', name: 'Summit_Flatbed_MC.pdf', status: 'APPROVED', uploadedAt: '2025-09-10', expiresAt: '', notes: '' }, { type: 'Carrier Agreement', name: 'Summit_Flatbed_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-09-11', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: 'Summit_NOA_Triumph.pdf', status: 'APPROVED', uploadedAt: '2025-09-11', expiresAt: '', notes: 'Factoring: Triumph Pay' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-09-12', expiresAt: '', notes: '' }], notes: 'Specialized OD/OW permits' },
  { id: 'cr4', companyName: 'Arctic Cold Carriers', mcNumber: 'MC-554321', dotNumber: 'DOT-4567890', status: 'APPROVED', safetyRating: 'SATISFACTORY', insuranceExpiry: '2026-09-15', autoLiability: 1000000, cargoInsurance: 100000, primaryContact: 'Anna Volkov', primaryEmail: 'anna@arcticcold.com', primaryPhone: '(555) 300-1004', city: 'Chicago', state: 'IL', fleetSize: 32, equipmentTypes: ['Reefer'], totalLoads: 55, avgRate: 3100, onTimeRate: 96, lastLoadDate: '2026-04-13', paymentTerms: 'Net 15', factoringCompany: '', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'Arctic_Cold_W9.pdf', status: 'APPROVED', uploadedAt: '2025-07-20', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Arctic_Cold_COI.pdf', status: 'APPROVED', uploadedAt: '2026-01-15', expiresAt: '2026-09-15', notes: '' }, { type: 'MC Authority', name: 'Arctic_Cold_MC.pdf', status: 'APPROVED', uploadedAt: '2025-07-20', expiresAt: '', notes: '' }, { type: 'Carrier Agreement', name: 'Arctic_Cold_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-07-21', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'No factoring' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-07-22', expiresAt: '', notes: '' }], notes: 'Premium reefer  temp controlled, FSMA compliant' },
  { id: 'cr5', companyName: 'Lone Star Logistics', mcNumber: 'MC-443210', dotNumber: 'DOT-5678901', status: 'APPROVED', safetyRating: 'CONDITIONAL', insuranceExpiry: '2026-07-20', autoLiability: 750000, cargoInsurance: 100000, primaryContact: 'Pete Gonzalez', primaryEmail: 'pete@lonestarlogi.com', primaryPhone: '(555) 300-1005', city: 'Houston', state: 'TX', fleetSize: 8, equipmentTypes: ['Dry Van'], totalLoads: 19, avgRate: 2200, onTimeRate: 82, lastLoadDate: '2026-04-09', paymentTerms: 'Quick Pay', factoringCompany: 'OTR Solutions', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'LoneStar_W9.pdf', status: 'APPROVED', uploadedAt: '2025-11-01', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'LoneStar_COI.pdf', status: 'APPROVED', uploadedAt: '2026-01-20', expiresAt: '2026-07-20', notes: 'Auto liability only $750k  below $1M standard' }, { type: 'MC Authority', name: 'LoneStar_MC.pdf', status: 'APPROVED', uploadedAt: '2025-11-01', expiresAt: '', notes: 'Conditional safety rating' }, { type: 'Carrier Agreement', name: 'LoneStar_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-11-02', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: 'LoneStar_NOA_OTR.pdf', status: 'APPROVED', uploadedAt: '2025-11-02', expiresAt: '', notes: 'Factoring: OTR Solutions' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-11-03', expiresAt: '', notes: '' }], notes: 'Conditional safety  monitor closely' },
  { id: 'cr6', companyName: 'Pacific Coast Haulers', mcNumber: 'MC-332109', dotNumber: 'DOT-6789012', status: 'PENDING', safetyRating: 'NONE', insuranceExpiry: '2027-01-10', autoLiability: 1000000, cargoInsurance: 100000, primaryContact: 'Derek Tanaka', primaryEmail: 'dtanaka@pachaulers.com', primaryPhone: '(555) 300-1006', city: 'Portland', state: 'OR', fleetSize: 12, equipmentTypes: ['Dry Van', 'Flatbed'], totalLoads: 0, avgRate: 0, onTimeRate: 0, lastLoadDate: '', paymentTerms: 'Net 30', factoringCompany: '', onboardingStatus: 'IN_PROGRESS', onboardingDocs: [{ type: 'W-9', name: 'Pacific_Coast_W9.pdf', status: 'RECEIVED', uploadedAt: '2026-04-10', expiresAt: '', notes: 'Pending review' }, { type: 'Certificate of Insurance', name: 'Pacific_Coast_COI.pdf', status: 'RECEIVED', uploadedAt: '2026-04-10', expiresAt: '2027-01-10', notes: 'Pending verification' }, { type: 'MC Authority', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'Requested from carrier 4/11' }, { type: 'Carrier Agreement', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'Sent for signature 4/11' }, { type: 'NOA (Notice of Assignment)', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: '' }, { type: 'RMIS Monitoring', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'Will enroll after approval' }], notes: 'New carrier  onboarding in progress' },
  { id: 'cr7', companyName: 'Rusty Axle Transport', mcNumber: 'MC-221098', dotNumber: 'DOT-7890123', status: 'SUSPENDED', safetyRating: 'UNSATISFACTORY', insuranceExpiry: '2026-04-01', autoLiability: 500000, cargoInsurance: 50000, primaryContact: 'Billy Nance', primaryEmail: 'billy@rustyaxle.com', primaryPhone: '(555) 300-1007', city: 'Little Rock', state: 'AR', fleetSize: 5, equipmentTypes: ['Dry Van'], totalLoads: 4, avgRate: 1800, onTimeRate: 60, lastLoadDate: '2026-02-15', paymentTerms: 'Quick Pay', factoringCompany: '', onboardingStatus: 'IN_PROGRESS', onboardingDocs: [{ type: 'W-9', name: 'Rusty_Axle_W9.pdf', status: 'APPROVED', uploadedAt: '2025-04-01', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Rusty_Axle_COI.pdf', status: 'EXPIRED', uploadedAt: '2025-04-01', expiresAt: '2026-04-01', notes: 'EXPIRED  insurance lapsed' }, { type: 'MC Authority', name: 'Rusty_Axle_MC.pdf', status: 'REJECTED', uploadedAt: '2025-04-01', expiresAt: '', notes: 'Unsatisfactory safety rating' }, { type: 'Carrier Agreement', name: 'Rusty_Axle_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-04-02', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: '' }, { type: 'RMIS Monitoring', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'SUSPENDED  cannot enroll' }], notes: 'SUSPENDED  unsatisfactory safety, insurance expired' },
  { id: 'cr8', companyName: 'Thunder Road Inc.', mcNumber: 'MC-998877', dotNumber: 'DOT-8901234', status: 'APPROVED', safetyRating: 'SATISFACTORY', insuranceExpiry: '2027-03-20', autoLiability: 1000000, cargoInsurance: 100000, primaryContact: 'Steve McCoy', primaryEmail: 'steve@thunderroadinc.com', primaryPhone: '(555) 300-1008', city: 'Nashville', state: 'TN', fleetSize: 28, equipmentTypes: ['Dry Van', 'Reefer', 'Flatbed'], totalLoads: 37, avgRate: 2650, onTimeRate: 92, lastLoadDate: '2026-04-10', paymentTerms: 'Net 30', factoringCompany: '', onboardingStatus: 'COMPLETE', onboardingDocs: [{ type: 'W-9', name: 'Thunder_Road_W9.pdf', status: 'APPROVED', uploadedAt: '2025-10-15', expiresAt: '', notes: '' }, { type: 'Certificate of Insurance', name: 'Thunder_Road_COI.pdf', status: 'APPROVED', uploadedAt: '2026-02-20', expiresAt: '2027-03-20', notes: '' }, { type: 'MC Authority', name: 'Thunder_Road_MC.pdf', status: 'APPROVED', uploadedAt: '2025-10-15', expiresAt: '', notes: '' }, { type: 'Carrier Agreement', name: 'Thunder_Road_Agreement.pdf', status: 'APPROVED', uploadedAt: '2025-10-16', expiresAt: '', notes: '' }, { type: 'NOA (Notice of Assignment)', name: '', status: 'MISSING', uploadedAt: '', expiresAt: '', notes: 'No factoring  direct pay' }, { type: 'RMIS Monitoring', name: '', status: 'APPROVED', uploadedAt: '2025-10-17', expiresAt: '', notes: '' }], notes: 'Versatile fleet  good all-around' },
];

// ── Helpers ────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = { APPROVED: 'bg-green-100 text-green-800', PENDING: 'bg-yellow-100 text-yellow-800', SUSPENDED: 'bg-red-100 text-red-800', BLACKLISTED: 'bg-gray-800 text-white' };
const SAFETY_BADGE: Record<string, string> = { SATISFACTORY: 'bg-green-100 text-green-800', CONDITIONAL: 'bg-yellow-100 text-yellow-800', UNSATISFACTORY: 'bg-red-100 text-red-800', NONE: 'bg-gray-100 text-gray-500' };
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export function BrokerageCarriers() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scorecardCarrier, setScorecardCarrier] = useState<Carrier | null>(null);
  const [lookupMC, setLookupMC] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupSource, setLookupSource] = useState<'RMIS' | 'HIGHWAY'>('RMIS');

  const simulateLookup = () => {
    if (!lookupMC.trim()) return;
    setLookupLoading(true);
    setTimeout(() => {
      setLookupResult({
        companyName: 'New Carrier Trucking LLC', mcNumber: lookupMC.toUpperCase(), dotNumber: 'DOT-8812345',
        status: 'AUTHORIZED', safetyRating: 'SATISFACTORY', safetyScore: 82,
        address: '4200 Freight Blvd, Memphis, TN 38118',
        phone: '(901) 555-4400', email: 'dispatch@newcarrier.com', contact: 'Tony Martinez',
        fleetSize: 15, drivers: 18, powerUnits: 15, equipmentTypes: ['Dry Van', 'Reefer'],
        insuranceAuto: { carrier: 'Progressive Commercial', policy: 'PC-882100', amount: 1000000, expiry: '2027-03-15' },
        insuranceCargo: { carrier: 'National Indemnity', policy: 'NI-445500', amount: 100000, expiry: '2027-03-15' },
        authority: { type: 'Common', status: 'ACTIVE', grantDate: '2022-08-15', bipdRequired: true, cargoRequired: true, bondRequired: false },
        operatingStatus: 'AUTHORIZED', outOfServiceDate: '',
        inspections: { total: 24, vehicleOOS: 2, driverOOS: 1, hazmatOOS: 0, vehicleOOSRate: 8.3, driverOOSRate: 4.2 },
        crashes: { total: 1, fatal: 0, injury: 0, towaway: 1 },
        source: lookupSource, lookupTime: new Date().toISOString(),
      });
      setLookupLoading(false);
    }, 1200);
  };

  const filtered = useMemo(() => {
    return MOCK_CARRIERS.filter(c => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return c.companyName.toLowerCase().includes(q) || c.mcNumber.toLowerCase().includes(q) || c.primaryContact.toLowerCase().includes(q) || c.city.toLowerCase().includes(q); }
      return true;
    });
  }, [statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    approved: MOCK_CARRIERS.filter(c => c.status === 'APPROVED').length,
    pending: MOCK_CARRIERS.filter(c => c.status === 'PENDING').length,
    suspended: MOCK_CARRIERS.filter(c => c.status === 'SUSPENDED').length,
    expiringIns: MOCK_CARRIERS.filter(c => c.status === 'APPROVED' && daysUntil(c.insuranceExpiry) <= 30).length,
    avgOnTime: Math.round(MOCK_CARRIERS.filter(c => c.onTimeRate > 0).reduce((s, c) => s + c.onTimeRate, 0) / MOCK_CARRIERS.filter(c => c.onTimeRate > 0).length),
  }), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">LSP / Carriers</h2>
        <div className="flex items-center gap-3">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search carrier, MC#, contact..." className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => setShowScorecard(true)} className="text-sm font-medium text-gray-700 px-4 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">📊 Scorecard</button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700">+ Add Carrier</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Approved Carriers</p><p className="text-xl font-bold text-gray-900">{stats.approved}</p><p className="text-xs text-yellow-600 mt-1.5">{stats.pending} pending</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Avg On-Time</p><p className={`text-xl font-bold ${stats.avgOnTime >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{stats.avgOnTime}%</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Insurance Expiring</p><p className={`text-xl font-bold ${stats.expiringIns > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.expiringIns}</p><p className="text-xs text-gray-400 mt-1.5">within 30 days</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Suspended</p><p className={`text-xl font-bold ${stats.suspended > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.suspended}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Loads (YTD)</p><p className="text-xl font-bold text-gray-900">{MOCK_CARRIERS.reduce((s, c) => s + c.totalLoads, 0)}</p></div>
      </div>

      <div className="flex gap-1 mb-3">
        {['All', 'APPROVED', 'PENDING', 'SUSPENDED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">MC / DOT</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Safety</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Equipment</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Fleet</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">On-Time</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Avg Rate</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Loads YTD</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Insurance</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Onboarding</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400 text-sm">No carriers found.</td></tr>}
              {filtered.map(c => {
                const insExpiring = daysUntil(c.insuranceExpiry) <= 30;
                const insExpired = daysUntil(c.insuranceExpiry) < 0;
                return (
                  <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${c.status === 'SUSPENDED' ? 'bg-red-50 border-l-4 border-l-red-400' : insExpired ? 'bg-red-50 border-l-4 border-l-red-300' : insExpiring ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`} onClick={() => setSelectedCarrier(c)}>
                    <td className="px-3 py-2.5"><span className="font-semibold text-blue-600">{c.companyName}</span><br/><span className="text-xs text-gray-400">{c.primaryContact}</span></td>
                    <td className="px-3 py-2.5"><span className="text-sm font-mono text-gray-700">{c.mcNumber}</span><br/><span className="text-xs font-mono text-gray-400">{c.dotNumber}</span></td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SAFETY_BADGE[c.safetyRating]}`}>{c.safetyRating}</span></td>
                    <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{c.equipmentTypes.map(e => <span key={e} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{e}</span>)}</div></td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{c.fleetSize}</td>
                    <td className="px-3 py-2.5 text-right"><span className={`font-medium ${c.onTimeRate >= 90 ? 'text-green-600' : c.onTimeRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{c.onTimeRate > 0 ? `${c.onTimeRate}%` : ''}</span></td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{c.avgRate > 0 ? `$${c.avgRate.toLocaleString()}` : ''}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{c.totalLoads || ''}</td>
                    <td className={`px-3 py-2.5 ${insExpired ? 'text-red-600 font-semibold' : insExpiring ? 'text-yellow-600 font-medium' : 'text-gray-600'}`}>{fmtDate(c.insuranceExpiry)}{insExpired && ' ✕'}{insExpiring && !insExpired && ' ⚠'}</td>
                    <td className="px-3 py-2.5">{(() => {
                      const approved = c.onboardingDocs.filter(d => d.status === 'APPROVED').length;
                      const total = c.onboardingDocs.length;
                      const hasIssue = c.onboardingDocs.some(d => d.status === 'EXPIRED' || d.status === 'REJECTED');
                      return c.onboardingStatus === 'COMPLETE' && !hasIssue
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Complete</span>
                        : hasIssue
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠ Issue</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{approved}/{total}</span>;
                    })()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Flyout */}
      {selectedCarrier && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCarrier(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-gray-900">{selectedCarrier.companyName}</h3><button onClick={() => setSelectedCarrier(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[selectedCarrier.status]}`}>{selectedCarrier.status}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SAFETY_BADGE[selectedCarrier.safetyRating]}`}>{selectedCarrier.safetyRating}</span><span className="text-xs font-mono text-gray-400">{selectedCarrier.mcNumber}</span></div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{selectedCarrier.totalLoads}</p><p className="text-xs text-gray-400">Loads YTD</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className={`text-lg font-bold ${selectedCarrier.onTimeRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{selectedCarrier.onTimeRate}%</p><p className="text-xs text-gray-400">On-Time</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">${selectedCarrier.avgRate.toLocaleString()}</p><p className="text-xs text-gray-400">Avg Rate</p></div>
              </div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Authority & Insurance</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5"><div className="flex justify-between text-xs"><span className="text-gray-500">MC Number</span><span className="font-mono text-gray-800">{selectedCarrier.mcNumber}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">DOT Number</span><span className="font-mono text-gray-800">{selectedCarrier.dotNumber}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Auto Liability</span><span className="text-gray-800">${(selectedCarrier.autoLiability/1000).toFixed(0)}k</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Cargo Insurance</span><span className="text-gray-800">${(selectedCarrier.cargoInsurance/1000).toFixed(0)}k</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Insurance Expiry</span><span className={daysUntil(selectedCarrier.insuranceExpiry) <= 30 ? 'text-red-600 font-medium' : 'text-gray-800'}>{fmtDate(selectedCarrier.insuranceExpiry)}</span></div></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Equipment</h4><div className="flex flex-wrap gap-1.5">{selectedCarrier.equipmentTypes.map(e => <span key={e} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{e}</span>)}</div><p className="text-xs text-gray-400 mt-1.5">{selectedCarrier.fleetSize} trucks</p></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Contact</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1"><p className="text-sm font-medium text-gray-900">{selectedCarrier.primaryContact}</p><p className="text-xs text-blue-600">{selectedCarrier.primaryEmail}</p><p className="text-xs text-gray-600">{selectedCarrier.primaryPhone}</p><p className="text-xs text-gray-500">{selectedCarrier.city}, {selectedCarrier.state}</p></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Payment</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5"><div className="flex justify-between text-xs"><span className="text-gray-500">Terms</span><span className="text-gray-800">{selectedCarrier.paymentTerms}</span></div>{selectedCarrier.factoringCompany && <div className="flex justify-between text-xs"><span className="text-gray-500">Factoring</span><span className="text-gray-800">{selectedCarrier.factoringCompany}</span></div>}</div></div>
              {selectedCarrier.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedCarrier.notes}</p></div>}

              {/* Onboarding Packet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-700">Onboarding Packet</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCarrier.onboardingStatus === 'COMPLETE' && !selectedCarrier.onboardingDocs.some(d => d.status === 'EXPIRED' || d.status === 'REJECTED') ? 'bg-green-100 text-green-800' : selectedCarrier.onboardingStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{selectedCarrier.onboardingStatus === 'COMPLETE' && !selectedCarrier.onboardingDocs.some(d => d.status === 'EXPIRED' || d.status === 'REJECTED') ? '✓ Complete' : selectedCarrier.onboardingDocs.some(d => d.status === 'EXPIRED') ? '⚠ Expired Docs' : 'In Progress'}</span>
                </div>
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Documents</span><span className="font-medium text-gray-700">{selectedCarrier.onboardingDocs.filter(d => d.status === 'APPROVED').length} / {selectedCarrier.onboardingDocs.length}</span></div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${selectedCarrier.onboardingDocs.some(d => d.status === 'EXPIRED' || d.status === 'REJECTED') ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(selectedCarrier.onboardingDocs.filter(d => d.status === 'APPROVED').length / selectedCarrier.onboardingDocs.length) * 100}%` }} /></div>
                </div>
                {/* Document Checklist */}
                <div className="space-y-1">
                  {selectedCarrier.onboardingDocs.map((doc, i) => {
                    const statusStyle: Record<string, { bg: string; icon: string }> = { APPROVED: { bg: 'text-green-600', icon: '✓' }, RECEIVED: { bg: 'text-blue-600', icon: '⟳' }, MISSING: { bg: 'text-gray-400', icon: '○' }, EXPIRED: { bg: 'text-red-600', icon: '✕' }, REJECTED: { bg: 'text-red-600', icon: '✕' } };
                    const s = statusStyle[doc.status] || statusStyle.MISSING;
                    return (
                      <div key={i} className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs ${doc.status === 'EXPIRED' || doc.status === 'REJECTED' ? 'bg-red-50' : doc.status === 'MISSING' ? 'bg-gray-50' : 'bg-white border border-gray-100'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`font-bold ${s.bg}`}>{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-800 font-medium">{doc.type}</span>
                            {doc.name && <span className="text-gray-400 ml-1 truncate"> {doc.name}</span>}
                          </div>
                        </div>
                        <span className={`text-xs font-medium ml-2 ${s.bg}`}>{doc.status === 'APPROVED' ? 'Approved' : doc.status === 'RECEIVED' ? 'Received' : doc.status === 'EXPIRED' ? 'Expired' : doc.status === 'REJECTED' ? 'Rejected' : 'Missing'}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedCarrier.onboardingDocs.some(d => d.status === 'MISSING' || d.status === 'EXPIRED') && (
                  <button className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Send Onboarding Packet Request to Carrier</button>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Assign Load</button>
              <button onClick={() => setShowOnboarding(true)} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Onboarding</button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowAddModal(false); setLookupResult(null); setLookupMC(''); }}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Add Carrier & Start Onboarding</h2>
              <p className="text-xs text-gray-400 mt-0.5">Enter MC# or DOT# to auto-populate via RMIS / Highway API</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* RMIS / Highway API Lookup */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">🔍</span>
                  <div><p className="text-sm font-bold text-indigo-900">Carrier Lookup  Auto-Populate</p><p className="text-xs text-indigo-600">Pull carrier data, insurance, authority, and safety info automatically</p></div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex rounded-lg overflow-hidden border border-indigo-300">
                    <button onClick={() => setLookupSource('RMIS')} className={`px-3 py-1.5 text-xs font-semibold ${lookupSource === 'RMIS' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>🛡 RMIS</button>
                    <button onClick={() => setLookupSource('HIGHWAY')} className={`px-3 py-1.5 text-xs font-semibold ${lookupSource === 'HIGHWAY' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>🛣 Highway</button>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={lookupMC} onChange={e => setLookupMC(e.target.value)} placeholder="Enter MC# or DOT# (e.g. MC-889901)" className="flex-1 border border-indigo-300 rounded-lg px-3 py-2 text-sm font-mono" onKeyDown={e => e.key === 'Enter' && simulateLookup()} />
                  <button onClick={simulateLookup} disabled={lookupLoading || !lookupMC.trim()} className={`px-5 py-2 text-sm font-semibold text-white rounded-lg ${lookupLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{lookupLoading ? '⟳ Looking up...' : 'Lookup'}</button>
                </div>
              </div>

              {/* Auto-populated results */}
              {lookupResult && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">✅</span><span className="text-sm font-bold text-green-800">Carrier Found  Auto-Populated via {lookupResult.source}</span></div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="block text-xs text-gray-500 mb-0.5">Company Name</label><input type="text" defaultValue={lookupResult.companyName} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-semibold bg-white" /></div>
                    <div><label className="block text-xs text-gray-500 mb-0.5">Address</label><input type="text" defaultValue={lookupResult.address} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                    <div><label className="block text-xs text-gray-500 mb-0.5">MC Number</label><input type="text" defaultValue={lookupResult.mcNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-gray-100" readOnly /></div>
                    <div><label className="block text-xs text-gray-500 mb-0.5">DOT Number</label><input type="text" defaultValue={lookupResult.dotNumber} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono bg-gray-100" readOnly /></div>
                    <div><label className="block text-xs text-gray-500 mb-0.5">Contact</label><input type="text" defaultValue={lookupResult.contact} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                    <div><label className="block text-xs text-gray-500 mb-0.5">Phone</label><input type="text" defaultValue={lookupResult.phone} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200 text-center"><p className="text-xs text-gray-400">Status</p><p className={`text-sm font-bold ${lookupResult.operatingStatus === 'AUTHORIZED' ? 'text-green-600' : 'text-red-600'}`}>{lookupResult.operatingStatus}</p></div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200 text-center"><p className="text-xs text-gray-400">Safety</p><p className={`text-sm font-bold ${lookupResult.safetyRating === 'SATISFACTORY' ? 'text-green-600' : 'text-yellow-600'}`}>{lookupResult.safetyRating}</p></div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200 text-center"><p className="text-xs text-gray-400">Fleet</p><p className="text-sm font-bold text-gray-900">{lookupResult.powerUnits} trucks</p></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Insurance  Auto-Verified</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200"><div className="flex justify-between"><span className="text-xs text-gray-500">Auto Liability</span><span className="text-xs font-bold text-green-600">✓ Verified</span></div><p className="text-sm font-bold">${(lookupResult.insuranceAuto.amount/1000).toFixed(0)}k</p><p className="text-xs text-gray-400">{lookupResult.insuranceAuto.carrier} · Exp: {new Date(lookupResult.insuranceAuto.expiry).toLocaleDateString()}</p></div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200"><div className="flex justify-between"><span className="text-xs text-gray-500">Cargo</span><span className="text-xs font-bold text-green-600">✓ Verified</span></div><p className="text-sm font-bold">${(lookupResult.insuranceCargo.amount/1000).toFixed(0)}k</p><p className="text-xs text-gray-400">{lookupResult.insuranceCargo.carrier} · Exp: {new Date(lookupResult.insuranceCargo.expiry).toLocaleDateString()}</p></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">FMCSA Safety Snapshot</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white rounded p-1.5 border border-gray-200 text-center"><p className="text-xs text-gray-400">Inspections</p><p className="text-sm font-bold">{lookupResult.inspections.total}</p></div>
                    <div className="bg-white rounded p-1.5 border border-gray-200 text-center"><p className="text-xs text-gray-400">Veh OOS%</p><p className={`text-sm font-bold ${lookupResult.inspections.vehicleOOSRate > 20 ? 'text-red-600' : 'text-green-600'}`}>{lookupResult.inspections.vehicleOOSRate}%</p></div>
                    <div className="bg-white rounded p-1.5 border border-gray-200 text-center"><p className="text-xs text-gray-400">Drv OOS%</p><p className={`text-sm font-bold ${lookupResult.inspections.driverOOSRate > 10 ? 'text-red-600' : 'text-green-600'}`}>{lookupResult.inspections.driverOOSRate}%</p></div>
                    <div className="bg-white rounded p-1.5 border border-gray-200 text-center"><p className="text-xs text-gray-400">Crashes</p><p className={`text-sm font-bold ${lookupResult.crashes.total > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{lookupResult.crashes.total}</p></div>
                  </div>
                </div>
              )}

              {!lookupResult && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact</label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Dry Van</option><option>Reefer</option><option>Flatbed</option><option>Step Deck</option></select></div>
                </div>
              )}
              <hr />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Onboarding Packet</h3>
                <p className="text-xs text-gray-400 mb-3">Upload required documents or send the onboarding link to the carrier</p>
                <div className="space-y-2">
                  {[
                    { doc: 'W-9 Form', auto: false },
                    { doc: 'Certificate of Insurance (COI)', auto: !!lookupResult },
                    { doc: 'MC Authority Letter', auto: !!lookupResult },
                    { doc: 'Carrier-Broker Agreement', auto: false },
                    { doc: 'NOA (Notice of Assignment)', auto: false },
                    { doc: 'Void Check / ACH Form', auto: false },
                  ].map(item => (
                    <div key={item.doc} className={`flex items-center justify-between py-2 px-3 rounded-lg ${item.auto ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${item.auto ? 'text-green-600' : 'text-gray-400'}`}>{item.auto ? '✓' : '○'}</span>
                        <span className="text-sm text-gray-700">{item.doc}</span>
                        {item.auto && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Auto-verified via {lookupSource}</span>}
                      </div>
                      {!item.auto && <button className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Upload</button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Send Onboarding Link to Carrier</p>
                <p className="text-xs text-blue-600">The carrier can upload all documents via a secure portal link  no login required.</p>
                <div className="flex gap-2 mt-2">
                  <input type="email" defaultValue={lookupResult?.email || ''} placeholder="carrier@email.com" className="flex-1 border border-blue-300 rounded px-3 py-1.5 text-xs" />
                  <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">Send Link</button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Auto-enroll in RMIS continuous monitoring</label>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Verify FMCSA authority via SaferSys</label>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Auto-pull insurance updates from {lookupSource}</label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setShowAddModal(false); setLookupResult(null); setLookupMC(''); }} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">{lookupResult ? 'Add Carrier & Start Onboarding' : 'Add Manually'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Carrier Scorecard Modal */}
      {showScorecard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowScorecard(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Carrier Scorecard  Weighted Ratings</h2><p className="text-xs text-gray-400 mt-0.5">Performance metrics across all active carriers</p></div>
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-6 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Weight Formula:</span>
                <span>On-Time: <strong>30%</strong></span>
                <span>Claims: <strong>20%</strong></span>
                <span>Response: <strong>15%</strong></span>
                <span>Capacity: <strong>15%</strong></span>
                <span>Rate Competitiveness: <strong>10%</strong></span>
                <span>Safety: <strong>10%</strong></span>
              </div>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">On-Time (30%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Claims (20%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Response (15%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Capacity (15%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Rate (10%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Safety (10%)</th>
                <th className="text-center px-2 py-2.5 font-medium text-gray-500">Total Score</th>
              </tr></thead><tbody>
                {[
                  { name: 'Eagle Freight Lines', mc: 'MC-123456', onTime: 98, claims: 95, response: 92, capacity: 88, rate: 85, safety: 100, total: 94.3 },
                  { name: 'Midwest Express', mc: 'MC-234567', onTime: 94, claims: 90, response: 88, capacity: 85, rate: 90, safety: 100, total: 91.4 },
                  { name: 'Thunder Road Inc.', mc: 'MC-445566', onTime: 92, claims: 85, response: 90, capacity: 80, rate: 88, safety: 95, total: 88.8 },
                  { name: 'Swift Transport', mc: 'MC-334455', onTime: 88, claims: 92, response: 85, capacity: 90, rate: 82, safety: 90, total: 88.4 },
                  { name: 'Arctic Cold Carriers', mc: 'MC-554321', onTime: 90, claims: 88, response: 80, capacity: 75, rate: 70, safety: 100, total: 85.7 },
                  { name: 'Lone Star Logistics', mc: 'MC-667788', onTime: 85, claims: 70, response: 75, capacity: 82, rate: 92, safety: 80, total: 80.2 },
                  { name: 'Budget Haulers', mc: 'MC-778899', onTime: 72, claims: 65, response: 68, capacity: 70, rate: 95, safety: 75, total: 73.3 },
                ].sort((a, b) => b.total - a.total).map((c, i) => {
                  const scoreColor = (s: number) => s >= 90 ? 'text-green-600 bg-green-50' : s >= 80 ? 'text-blue-600 bg-blue-50' : s >= 70 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5"><span className="font-semibold text-gray-900">{c.name}</span><br/><span className="text-gray-400">{c.mc}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.onTime)}`}>{c.onTime}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.claims)}`}>{c.claims}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.response)}`}>{c.response}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.capacity)}`}>{c.capacity}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.rate)}`}>{c.rate}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${scoreColor(c.safety)}`}>{c.safety}</span></td>
                      <td className="text-center px-2 py-2.5"><span className={`px-3 py-1 rounded-full font-bold text-sm ${c.total >= 90 ? 'bg-green-600 text-white' : c.total >= 80 ? 'bg-blue-600 text-white' : c.total >= 70 ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white'}`}>{c.total}</span></td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowScorecard(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
