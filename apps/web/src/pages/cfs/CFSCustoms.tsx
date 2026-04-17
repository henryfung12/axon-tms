import { useState, useMemo } from 'react';

// ─ Types ─
type CustomsTab = 'all_entries' | 'holds' | 'isf' | 'exams';

interface CustomsEntry {
  id: string; orderNumber: string; mawb: string; hawb: string; module: 'CFS_IMPORT' | 'CFS_EXPORT';
  entryNumber: string; entryType: string; filerCode: string;
  airline: string; flightNumber: string; airport: string;
  shipper: string; shipperCountry: string; consignee: string;
  commodity: string; htsCode: string; pieces: number; weight: string; declaredValue: number;
  customsStatus: 'NOT_FILED' | 'FILED' | 'UNDER_REVIEW' | 'HOLD' | 'EXAM' | 'RELEASED' | 'LIQUIDATED';
  holdType: '' | 'FDA' | 'USDA' | 'CBP' | 'TSA' | 'EPA' | 'FCC' | 'MULTI';
  holdDetails: string;
  isfStatus: 'NOT_REQUIRED' | 'NOT_FILED' | 'FILED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';
  isfFiledDate: string; isfBondType: string;
  examType: '' | 'VACIS' | 'TAIL_GATE' | 'INTENSIVE' | 'CET';
  examDate: string; examLocation: string;
  filedDate: string; releasedDate: string; liquidatedDate: string;
  broker: string; assignedTo: string;
  documents: { name: string; type: string; status: string }[];
  notes: string;
}

