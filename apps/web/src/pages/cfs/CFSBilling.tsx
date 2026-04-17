import { useState, useMemo } from 'react';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type BillingTab = 'all_jobs' | 'by_client' | 'invoices' | 'payments' | 'rate_cards' | 'aging' | 'cw_orgs';

interface BillableJob {
  id: string; module: 'CARRIER' | 'BROKERAGE' | 'CFS_IMPORT' | 'CFS_EXPORT' | 'CFS_WAREHOUSE';
  jobNumber: string; refNumber: string;
  cwOrgCode: string; clientName: string;
  description: string; origin: string; destination: string;
  date: string; pieces: number; weight: string;
  charges: { label: string; amount: number }[];
  totalCharges: number;
  billingStatus: 'UNBILLED' | 'READY' | 'INVOICED' | 'PAID' | 'DISPUTED';
  cwJobNumber: string; invoiceNumber: string;
}

interface CWOrganization {
  orgCode: string; name: string; address: string; city: string; state: string; country: string;
  cwType: 'DEBTOR' | 'CREDITOR' | 'AGENT' | 'TRANSPORT';
  creditLimit: number; creditUsed: number; paymentTerms: string;
  carrierJobs: number; brokerageJobs: number; cfsJobs: number;
  totalBilled: number; totalOutstanding: number;
}

// â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_CW_ORGS: CWOrganization[] = [
  { orgCode: 'ACME-US', name: 'Acme Manufacturing', address: '1200 Industrial Pkwy', city: 'Detroit', state: 'MI', country: 'US', cwType: 'DEBTOR', creditLimit: 100000, creditUsed: 42800, paymentTerms: 'Net 30', carrierJobs: 8, brokerageJobs: 12, cfsJobs: 3, totalBilled: 86400, totalOutstanding: 42800 },
  { orgCode: 'WHALECO', name: 'Whaleco Services, LLC', address: '88 Commerce St', city: 'Queens', state: 'NY', country: 'US', cwType: 'DEBTOR', creditLimit: 50000, creditUsed: 18200, paymentTerms: 'Net 15', carrierJobs: 0, brokerageJobs: 0, cfsJobs: 8, totalBilled: 32400, totalOutstanding: 18200 },
  { orgCode: 'FISCALIOR', name: 'Fiscal IOR USA Inc', address: '200 S Biscayne Blvd 6th FL', city: 'Miami', state: 'FL', country: 'US', cwType: 'DEBTOR', creditLimit: 75000, creditUsed: 24900, paymentTerms: 'Net 30', carrierJobs: 0, brokerageJobs: 2, cfsJobs: 5, totalBilled: 44800, totalOutstanding: 24900 },
  { orgCode: 'HEARTFOOD', name: 'Heartland Foods', address: '450 Farm Rd', city: 'Omaha', state: 'NE', country: 'US', cwType: 'DEBTOR', creditLimit: 60000, creditUsed: 12500, paymentTerms: 'Net 30', carrierJobs: 2, brokerageJobs: 6, cfsJobs: 1, totalBilled: 28600, totalOutstanding: 12500 },
  { orgCode: 'SAMSUNG-KR', name: 'Samsung Electronics Co.', address: '129 Samsung-ro', city: 'Suwon', state: 'Gyeonggi', country: 'KR', cwType: 'AGENT', creditLimit: 200000, creditUsed: 8600, paymentTerms: 'Net 45', carrierJobs: 0, brokerageJobs: 0, cfsJobs: 4, totalBilled: 22000, totalOutstanding: 8600 },
  { orgCode: 'PROCARR-GB', name: 'Pro Carrier Ltd', address: 'Thurrock Park Way', city: 'Tilbury', state: 'Essex', country: 'GB', cwType: 'AGENT', creditLimit: 100000, creditUsed: 4990, paymentTerms: 'Net 30', carrierJobs: 0, brokerageJobs: 0, cfsJobs: 2, totalBilled: 9800, totalOutstanding: 4990 },
];