// ─ Mock Data ─
const MOCK_ENTRIES: CustomsEntry[] = [
  { id: 'ce1', orderNumber: 'JFK-IMP-0901', mawb: '176-82445521', hawb: 'GE-H-20260414-001', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04140001', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'Korean Air', flightNumber: 'KE 082', airport: 'JFK', shipper: 'Samsung Electronics Co.', shipperCountry: 'KR', consignee: 'Tech Distributors LLC', commodity: 'Electronic Components', htsCode: '8542.31.0000', pieces: 12, weight: '2,400 kg', declaredValue: 48000, customsStatus: 'RELEASED', holdType: '', holdDetails: '', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-12', isfBondType: 'Continuous Bond', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-13', releasedDate: '2026-04-14', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Chen Xia', documents: [{ name: 'Commercial_Invoice_Samsung.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'Packing_List_KE082.pdf', type: 'Packing List', status: 'APPROVED' }, { name: 'ISF_176-82445521.pdf', type: 'ISF Filing', status: 'ACCEPTED' }], notes: '' },
  { id: 'ce2', orderNumber: 'JFK-IMP-0902', mawb: '180-99321100', hawb: 'GE-H-20260414-002', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04140002', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'Cathay Pacific', flightNumber: 'CX 840', airport: 'JFK', shipper: 'Global Textile Co.', shipperCountry: 'HK', consignee: 'NY Fashion Import Inc.', commodity: 'Textile / Garments', htsCode: '6204.62.4020', pieces: 48, weight: '6,200 kg', declaredValue: 82000, customsStatus: 'RELEASED', holdType: '', holdDetails: '', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-12', isfBondType: 'Single Transaction', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-13', releasedDate: '2026-04-14', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Chen Xia', documents: [{ name: 'CI_GlobalTextile.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'ISF_180-99321100.pdf', type: 'ISF Filing', status: 'ACCEPTED' }], notes: 'Deconsolidation — 6 sub-lots for different consignees' },
  { id: 'ce3', orderNumber: 'JFK-IMP-0892', mawb: '131-55782100', hawb: 'GE-H-20260413-008', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04130008', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'Emirates', flightNumber: 'EK 202', airport: 'JFK', shipper: 'Arabian Fresh Foods', shipperCountry: 'AE', consignee: 'Gourmet Imports USA', commodity: 'Perishable — Fresh Dates', htsCode: '0804.10.4000', pieces: 24, weight: '3,800 kg', declaredValue: 28500, customsStatus: 'HOLD', holdType: 'FDA', holdDetails: 'FDA Prior Notice required for food imports. Shipment flagged for inspection — perishable goods must pass FDA sampling before release. Prior Notice confirmation #PN-2026-0413-88201.', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-11', isfBondType: 'Continuous Bond', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-13', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Maria Santos', documents: [{ name: 'CI_ArabianFresh.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'FDA_Prior_Notice.pdf', type: 'FDA Prior Notice', status: 'PENDING' }, { name: 'Phytosanitary_Cert.pdf', type: 'Phyto Certificate', status: 'APPROVED' }], notes: 'URGENT — perishable goods in cold storage. FDA inspection needed ASAP.' },
  { id: 'ce4', orderNumber: 'MIA-IMP-0321', mawb: '235-11887400', hawb: 'GE-H-20260414-004', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04140004', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'LATAM', flightNumber: 'LA 500', airport: 'MIA', shipper: 'FarmacÃªutica Brasil', shipperCountry: 'BR', consignee: 'US Pharma Distribution', commodity: 'Pharmaceutical — Cold Chain', htsCode: '3004.90.9290', pieces: 6, weight: '420 kg', declaredValue: 125000, customsStatus: 'HOLD', holdType: 'FDA', holdDetails: 'FDA Drug Import requires prior listing of drug establishment. NDC number verification pending. Holding at temperature-controlled facility.', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-12', isfBondType: 'Continuous Bond', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-14', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Maria Santos', documents: [{ name: 'CI_FarmBrasil.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'FDA_Drug_Listing.pdf', type: 'FDA Drug Listing', status: 'PENDING' }, { name: 'Cold_Chain_Certificate.pdf', type: 'Cold Chain Cert', status: 'APPROVED' }], notes: 'High value pharma — maintain 2-8°C until released' },
  { id: 'ce5', orderNumber: 'ORD-IMP-0450', mawb: '618-77200100', hawb: 'GE-H-20260414-011', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04140005', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'ANA', flightNumber: 'NH 112', airport: 'ORD', shipper: 'Tokyo Chemical Corp', shipperCountry: 'JP', consignee: 'Midwest Chemical Dist.', commodity: 'DG — Chemical Reagents', htsCode: '2909.19.1400', pieces: 8, weight: '640 kg', declaredValue: 18200, customsStatus: 'HOLD', holdType: 'EPA', holdDetails: 'EPA TSCA (Toxic Substances Control Act) certification required. TSCA positive declaration form needed before release.', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-12', isfBondType: 'Continuous Bond', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-14', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Chen Xia', documents: [{ name: 'CI_TokyoChem.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'MSDS_Reagents.pdf', type: 'MSDS / SDS', status: 'APPROVED' }, { name: 'TSCA_Declaration.pdf', type: 'TSCA Declaration', status: 'PENDING' }], notes: 'DG Class 6 — requires TSCA positive declaration' },
  { id: 'ce6', orderNumber: 'DFW-IMP-0210', mawb: '297-88100345', hawb: 'GE-H-20260414-006', module: 'CFS_IMPORT', entryNumber: '', entryType: '', filerCode: '', airline: 'Lufthansa', flightNumber: 'LH 438', airport: 'DFW', shipper: 'Bosch GmbH', shipperCountry: 'DE', consignee: 'Texas Industrial Supply', commodity: 'Industrial Machinery Parts', htsCode: '8479.89.9599', pieces: 16, weight: '3,200 kg', declaredValue: 44000, customsStatus: 'NOT_FILED', holdType: '', holdDetails: '', isfStatus: 'NOT_FILED', isfFiledDate: '', isfBondType: '', examType: '', examDate: '', examLocation: '', filedDate: '', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Chen Xia', documents: [], notes: 'Flight arriving 1:00 PM — ISF and entry must be filed upon arrival' },
  { id: 'ce7', orderNumber: 'ATL-IMP-0156', mawb: '057-22441890', hawb: 'GE-H-20260413-007', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04130007', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'Delta Cargo', flightNumber: 'DL 200', airport: 'ATL', shipper: 'ChÃ¢teau Wines SARL', shipperCountry: 'FR', consignee: 'Southeast Wine Imports', commodity: 'Wine — Temperature Sensitive', htsCode: '2204.21.5060', pieces: 40, weight: '4,600 kg', declaredValue: 36000, customsStatus: 'HOLD', holdType: 'MULTI', holdDetails: 'TTB (Alcohol and Tobacco) — federal basic importers permit required. USDA — wood packing material inspection (ISPM-15). Both agencies must release before cargo can move.', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-11', isfBondType: 'Continuous Bond', examType: '', examDate: '', examLocation: '', filedDate: '2026-04-13', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Maria Santos', documents: [{ name: 'CI_ChateauWines.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'TTB_Import_Permit.pdf', type: 'TTB Permit', status: 'PENDING' }, { name: 'ISPM15_WoodPacking.pdf', type: 'ISPM-15 Cert', status: 'PENDING' }], notes: 'TTB permit pending + USDA ISPM-15 wood packing check' },
  { id: 'ce8', orderNumber: 'JFK-IMP-0905', mawb: '131-99100300', hawb: 'GE-H-20260414-014', module: 'CFS_IMPORT', entryNumber: 'ENT-2026-04140008', entryType: '01 — Consumption', filerCode: 'AGS', airline: 'Emirates', flightNumber: 'EK 202', airport: 'JFK', shipper: 'Bangladesh RMG Export', shipperCountry: 'BD', consignee: 'H&M Distribution', commodity: 'Ready-Made Garments', htsCode: '6109.10.0012', pieces: 60, weight: '7,800 kg', declaredValue: 52000, customsStatus: 'EXAM', holdType: 'CBP', holdDetails: 'CBP selected for VACIS (X-ray) examination. Shipment must be presented at CBP exam site — JFK CES facility. Exam appointment scheduled.', isfStatus: 'ACCEPTED', isfFiledDate: '2026-04-12', isfBondType: 'Continuous Bond', examType: 'VACIS', examDate: '2026-04-15T09:00:00Z', examLocation: 'JFK CES — Bldg 77', filedDate: '2026-04-14', releasedDate: '', liquidatedDate: '', broker: 'AGS Broker c/o Gemini', assignedTo: 'Chen Xia', documents: [{ name: 'CI_Bangladesh_RMG.pdf', type: 'Commercial Invoice', status: 'APPROVED' }, { name: 'CBP_Exam_Notice.pdf', type: 'CBP Exam Notice', status: 'RECEIVED' }], notes: 'VACIS exam scheduled 4/15 9:00 AM at JFK CES Bldg 77' },
];

// ─ Helpers ─
const CUSTOMS_BADGE: Record<string, { label: string; color: string }> = {
  NOT_FILED: { label: 'Not Filed', color: 'bg-gray-100 text-gray-600' },
  FILED: { label: 'Filed', color: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  HOLD: { label: 'Hold', color: 'bg-red-100 text-red-800' },
  EXAM: { label: 'Exam Required', color: 'bg-orange-100 text-orange-800' },
  RELEASED: { label: 'Released', color: 'bg-green-100 text-green-800' },
  LIQUIDATED: { label: 'Liquidated', color: 'bg-gray-100 text-gray-700' },
};
const HOLD_BADGE: Record<string, { label: string; color: string; icon: string }> = {
  FDA: { label: 'FDA', color: 'bg-red-600 text-white', icon: 'ðŸ¥' },
  USDA: { label: 'USDA', color: 'bg-green-700 text-white', icon: 'ðŸŒ¿' },
  CBP: { label: 'CBP', color: 'bg-blue-800 text-white', icon: 'ðŸ›‚' },
  TSA: { label: 'TSA', color: 'bg-gray-800 text-white', icon: 'ðŸ”’' },
  EPA: { label: 'EPA', color: 'bg-teal-700 text-white', icon: 'â™»ï¸' },
  FCC: { label: 'FCC', color: 'bg-indigo-700 text-white', icon: 'ðŸ“¡' },
  MULTI: { label: 'Multi-Agency', color: 'bg-purple-700 text-white', icon: 'âš ' },
};
const ISF_BADGE: Record<string, string> = { NOT_REQUIRED: 'bg-gray-100 text-gray-500', NOT_FILED: 'bg-red-100 text-red-800', FILED: 'bg-blue-100 text-blue-800', ACCEPTED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800', AMENDED: 'bg-yellow-100 text-yellow-800' };
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fmtCurrency(n: number) { return '$' + n.toLocaleString(); }

// ─ Component ─
export function CFSCustoms() {
  const [activeTab, setActiveTab] = useState<CustomsTab>('all_entries');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEntry, setSelectedEntry] = useState<CustomsEntry | null>(null);
  const [showACE, setShowACE] = useState(false);
  const [showDutyCalc, setShowDutyCalc] = useState(false);

  const filtered = useMemo(() => MOCK_ENTRIES.filter(e => {
    if (statusFilter !== 'All' && e.customsStatus !== statusFilter) return false;
    return true;
  }), [statusFilter]);

  const stats = useMemo(() => ({
    total: MOCK_ENTRIES.length,
    holds: MOCK_ENTRIES.filter(e => e.customsStatus === 'HOLD').length,
    exams: MOCK_ENTRIES.filter(e => e.customsStatus === 'EXAM').length,
    notFiled: MOCK_ENTRIES.filter(e => e.customsStatus === 'NOT_FILED').length,
    released: MOCK_ENTRIES.filter(e => e.customsStatus === 'RELEASED').length,
    holdValue: MOCK_ENTRIES.filter(e => e.customsStatus === 'HOLD' || e.customsStatus === 'EXAM').reduce((s, e) => s + e.declaredValue, 0),
    isfPending: MOCK_ENTRIES.filter(e => e.isfStatus === 'NOT_FILED').length,
  }), []);

  const tabs = [
    { id: 'all_entries' as CustomsTab, label: 'All Entries', count: MOCK_ENTRIES.length },
    { id: 'holds' as CustomsTab, label: 'Holds & Exams', count: stats.holds + stats.exams },
    { id: 'isf' as CustomsTab, label: 'ISF Filings', count: stats.isfPending },
    { id: 'exams' as CustomsTab, label: 'CBP Exams', count: stats.exams },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-lg font-semibold text-gray-900">Customs & Compliance</h2><p className="text-xs text-gray-400 mt-0.5">ISF filing, customs clearance, agency holds, and exam management</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowDutyCalc(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ’° Duty Calculator</button>
          <button onClick={() => setShowACE(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ› ACE Portal</button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ“‹ File ISF</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ New Entry</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Entries</p><p className="text-xl font-bold text-gray-900">{stats.total}</p></div>
        <div className={`border rounded-lg p-3 ${stats.holds > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}><p className="text-xs text-gray-400 mb-1">Active Holds</p><p className={`text-xl font-bold ${stats.holds > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.holds}</p></div>
        <div className={`border rounded-lg p-3 ${stats.exams > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}><p className="text-xs text-gray-400 mb-1">Exams Pending</p><p className={`text-xl font-bold ${stats.exams > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{stats.exams}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Not Filed</p><p className={`text-xl font-bold ${stats.notFiled > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{stats.notFiled}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Released</p><p className="text-xl font-bold text-green-600">{stats.released}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Held Value</p><p className="text-xl font-bold text-red-600">{fmtCurrency(stats.holdValue)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">ISF Pending</p><p className={`text-xl font-bold ${stats.isfPending > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.isfPending}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label} {t.count !== undefined && t.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === t.id ? 'bg-violet-100 text-violet-700' : t.id === 'holds' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}</button>
        ))}
      </div>

      {/* ─ All Entries ─ */}
      {activeTab === 'all_entries' && (
        <div>
          <div className="flex gap-1 mb-3">
            {['All', 'NOT_FILED', 'HOLD', 'EXAM', 'RELEASED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded font-medium ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : CUSTOMS_BADGE[s]?.label || s}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Entry #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airline</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Airport</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Consignee</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Commodity</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">HTS</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Value</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Hold</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">ISF</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead><tbody>
              {filtered.map(e => (
                <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${e.customsStatus === 'HOLD' ? 'bg-red-50 border-l-4 border-l-red-400' : e.customsStatus === 'EXAM' ? 'bg-orange-50 border-l-4 border-l-orange-400' : e.customsStatus === 'NOT_FILED' ? 'bg-yellow-50' : ''}`} onClick={() => setSelectedEntry(e)}>
                  <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{e.entryNumber || '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-700">{e.mawb}</td>
                  <td className="px-3 py-2.5 text-gray-700">{e.airline} {e.flightNumber}</td>
                  <td className="px-3 py-2.5 text-gray-600">{e.airport}</td>
                  <td className="px-3 py-2.5 text-gray-700">{e.consignee}</td>
                  <td className="px-3 py-2.5 text-gray-600 truncate max-w-[140px]">{e.commodity}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-500 text-xs">{e.htsCode}</td>
                  <td className="px-3 py-2.5 text-right text-gray-800">{fmtCurrency(e.declaredValue)}</td>
                  <td className="px-3 py-2.5">{e.holdType ? <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${HOLD_BADGE[e.holdType].color}`}>{HOLD_BADGE[e.holdType].icon} {HOLD_BADGE[e.holdType].label}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${ISF_BADGE[e.isfStatus]}`}>{e.isfStatus.replace('_', ' ')}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${CUSTOMS_BADGE[e.customsStatus].color}`}>{CUSTOMS_BADGE[e.customsStatus].label}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      {/* ─ Holds & Exams ─ */}
      {activeTab === 'holds' && (
        <div className="space-y-3">
          {MOCK_ENTRIES.filter(e => e.customsStatus === 'HOLD' || e.customsStatus === 'EXAM').map(e => (
            <div key={e.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${e.customsStatus === 'HOLD' ? 'border-red-200 border-l-4 border-l-red-500' : 'border-orange-200 border-l-4 border-l-orange-500'}`} onClick={() => setSelectedEntry(e)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {e.holdType && <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${HOLD_BADGE[e.holdType].color}`}>{HOLD_BADGE[e.holdType].icon} {HOLD_BADGE[e.holdType].label} HOLD</span>}
                  {e.examType && <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 text-white">ðŸ” {e.examType} EXAM</span>}
                  <span className="text-sm font-bold text-gray-900">{e.orderNumber}</span>
                  <span className="font-mono text-xs text-gray-400">{e.mawb}</span>
                </div>
                <span className="text-sm font-bold text-red-600">{fmtCurrency(e.declaredValue)}</span>
              </div>
              <p className="text-xs text-gray-700 mb-2 leading-relaxed">{e.holdDetails}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{e.airline} {e.flightNumber}</span>
                <span>{e.airport}</span>
                <span>{e.commodity}</span>
                <span>{e.pieces} pcs · {e.weight}</span>
                <span>Assigned: <strong className="text-gray-700">{e.assignedTo}</strong></span>
              </div>
              <div className="flex gap-1.5 mt-2">{e.documents.filter(d => d.status === 'PENDING').map((d, i) => <span key={i} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">ðŸ“„ {d.type} — Pending</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─ ISF Filings ─ */}
      {activeTab === 'isf' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Importer Security Filing (ISF / 10+2)</h3>
            <button className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ File New ISF</button>
          </div>
          <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Order</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">MAWB</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Shipper / Country</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Consignee</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">HTS Code</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Bond Type</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Filed</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">ISF Status</th>
          </tr></thead><tbody>
            {MOCK_ENTRIES.map(e => (
              <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${e.isfStatus === 'NOT_FILED' ? 'bg-red-50 border-l-4 border-l-red-400' : e.isfStatus === 'REJECTED' ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2.5 font-semibold text-blue-600">{e.orderNumber}</td>
                <td className="px-3 py-2.5 font-mono text-gray-700">{e.mawb}</td>
                <td className="px-3 py-2.5 text-gray-700">{e.shipper}<br/><span className="text-gray-400">{e.shipperCountry}</span></td>
                <td className="px-3 py-2.5 text-gray-700">{e.consignee}</td>
                <td className="px-3 py-2.5 font-mono text-gray-500">{e.htsCode}</td>
                <td className="px-3 py-2.5 text-gray-600">{e.isfBondType || '—'}</td>
                <td className="px-3 py-2.5 text-gray-500">{fmtDate(e.isfFiledDate)}</td>
                <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${ISF_BADGE[e.isfStatus]}`}>{e.isfStatus.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {/* ─ CBP Exams ─ */}
      {activeTab === 'exams' && (
        <div>
          {MOCK_ENTRIES.filter(e => e.examType).length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center"><p className="text-2xl mb-2">âœ…</p><p className="text-sm text-gray-500">No CBP exams currently scheduled</p></div>
          ) : (
            <div className="space-y-3">
              {MOCK_ENTRIES.filter(e => e.examType).map(e => (
                <div key={e.id} className="bg-white border border-orange-200 rounded-lg p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 text-white">ðŸ” {e.examType} Examination</span><span className="text-sm font-bold">{e.orderNumber}</span></div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMS_BADGE[e.customsStatus].color}`}>{CUSTOMS_BADGE[e.customsStatus].label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-orange-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Exam Type</p><p className="text-sm font-bold text-orange-800">{e.examType}</p></div>
                    <div className="bg-orange-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Date / Time</p><p className="text-sm font-bold text-gray-900">{e.examDate ? new Date(e.examDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD'}</p></div>
                    <div className="bg-orange-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Location</p><p className="text-sm font-bold text-gray-900">{e.examLocation || 'TBD'}</p></div>
                    <div className="bg-orange-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Declared Value</p><p className="text-sm font-bold text-gray-900">{fmtCurrency(e.declaredValue)}</p></div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{e.holdDetails}</p>
                  <div className="flex gap-2"><button className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Schedule Transport to CES</button><button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">View Entry</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─ Detail Flyout ─ */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedEntry(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[500px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-900">{selectedEntry.entryNumber || selectedEntry.orderNumber}</h3><button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 text-lg">Ã—</button></div>
              <div className="flex items-center gap-2 flex-wrap"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMS_BADGE[selectedEntry.customsStatus].color}`}>{CUSTOMS_BADGE[selectedEntry.customsStatus].label}</span>{selectedEntry.holdType && <span className={`px-2 py-0.5 rounded text-xs font-bold ${HOLD_BADGE[selectedEntry.holdType].color}`}>{HOLD_BADGE[selectedEntry.holdType].icon} {HOLD_BADGE[selectedEntry.holdType].label}</span>}<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ISF_BADGE[selectedEntry.isfStatus]}`}>ISF: {selectedEntry.isfStatus.replace('_', ' ')}</span></div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Hold Alert */}
              {selectedEntry.holdDetails && (
                <div className={`rounded-lg p-3 ${selectedEntry.customsStatus === 'HOLD' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <p className={`text-xs font-bold mb-1 ${selectedEntry.customsStatus === 'HOLD' ? 'text-red-800' : 'text-orange-800'}`}>{selectedEntry.holdType ? `${HOLD_BADGE[selectedEntry.holdType].icon} ${HOLD_BADGE[selectedEntry.holdType].label} Hold Details` : 'Hold Details'}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{selectedEntry.holdDetails}</p>
                </div>
              )}
              {/* Airway Bill */}
              <div className="bg-violet-50 rounded-lg p-3"><div className="flex justify-between text-xs"><span className="text-violet-600 font-semibold">MAWB</span><span className="font-mono font-bold">{selectedEntry.mawb}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-violet-600 font-semibold">HAWB</span><span className="font-mono font-bold">{selectedEntry.hawb}</span></div></div>
              {/* Entry Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Entry Number</p><p className="text-sm font-mono font-semibold">{selectedEntry.entryNumber || 'Not assigned'}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Entry Type</p><p className="text-sm font-semibold">{selectedEntry.entryType || '—'}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Airport</p><p className="text-sm font-semibold">{selectedEntry.airport}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Broker</p><p className="text-sm font-semibold">{selectedEntry.broker}</p></div>
              </div>
              {/* Shipper / Consignee */}
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Shipper</p><p className="text-xs font-semibold">{selectedEntry.shipper}</p><p className="text-xs text-gray-400">{selectedEntry.shipperCountry}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Consignee</p><p className="text-xs font-semibold">{selectedEntry.consignee}</p></div></div>
              {/* Cargo */}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Cargo & Classification</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs"><div className="flex justify-between"><span className="text-gray-500">Commodity</span><span>{selectedEntry.commodity}</span></div><div className="flex justify-between"><span className="text-gray-500">HTS Code</span><span className="font-mono">{selectedEntry.htsCode}</span></div><div className="flex justify-between"><span className="text-gray-500">Pieces / Weight</span><span>{selectedEntry.pieces} pcs · {selectedEntry.weight}</span></div><div className="flex justify-between"><span className="text-gray-500">Declared Value</span><span className="font-bold">{fmtCurrency(selectedEntry.declaredValue)}</span></div></div></div>
              {/* ISF */}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">ISF Filing</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs"><div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-1.5 py-0.5 rounded-full font-medium ${ISF_BADGE[selectedEntry.isfStatus]}`}>{selectedEntry.isfStatus.replace('_', ' ')}</span></div><div className="flex justify-between"><span className="text-gray-500">Filed</span><span>{fmtDate(selectedEntry.isfFiledDate)}</span></div><div className="flex justify-between"><span className="text-gray-500">Bond</span><span>{selectedEntry.isfBondType || '—'}</span></div></div></div>
              {/* Timeline */}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Timeline</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs"><div className="flex justify-between"><span className="text-gray-500">Filed</span><span>{fmtDate(selectedEntry.filedDate)}</span></div><div className="flex justify-between"><span className="text-gray-500">Released</span><span className={selectedEntry.releasedDate ? 'text-green-600 font-medium' : ''}>{fmtDate(selectedEntry.releasedDate)}</span></div></div></div>
              {/* Documents */}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Documents ({selectedEntry.documents.length})</h4><div className="space-y-1">{selectedEntry.documents.map((d, i) => (<div key={i} className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><span className={`text-xs font-bold ${d.status === 'APPROVED' ? 'text-green-600' : d.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-400'}`}>{d.status === 'APPROVED' ? 'âœ“' : d.status === 'PENDING' ? 'âŸ³' : 'â—‹'}</span><div><p className="text-xs font-medium text-blue-600">{d.name}</p><p className="text-xs text-gray-400">{d.type}</p></div></div><span className={`text-xs font-medium ${d.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{d.status}</span></div>))}</div></div>
              {selectedEntry.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedEntry.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedEntry.customsStatus === 'NOT_FILED' && <button className="flex-1 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">File Entry & ISF</button>}
              {selectedEntry.customsStatus === 'HOLD' && <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Submit Hold Release Docs</button>}
              {selectedEntry.customsStatus === 'EXAM' && <button className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700">Schedule Exam Transport</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Duty / Tax Calculator Modal */}
      {showDutyCalc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDutyCalc(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ’° Duty & Tax Calculator — HTS Lookup</h2><p className="text-xs text-gray-400 mt-0.5">Calculate estimated duties, taxes, and fees based on HTS classification</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">HTS Code *</label><input type="text" defaultValue="8542.31.0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" /><p className="text-xs text-gray-400 mt-0.5">Electronic integrated circuits</p></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Declared Value *</label><input type="number" defaultValue={48000} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Country of Origin</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>KR — South Korea</option><option>CN — China</option><option>JP — Japan</option><option>DE — Germany</option><option>IN — India</option><option>VN — Vietnam</option></select></div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-blue-800 mb-2">HTS Lookup Result</h4>
                <div className="text-xs space-y-1"><div className="flex justify-between"><span className="text-gray-500">HTS Code</span><span className="font-mono font-bold">8542.31.0000</span></div><div className="flex justify-between"><span className="text-gray-500">Description</span><span>Electronic integrated circuits: Processors and controllers</span></div><div className="flex justify-between"><span className="text-gray-500">General Duty Rate</span><span className="font-bold text-gray-900">0.0% (Free)</span></div><div className="flex justify-between"><span className="text-gray-500">Special (FTA)</span><span>Free (KR) — KORUS FTA</span></div><div className="flex justify-between"><span className="text-gray-500">Column 2 Rate</span><span>35%</span></div><div className="flex justify-between"><span className="text-gray-500">Sec. 301 Tariff</span><span className="text-red-600 font-medium">25% (List 3 — China only)</span></div></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-green-800 mb-3">Estimated Duty & Tax Calculation</h4>
                <div className="space-y-1.5 text-xs"><div className="flex justify-between"><span className="text-gray-600">Declared Value (CIF)</span><span className="text-gray-900">$48,000.00</span></div><div className="flex justify-between"><span className="text-gray-600">General Duty (0.0%)</span><span className="text-gray-900">$0.00</span></div><div className="flex justify-between"><span className="text-gray-600">Merchandise Processing Fee (0.3464%)</span><span className="text-gray-900">$166.27</span></div><div className="flex justify-between"><span className="text-gray-600">Harbor Maintenance Fee (0.125%)</span><span className="text-gray-400">$0.00 (Air — exempt)</span></div><div className="flex justify-between border-t border-green-200 pt-1.5 mt-1.5"><span className="font-bold text-green-800">Total Estimated Duty & Fees</span><span className="font-bold text-green-800 text-sm">$166.27</span></div></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800"><strong>Note:</strong> This is an estimate only. Actual duties may differ based on CBP classification decisions, trade agreements, anti-dumping/countervailing duties, and other factors. Consult a licensed customs broker for binding rulings.</div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200"><button onClick={() => setShowDutyCalc(false)} className="px-4 py-2 text-sm text-gray-600">Close</button><button className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Apply to Entry</button></div>
          </div>
        </div>
      )}

      {/* ACE Direct Filing Modal */}
      {showACE && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowACE(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ› ACE — Automated Commercial Environment</h2><p className="text-xs text-gray-400 mt-0.5">Direct filing integration with CBP ACE portal</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500" /><div><p className="text-sm font-bold text-green-800">ACE Connected — AXON TMS Transport Corp</p><p className="text-xs text-green-600">Filer Code: AGS · Bond Type: Continuous · Last Sync: 2 min ago</p></div></div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400">Entries Filed (MTD)</p><p className="text-xl font-bold text-gray-900">42</p></div>
                <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400">Pending Release</p><p className="text-xl font-bold text-yellow-600">6</p></div>
                <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400">Active Holds</p><p className="text-xl font-bold text-red-600">4</p></div>
                <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400">Duty Paid (MTD)</p><p className="text-xl font-bold text-gray-900">$18,420</p></div>
              </div>

              <h4 className="text-sm font-semibold text-gray-700">Recent ACE Filings</h4>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-500">Entry #</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">MAWB</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Type</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Filed</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500">Duty</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">ACE Status</th>
              </tr></thead><tbody>
                {[
                  { entry: 'ENT-2026-04140001', mawb: '176-82445521', type: '01 — Consumption', filed: 'Apr 13', duty: 0, status: 'RELEASED', color: 'bg-green-100 text-green-800' },
                  { entry: 'ENT-2026-04140002', mawb: '180-99321100', type: '01 — Consumption', filed: 'Apr 13', duty: 2460, status: 'RELEASED', color: 'bg-green-100 text-green-800' },
                  { entry: 'ENT-2026-04130008', mawb: '131-55782100', type: '01 — Consumption', filed: 'Apr 13', duty: 855, status: 'FDA HOLD', color: 'bg-red-100 text-red-800' },
                  { entry: 'ENT-2026-04140004', mawb: '235-11887400', type: '01 — Consumption', filed: 'Apr 14', duty: 0, status: 'FDA HOLD', color: 'bg-red-100 text-red-800' },
                  { entry: 'ENT-2026-04140005', mawb: '618-77200100', type: '01 — Consumption', filed: 'Apr 14', duty: 546, status: 'EPA HOLD', color: 'bg-red-100 text-red-800' },
                  { entry: 'ENT-2026-04140008', mawb: '131-99100300', type: '01 — Consumption', filed: 'Apr 14', duty: 1560, status: 'CBP EXAM', color: 'bg-orange-100 text-orange-800' },
                ].map((f, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-blue-600">{f.entry}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{f.mawb}</td>
                    <td className="px-3 py-2 text-gray-600">{f.type}</td>
                    <td className="px-3 py-2 text-gray-500">{f.filed}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{f.duty > 0 ? `$${f.duty.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.color}`}>{f.status}</span></td>
                  </tr>
                ))}
              </tbody></table>

              <div className="bg-gray-50 rounded-lg p-3"><h4 className="text-xs font-semibold text-gray-700 mb-2">ACE Capabilities</h4><div className="grid grid-cols-2 gap-2 text-xs text-gray-600"><span>âœ“ Entry Summary (Type 01/11)</span><span>âœ“ ISF 10+2 Filing</span><span>âœ“ CBP Cargo Release</span><span>âœ“ FDA Prior Notice</span><span>âœ“ PGA Agency Messages</span><span>âœ“ Duty / Tax Calculation</span><span>âœ“ Reconciliation</span><span>âœ“ Protest Filing</span></div></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200"><button onClick={() => setShowACE(false)} className="px-4 py-2 text-sm text-gray-600">Close</button><button className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">+ File New Entry via ACE</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