const MOCK_JOBS: BillableJob[] = [
  // Carrier jobs
  { id: 'bj1', module: 'CARRIER', jobNumber: 'LD-4521', refNumber: 'INV-2026-1042', cwOrgCode: 'ACME-US', clientName: 'Acme Manufacturing', description: 'Memphis, TN â†’ Nashville, TN', origin: 'Memphis, TN', destination: 'Nashville, TN', date: '2026-04-10', pieces: 24, weight: '42,000 lbs', charges: [{ label: 'Line Haul', amount: 2800 }, { label: 'Fuel Surcharge', amount: 280 }, { label: 'Accessorials', amount: 120 }], totalCharges: 3200, billingStatus: 'INVOICED', cwJobNumber: 'CW-T240410-0021', invoiceNumber: 'INV-2026-1042' },
  { id: 'bj2', module: 'CARRIER', jobNumber: 'LD-4522', refNumber: 'INV-2026-1043', cwOrgCode: 'ACME-US', clientName: 'Acme Manufacturing', description: 'Dallas, TX â†’ Houston, TX', origin: 'Dallas, TX', destination: 'Houston, TX', date: '2026-04-10', pieces: 18, weight: '38,000 lbs', charges: [{ label: 'Line Haul', amount: 4200 }, { label: 'Fuel Surcharge', amount: 420 }, { label: 'Accessorials', amount: 180 }], totalCharges: 4800, billingStatus: 'READY', cwJobNumber: 'CW-T240410-0022', invoiceNumber: '' },
  // Brokerage jobs
  { id: 'bj3', module: 'BROKERAGE', jobNumber: 'SH-10421', refNumber: 'INV-20260401', cwOrgCode: 'ACME-US', clientName: 'Acme Manufacturing', description: 'Detroit, MI â†’ Nashville, TN', origin: 'Detroit, MI', destination: 'Nashville, TN', date: '2026-04-13', pieces: 24, weight: '42,000 lbs', charges: [{ label: 'Freight', amount: 2800 }], totalCharges: 2800, billingStatus: 'INVOICED', cwJobNumber: 'CW-BRK-20260401', invoiceNumber: 'INV-20260401' },
  { id: 'bj4', module: 'BROKERAGE', jobNumber: 'SH-10422', refNumber: '', cwOrgCode: 'HEARTFOOD', clientName: 'Heartland Foods', description: 'Omaha, NE â†’ Denver, CO', origin: 'Omaha, NE', destination: 'Denver, CO', date: '2026-04-14', pieces: 12, weight: '28,000 lbs', charges: [{ label: 'Freight', amount: 3100 }], totalCharges: 3100, billingStatus: 'UNBILLED', cwJobNumber: '', invoiceNumber: '' },
  { id: 'bj5', module: 'BROKERAGE', jobNumber: 'SH-10425', refNumber: '', cwOrgCode: 'ACME-US', clientName: 'Acme Manufacturing', description: 'Gary, IN â†’ Columbus, OH', origin: 'Gary, IN', destination: 'Columbus, OH', date: '2026-04-14', pieces: 20, weight: '45,000 lbs', charges: [{ label: 'Freight', amount: 3200 }], totalCharges: 3200, billingStatus: 'UNBILLED', cwJobNumber: '', invoiceNumber: '' },
  // CFS Import jobs
  { id: 'bj6', module: 'CFS_IMPORT', jobNumber: 'JFK-IMP-0901', refNumber: 'MAWB 176-82445521', cwOrgCode: 'SAMSUNG-KR', clientName: 'Samsung Electronics Co.', description: 'ICN â†’ JFK Â· Korean Air KE 082', origin: 'ICN (Seoul)', destination: 'JFK (New York)', date: '2026-04-14', pieces: 12, weight: '2,400 kg', charges: [{ label: 'Terminal Handling', amount: 480 }, { label: 'CFS Handling', amount: 360 }, { label: 'Drayage â€” Terminal Pickup', amount: 650 }, { label: 'Customs Brokerage', amount: 185 }], totalCharges: 1675, billingStatus: 'READY', cwJobNumber: 'CW-CFS-20260414-01', invoiceNumber: '' },
  { id: 'bj7', module: 'CFS_IMPORT', jobNumber: 'JFK-IMP-0902', refNumber: 'MAWB 180-99321100', cwOrgCode: 'WHALECO', clientName: 'Whaleco Services, LLC', description: 'HKG â†’ JFK Â· Cathay Pacific CX 840', origin: 'HKG (Hong Kong)', destination: 'JFK (New York)', date: '2026-04-14', pieces: 48, weight: '6,200 kg', charges: [{ label: 'Terminal Handling', amount: 960 }, { label: 'CFS Handling', amount: 720 }, { label: 'Deconsolidation (6 lots)', amount: 540 }, { label: 'Drayage â€” Terminal Pickup', amount: 850 }, { label: 'Customs Brokerage', amount: 285 }], totalCharges: 3355, billingStatus: 'READY', cwJobNumber: 'CW-CFS-20260414-02', invoiceNumber: '' },
  { id: 'bj8', module: 'CFS_IMPORT', jobNumber: 'JFK-IMP-0892', refNumber: 'MAWB 131-55782100', cwOrgCode: 'WHALECO', clientName: 'Whaleco Services, LLC', description: 'DXB â†’ JFK Â· Emirates EK 202', origin: 'DXB (Dubai)', destination: 'JFK (New York)', date: '2026-04-13', pieces: 24, weight: '3,800 kg', charges: [{ label: 'Terminal Handling', amount: 480 }, { label: 'CFS Handling', amount: 360 }, { label: 'Cold Storage (per day)', amount: 120 }, { label: 'Drayage â€” Terminal Pickup', amount: 650 }], totalCharges: 1610, billingStatus: 'UNBILLED', cwJobNumber: '', invoiceNumber: '' },
  // CFS Export jobs
  { id: 'bj9', module: 'CFS_EXPORT', jobNumber: 'JFK-EXP-0501', refNumber: 'AWB 125-19994715', cwOrgCode: 'FISCALIOR', clientName: 'Fiscal IOR USA Inc', description: 'JFK â†’ LHR Â· British Airways BA 0182', origin: 'JFK (New York)', destination: 'LHR (London)', date: '2026-04-14', pieces: 5, weight: '853 kg', charges: [{ label: 'Export Handling', amount: 320 }, { label: 'TSA Screening', amount: 150 }, { label: 'Drayage â€” Terminal Delivery', amount: 550 }, { label: 'Documentation', amount: 95 }], totalCharges: 1115, billingStatus: 'INVOICED', cwJobNumber: 'CW-CFS-20260414-03', invoiceNumber: 'GE-CFS-20260414' },
  { id: 'bj10', module: 'CFS_EXPORT', jobNumber: 'JFK-EXP-0502', refNumber: 'MAWB 176-88100502', cwOrgCode: 'WHALECO', clientName: 'Whaleco Services, LLC', description: 'JFK â†’ HKG Â· Cathay Pacific CX 841', origin: 'JFK (New York)', destination: 'HKG (Hong Kong)', date: '2026-04-14', pieces: 32, weight: '4,200 kg', charges: [{ label: 'Export Handling', amount: 640 }, { label: 'TSA Screening', amount: 300 }, { label: 'Consolidation (4 shippers)', amount: 480 }, { label: 'Drayage â€” Terminal Delivery', amount: 850 }, { label: 'Documentation', amount: 185 }], totalCharges: 2455, billingStatus: 'READY', cwJobNumber: 'CW-CFS-20260414-04', invoiceNumber: '' },
  // CFS Warehouse
  { id: 'bj11', module: 'CFS_WAREHOUSE', jobNumber: 'WH-STG-0412', refNumber: '', cwOrgCode: 'WHALECO', clientName: 'Whaleco Services, LLC', description: 'Storage â€” Zone B Cold Storage (2 days)', origin: 'CFS Warehouse', destination: 'CFS Warehouse', date: '2026-04-14', pieces: 24, weight: '3,800 kg', charges: [{ label: 'Cold Storage Day 1', amount: 120 }, { label: 'Cold Storage Day 2', amount: 120 }], totalCharges: 240, billingStatus: 'UNBILLED', cwJobNumber: '', invoiceNumber: '' },
  { id: 'bj12', module: 'CFS_WAREHOUSE', jobNumber: 'WH-STG-0413', refNumber: '', cwOrgCode: 'SAMSUNG-KR', clientName: 'Samsung Electronics Co.', description: 'Storage â€” Zone D Bonded (1 day)', origin: 'CFS Warehouse', destination: 'CFS Warehouse', date: '2026-04-14', pieces: 2, weight: '12 kg', charges: [{ label: 'Bonded Storage Day 1', amount: 85 }], totalCharges: 85, billingStatus: 'UNBILLED', cwJobNumber: '', invoiceNumber: '' },
];

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MODULE_BADGE: Record<string, { label: string; color: string }> = {
  CARRIER: { label: 'Carrier', color: 'bg-blue-100 text-blue-800' },
  BROKERAGE: { label: 'Brokerage', color: 'bg-emerald-100 text-emerald-800' },
  CFS_IMPORT: { label: 'CFS Import', color: 'bg-violet-100 text-violet-800' },
  CFS_EXPORT: { label: 'CFS Export', color: 'bg-orange-100 text-orange-800' },
  CFS_WAREHOUSE: { label: 'Warehouse', color: 'bg-purple-100 text-purple-800' },
};
const BILL_STATUS: Record<string, { label: string; color: string }> = {
  UNBILLED: { label: 'Unbilled', color: 'bg-gray-100 text-gray-600' },
  READY: { label: 'Ready to Bill', color: 'bg-yellow-100 text-yellow-800' },
  INVOICED: { label: 'Invoiced', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-100 text-red-800' },
};
function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'â€”'; }

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function CFSBilling() {
  const [activeTab, setActiveTab] = useState<BillingTab>('all_jobs');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<BillableJob | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<CWOrganization | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [showCreditMemo, setShowCreditMemo] = useState(false);
  const [showInvoicePDF, setShowInvoicePDF] = useState(false);

  const filtered = useMemo(() => MOCK_JOBS.filter(j => {
    if (moduleFilter !== 'All' && j.module !== moduleFilter) return false;
    if (statusFilter !== 'All' && j.billingStatus !== statusFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return j.jobNumber.toLowerCase().includes(q) || j.clientName.toLowerCase().includes(q) || j.cwOrgCode.toLowerCase().includes(q) || j.refNumber.toLowerCase().includes(q); }
    return true;
  }), [moduleFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    totalJobs: MOCK_JOBS.length,
    unbilled: MOCK_JOBS.filter(j => j.billingStatus === 'UNBILLED').reduce((s, j) => s + j.totalCharges, 0),
    unbilledCount: MOCK_JOBS.filter(j => j.billingStatus === 'UNBILLED').length,
    ready: MOCK_JOBS.filter(j => j.billingStatus === 'READY').reduce((s, j) => s + j.totalCharges, 0),
    readyCount: MOCK_JOBS.filter(j => j.billingStatus === 'READY').length,
    invoiced: MOCK_JOBS.filter(j => j.billingStatus === 'INVOICED').reduce((s, j) => s + j.totalCharges, 0),
    totalRevenue: MOCK_JOBS.reduce((s, j) => s + j.totalCharges, 0),
  }), []);

  const toggleJobSelect = (id: string) => setSelectedJobIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const tabs = [
    { id: 'all_jobs' as BillingTab, label: 'All Billable Jobs', count: MOCK_JOBS.length },
    { id: 'by_client' as BillingTab, label: 'By Client / Org', count: MOCK_CW_ORGS.length },
    { id: 'invoices' as BillingTab, label: 'Invoices', count: MOCK_JOBS.filter(j => j.billingStatus === 'INVOICED').length },
    { id: 'payments' as BillingTab, label: 'Payments' },
    { id: 'rate_cards' as BillingTab, label: 'Rate Cards' },
    { id: 'aging' as BillingTab, label: 'Aging' },
    { id: 'cw_orgs' as BillingTab, label: 'CW Org Codes' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-lg font-semibold text-gray-900">Unified Billing</h2><p className="text-xs text-gray-400 mt-0.5">All jobs across Carrier, Brokerage & CFS â€” linked via CargoWise organization codes</p></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-medium text-green-800">CargoWise Linked</span></div>
          <button onClick={() => setShowCreditMemo(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ“ Credit Memo</button>
          <button onClick={() => setShowInvoicePDF(true)} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ“„ Invoice PDF</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">+ Generate Invoice</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Revenue (All)</p><p className="text-xl font-bold text-gray-900">{fmtCurrency(stats.totalRevenue)}</p><p className="text-xs text-gray-400 mt-1">{stats.totalJobs} jobs</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Unbilled</p><p className="text-xl font-bold text-red-600">{fmtCurrency(stats.unbilled)}</p><p className="text-xs text-red-500 mt-1">{stats.unbilledCount} jobs need billing</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Ready to Invoice</p><p className="text-xl font-bold text-yellow-600">{fmtCurrency(stats.ready)}</p><p className="text-xs text-yellow-600 mt-1">{stats.readyCount} jobs ready</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Invoiced</p><p className="text-xl font-bold text-blue-600">{fmtCurrency(stats.invoiced)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">CW Organizations</p><p className="text-xl font-bold text-gray-900">{MOCK_CW_ORGS.length}</p><p className="text-xs text-gray-400 mt-1">Linked clients</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Modules</p><div className="flex gap-1 mt-1">{['CARRIER', 'BROKERAGE', 'CFS_IMPORT'].map(m => <span key={m} className={`px-1.5 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[m].color}`}>{MODULE_BADGE[m].label.split(' ')[0]}</span>)}</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label} {t.count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}</button>
        ))}
      </div>

      {/* â”€â”€ All Billable Jobs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'all_jobs' && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs"><option value="All">All Modules</option>{Object.entries(MODULE_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs"><option value="All">All Statuses</option>{Object.entries(BILL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search job, client, org code, MAWB..." className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-xs" />
          </div>

          {/* Selection bar */}
          {selectedJobIds.size > 0 && (
            <div className="mb-3 bg-violet-600 text-white rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-bold">{selectedJobIds.size} job{selectedJobIds.size > 1 ? 's' : ''} selected â€” {fmtCurrency(MOCK_JOBS.filter(j => selectedJobIds.has(j.id)).reduce((s, j) => s + j.totalCharges, 0))}</span>
              <div className="flex gap-2"><button className="px-4 py-1.5 text-sm font-semibold bg-white text-violet-700 rounded-lg">Generate Combined Invoice</button><button onClick={() => setSelectedJobIds(new Set())} className="px-3 py-1.5 text-sm text-violet-200">Clear</button></div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 w-8"><input type="checkbox" className="rounded text-violet-600" /></th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Module</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Job #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Org</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Client</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Description</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Charges</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Job</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead><tbody>
              {filtered.map(j => (
                <tr key={j.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedJobIds.has(j.id) ? 'bg-violet-50' : j.billingStatus === 'UNBILLED' ? 'bg-red-50' : ''}`} onClick={() => setSelectedJob(j)}>
                  <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleJobSelect(j.id); }}><input type="checkbox" checked={selectedJobIds.has(j.id)} onChange={() => {}} className="rounded text-violet-600" /></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[j.module].color}`}>{MODULE_BADGE[j.module].label}</span></td>
                  <td className="px-3 py-2.5 font-semibold text-blue-600">{j.jobNumber}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-violet-600 font-medium">{j.cwOrgCode}</td>
                  <td className="px-3 py-2.5 text-gray-700">{j.clientName}</td>
                  <td className="px-3 py-2.5 text-gray-600 truncate max-w-[200px]">{j.description}</td>
                  <td className="px-3 py-2.5 text-gray-500">{fmtDate(j.date)}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(j.totalCharges)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{j.cwJobNumber || 'â€”'}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[j.billingStatus].color}`}>{BILL_STATUS[j.billingStatus].label}</span></td>
                </tr>
              ))}
            </tbody></table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span>Showing: <strong>{filtered.length}</strong></span>
              <span>Total: <strong>{fmtCurrency(filtered.reduce((s, j) => s + j.totalCharges, 0))}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ By Client / Org â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'by_client' && (
        <div className="space-y-4">
          {MOCK_CW_ORGS.map(org => {
            const orgJobs = MOCK_JOBS.filter(j => j.cwOrgCode === org.orgCode);
            const unbilled = orgJobs.filter(j => j.billingStatus === 'UNBILLED' || j.billingStatus === 'READY');
            return (
              <div key={org.orgCode} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-violet-100 text-violet-800 text-xs font-bold rounded font-mono">{org.orgCode}</span>
                    <div><p className="text-sm font-bold text-gray-900">{org.name}</p><p className="text-xs text-gray-400">{org.city}, {org.state} {org.country} Â· {org.paymentTerms}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">{org.carrierJobs > 0 && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Carrier: {org.carrierJobs}</span>}{org.brokerageJobs > 0 && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Broker: {org.brokerageJobs}</span>}{org.cfsJobs > 0 && <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800">CFS: {org.cfsJobs}</span>}</div>
                    {unbilled.length > 0 && <button className="px-3 py-1 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">Invoice {unbilled.length} Jobs ({fmtCurrency(unbilled.reduce((s, j) => s + j.totalCharges, 0))})</button>}
                  </div>
                </div>
                {orgJobs.length > 0 && (
                  <table className="w-full text-xs"><tbody>
                    {orgJobs.map(j => (
                      <tr key={j.id} className={`border-b border-gray-50 hover:bg-gray-50 ${j.billingStatus === 'UNBILLED' ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[j.module].color}`}>{MODULE_BADGE[j.module].label}</span></td>
                        <td className="px-3 py-2 font-semibold text-blue-600">{j.jobNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{j.description}</td>
                        <td className="px-3 py-2 text-gray-500">{fmtDate(j.date)}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{fmtCurrency(j.totalCharges)}</td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[j.billingStatus].color}`}>{BILL_STATUS[j.billingStatus].label}</span></td>
                      </tr>
                    ))}
                  </tbody></table>
                )}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
                  <span>Total Billed: <strong className="text-gray-800">{fmtCurrency(org.totalBilled)}</strong></span>
                  <span>Outstanding: <strong className="text-red-600">{fmtCurrency(org.totalOutstanding)}</strong></span>
                  <span>Credit: <strong>{fmtCurrency(org.creditUsed)}</strong> / {fmtCurrency(org.creditLimit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ Invoices Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Invoice #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Module</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Job #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Org</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Client</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Job</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          </tr></thead><tbody>
            {MOCK_JOBS.filter(j => j.invoiceNumber).map(j => (
              <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5 font-semibold text-gray-900">{j.invoiceNumber}</td>
                <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[j.module].color}`}>{MODULE_BADGE[j.module].label}</span></td>
                <td className="px-3 py-2.5 text-blue-600 font-medium">{j.jobNumber}</td>
                <td className="px-3 py-2.5 font-mono text-violet-600">{j.cwOrgCode}</td>
                <td className="px-3 py-2.5 text-gray-700">{j.clientName}</td>
                <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(j.totalCharges)}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{j.cwJobNumber}</td>
                <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[j.billingStatus].color}`}>{BILL_STATUS[j.billingStatus].label}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {/* â”€â”€ Payments Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'payments' && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Received (MTD)</p><p className="text-xl font-bold text-green-600">$42,800</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Pending Matching</p><p className="text-xl font-bold text-yellow-600">$8,200</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Unmatched</p><p className="text-xl font-bold text-red-600">$1,450</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Payment Methods</p><div className="flex gap-1 mt-1"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">ACH</span><span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Wire</span><span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">Check</span></div></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Payment Register â€” Remittance Matching</h3><button className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg">+ Record Payment</button></div>
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Reference</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Client</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Method</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Matched Invoice</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th></tr></thead><tbody>
              {[
                { date: 'Apr 14', ref: 'ACH-20260414-001', client: 'Acme Manufacturing', method: 'ACH', amount: 6000, invoice: 'INV-2026-1042 + INV-20260401', status: 'MATCHED' },
                { date: 'Apr 13', ref: 'WIR-20260413-001', client: 'Samsung Electronics', method: 'Wire', amount: 1675, invoice: 'â€”', status: 'PENDING' },
                { date: 'Apr 12', ref: 'CHK-88421', client: 'Heartland Foods', method: 'Check', amount: 3100, invoice: 'â€”', status: 'UNMATCHED' },
                { date: 'Apr 11', ref: 'ACH-20260411-002', client: 'Fiscal IOR USA', method: 'ACH', amount: 1115, invoice: 'GE-CFS-20260414', status: 'MATCHED' },
                { date: 'Apr 10', ref: 'WIR-20260410-001', client: 'Whaleco Services', method: 'Wire', amount: 8200, invoice: 'â€”', status: 'PENDING' },
              ].map((p, i) => (
                <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${p.status === 'UNMATCHED' ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2.5 text-gray-600">{p.date}</td><td className="px-3 py-2.5 font-mono text-gray-700">{p.ref}</td><td className="px-3 py-2.5 text-gray-700">{p.client}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.method === 'ACH' ? 'bg-blue-100 text-blue-800' : p.method === 'Wire' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{p.method}</span></td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(p.amount)}</td><td className="px-3 py-2.5 text-gray-600">{p.invoice}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'MATCHED' ? 'bg-green-100 text-green-800' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>{p.status !== 'MATCHED' && <button className="ml-2 text-xs text-blue-600 hover:underline">Match</button>}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      {/* â”€â”€ Rate Cards Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'rate_cards' && (
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Client Rate Cards</h3><button className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg">+ New Rate Card</button></div>
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2.5 font-medium text-gray-500">Client</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Org</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">CFS Handling</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Terminal Fee</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Drayage</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Storage/Day</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Customs</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Effective</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th></tr></thead><tbody>
              {[
                { client: 'Acme Manufacturing', org: 'ACME-US', handling: 0.08, terminal: 0.12, drayage: 650, storage: 45, customs: 185, effective: 'Jan 1 â€” Dec 31', status: 'ACTIVE' },
                { client: 'Whaleco Services', org: 'WHALECO', handling: 0.06, terminal: 0.10, drayage: 550, storage: 35, customs: 165, effective: 'Mar 1 â€” Feb 28', status: 'ACTIVE' },
                { client: 'Samsung Electronics', org: 'SAMSUNG-KR', handling: 0.10, terminal: 0.15, drayage: 750, storage: 55, customs: 225, effective: 'Jan 1 â€” Dec 31', status: 'ACTIVE' },
                { client: 'Fiscal IOR USA', org: 'FISCALIOR', handling: 0.07, terminal: 0.11, drayage: 600, storage: 40, customs: 175, effective: 'Apr 1 â€” Mar 31', status: 'ACTIVE' },
                { client: 'Heartland Foods', org: 'HEARTFOOD', handling: 0.09, terminal: 0.13, drayage: 700, storage: 50, customs: 195, effective: 'Jan 1 â€” Jun 30', status: 'ACTIVE' },
              ].map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{r.client}</td><td className="px-3 py-2.5 font-mono text-violet-600">{r.org}</td>
                  <td className="px-3 py-2.5 text-right">${r.handling}/kg</td><td className="px-3 py-2.5 text-right">${r.terminal}/kg</td><td className="px-3 py-2.5 text-right">${r.drayage}</td><td className="px-3 py-2.5 text-right">${r.storage}/day</td><td className="px-3 py-2.5 text-right">${r.customs}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.effective}</td><td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{r.status}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      {/* â”€â”€ Aging Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'aging' && (
        <div>
          <div className="grid grid-cols-6 gap-3 mb-4">
            {[
              { label: 'Current', amount: 11285, count: 4, color: 'border-green-400 bg-green-50' },
              { label: '1-30 Days', amount: 4800, count: 1, color: 'border-yellow-400 bg-yellow-50' },
              { label: '31-60 Days', amount: 3200, count: 1, color: 'border-orange-400 bg-orange-50' },
              { label: '61-90 Days', amount: 0, count: 0, color: 'border-red-400 bg-red-50' },
              { label: '90+ Days', amount: 0, count: 0, color: 'border-red-600 bg-red-100' },
              { label: 'Total Outstanding', amount: 19285, count: 6, color: 'border-gray-400 bg-gray-50' },
            ].map(b => (
              <div key={b.label} className={`rounded-lg p-3 border-l-4 ${b.color}`}><p className="text-xs text-gray-500 mb-1">{b.label}</p><p className="text-lg font-bold text-gray-900">{fmtCurrency(b.amount)}</p><p className="text-xs text-gray-400 mt-1">{b.count} invoice{b.count !== 1 ? 's' : ''}</p></div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2.5 font-medium text-gray-500">Client / Org</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Current</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">1-30</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">31-60</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">61-90</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">90+</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Total</th></tr></thead><tbody>
              {[
                { client: 'Acme Manufacturing', current: 8000, d30: 4800, d60: 3200, d90: 0, over90: 0 },
                { client: 'Whaleco Services', current: 6050, d30: 0, d60: 0, d90: 0, over90: 0 },
                { client: 'Fiscal IOR USA', current: 0, d30: 0, d60: 0, d90: 0, over90: 0 },
                { client: 'Samsung Electronics', current: 1760, d30: 0, d60: 0, d90: 0, over90: 0 },
                { client: 'Heartland Foods', current: 3100, d30: 0, d60: 0, d90: 0, over90: 0 },
              ].map((a, i) => {
                const total = a.current + a.d30 + a.d60 + a.d90 + a.over90;
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{a.client}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{a.current > 0 ? fmtCurrency(a.current) : 'â€”'}</td>
                    <td className="px-3 py-2.5 text-right text-yellow-600">{a.d30 > 0 ? fmtCurrency(a.d30) : 'â€”'}</td>
                    <td className="px-3 py-2.5 text-right text-orange-600">{a.d60 > 0 ? fmtCurrency(a.d60) : 'â€”'}</td>
                    <td className="px-3 py-2.5 text-right text-red-600">{a.d90 > 0 ? fmtCurrency(a.d90) : 'â€”'}</td>
                    <td className="px-3 py-2.5 text-right text-red-800 font-bold">{a.over90 > 0 ? fmtCurrency(a.over90) : 'â€”'}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-gray-900">{total > 0 ? fmtCurrency(total) : 'â€”'}</td>
                  </tr>
                );
              })}
            </tbody></table>
          </div>
        </div>
      )}

      {/* â”€â”€ CargoWise Org Codes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'cw_orgs' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">CargoWise Organization Codes â€” Auto-Match</h3>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">CW Sync Active</span></div>
          </div>
          <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Org Code</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Organization</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Modules</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Terms</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Credit Used</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Outstanding</th>
          </tr></thead><tbody>
            {MOCK_CW_ORGS.map(org => {
              const creditPct = Math.round((org.creditUsed / org.creditLimit) * 100);
              return (
                <tr key={org.orgCode} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${creditPct > 80 ? 'bg-yellow-50' : ''}`} onClick={() => setSelectedOrg(org)}>
                  <td className="px-3 py-2.5 font-mono text-violet-600 font-bold">{org.orgCode}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{org.name}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${org.cwType === 'DEBTOR' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>{org.cwType}</span></td>
                  <td className="px-3 py-2.5 text-gray-600">{org.city}, {org.state} {org.country}</td>
                  <td className="px-3 py-2.5"><div className="flex gap-1">{org.carrierJobs > 0 && <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">{org.carrierJobs}</span>}{org.brokerageJobs > 0 && <span className="px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs">{org.brokerageJobs}</span>}{org.cfsJobs > 0 && <span className="px-1 py-0.5 rounded bg-violet-100 text-violet-800 text-xs">{org.cfsJobs}</span>}</div></td>
                  <td className="px-3 py-2.5 text-gray-600">{org.paymentTerms}</td>
                  <td className="px-3 py-2.5 text-right"><span className={`font-medium ${creditPct > 80 ? 'text-red-600' : 'text-gray-900'}`}>{fmtCurrency(org.creditUsed)}</span><span className="text-gray-400"> / {fmtCurrency(org.creditLimit)}</span></td>
                  <td className="px-3 py-2.5 text-right font-medium text-red-600">{fmtCurrency(org.totalOutstanding)}</td>
                </tr>
              );
            })}
          </tbody></table>
        </div>
      )}

      {/* â”€â”€ Job Detail Flyout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedJob(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[480px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${MODULE_BADGE[selectedJob.module].color}`}>{MODULE_BADGE[selectedJob.module].label}</span><h3 className="text-sm font-bold text-gray-900">{selectedJob.jobNumber}</h3></div><button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-lg">Ã—</button></div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[selectedJob.billingStatus].color}`}>{BILL_STATUS[selectedJob.billingStatus].label}</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-violet-50 rounded-lg p-3"><div className="flex justify-between text-xs mb-1"><span className="text-violet-600 font-semibold">CargoWise Link</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Org Code</span><span className="font-mono font-bold text-violet-800">{selectedJob.cwOrgCode}</span></div><div className="flex justify-between text-xs mt-1"><span className="text-gray-500">CW Job</span><span className="font-mono text-gray-700">{selectedJob.cwJobNumber || 'Not yet synced'}</span></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Client</p><p className="text-sm font-semibold">{selectedJob.clientName}</p></div><div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-400">Date</p><p className="text-sm font-semibold">{fmtDate(selectedJob.date)}</p></div></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Route / Description</p><p className="text-sm text-gray-800">{selectedJob.description}</p></div>
              {selectedJob.refNumber && <div><p className="text-xs text-gray-400 mb-0.5">Reference</p><p className="text-sm font-mono text-gray-800">{selectedJob.refNumber}</p></div>}
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Charge Breakdown</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5">{selectedJob.charges.map((c, i) => (<div key={i} className="flex justify-between text-xs"><span className="text-gray-600">{c.label}</span><span className="text-gray-900">{fmtCurrency(c.amount)}</span></div>))}<div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2"><span className="font-semibold text-gray-700">Total</span><span className="font-bold text-gray-900">{fmtCurrency(selectedJob.totalCharges)}</span></div></div></div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {selectedJob.billingStatus === 'UNBILLED' && <button className="flex-1 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700">Mark Ready to Bill</button>}
              {selectedJob.billingStatus === 'READY' && <button className="flex-1 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">Generate Invoice</button>}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">View in {MODULE_BADGE[selectedJob.module].label}</button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Memo Modal */}
      {showCreditMemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreditMemo(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ“ Create Credit Memo / Adjustment</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Credit Memo</option><option>Debit Memo</option><option>Rate Adjustment</option><option>Billing Correction</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Original Invoice</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>INV-2026-1042 â€” Acme ($3,200)</option><option>INV-20260401 â€” Acme ($2,800)</option><option>GE-CFS-20260414 â€” Fiscal IOR ($1,115)</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Amount</label><input type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Reason Code</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Rate discrepancy</option><option>Service not rendered</option><option>Cargo damage claim</option><option>Duplicate charge</option><option>Customer dispute</option><option>Billing error</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Description</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Describe the reason for credit/adjustment..." /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Approval</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Requires Manager Approval</option><option>Auto-Approve (under $500)</option></select></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200"><button onClick={() => setShowCreditMemo(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={() => setShowCreditMemo(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">Create Credit Memo</button></div>
          </div>
        </div>
      )}

      {/* Invoice PDF Preview Modal */}
      {showInvoicePDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInvoicePDF(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">ðŸ“„ Invoice PDF â€” Preview & Send</h2></div>
            <div className="px-6 py-4">
              <div className="border border-gray-300 rounded-lg p-8 bg-white" style={{ fontFamily: 'serif' }}>
                <div className="flex justify-between items-start mb-6">
                  <div><p className="text-xl font-bold text-gray-900">AXON TMS</p><p className="text-xs text-gray-500">Transport Corporation</p><p className="text-xs text-gray-400 mt-1">184-54 149th Avenue, 1st Floor</p><p className="text-xs text-gray-400">Springfield Gardens, NY 11413</p><p className="text-xs text-gray-400">Phone: (718) 555-0100</p></div>
                  <div className="text-right"><p className="text-2xl font-bold text-violet-700">INVOICE</p><p className="text-sm text-gray-600 mt-1">INV-2026-1042</p><p className="text-xs text-gray-400 mt-1">Date: April 14, 2026</p><p className="text-xs text-gray-400">Due: May 14, 2026</p><p className="text-xs text-gray-400">Terms: Net 30</p></div>
                </div>
                <div className="bg-gray-50 rounded p-3 mb-4"><p className="text-xs text-gray-400">Bill To:</p><p className="text-sm font-bold">Acme Manufacturing</p><p className="text-xs text-gray-600">1200 Industrial Pkwy, Detroit, MI</p><p className="text-xs text-gray-400">CW Org: ACME-US</p></div>
                <table className="w-full text-xs mb-4"><thead><tr className="border-b-2 border-gray-300"><th className="text-left py-2">Description</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Rate</th><th className="text-right py-2">Amount</th></tr></thead><tbody>
                  <tr className="border-b border-gray-200"><td className="py-2">Line Haul â€” Memphis, TN â†’ Nashville, TN</td><td className="text-right py-2">1</td><td className="text-right py-2">$2,800.00</td><td className="text-right py-2">$2,800.00</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Fuel Surcharge (10%)</td><td className="text-right py-2">1</td><td className="text-right py-2">$280.00</td><td className="text-right py-2">$280.00</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Accessorials â€” Liftgate</td><td className="text-right py-2">1</td><td className="text-right py-2">$120.00</td><td className="text-right py-2">$120.00</td></tr>
                </tbody><tfoot><tr className="border-t-2 border-gray-300"><td colSpan={3} className="text-right py-2 font-bold">Total Due:</td><td className="text-right py-2 font-bold text-lg">$3,200.00</td></tr></tfoot></table>
                <p className="text-xs text-gray-400 text-center mt-4">Thank you for your business â€” AXON TMS Transport Corporation</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowInvoicePDF(false)} className="px-4 py-2 text-sm text-gray-600">Close</button>
              <div className="flex gap-2"><button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">â¬‡ Download PDF</button><button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">ðŸ–¨ Print</button><button className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg">ðŸ“§ Email to Client</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
