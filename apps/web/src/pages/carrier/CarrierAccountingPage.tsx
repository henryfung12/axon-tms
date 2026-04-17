import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
type CWSyncStatus = 'NOT_SYNCED' | 'PUSHED_TO_CW' | 'JOB_CREATED' | 'INVOICE_MATCHED' | 'INVOICE_CLOSED' | 'SENT_TO_CLIENT' | 'PAID' | 'SYNC_ERROR';

interface Invoice {
  id: string;
  loadNumber: string;
  loadId: string;
  invoiceNumber: string;
  cwJobNumber: string | null;
  cwSyncStatus: CWSyncStatus;
  cwLastSync: string | null;
  cwErrorMessage: string | null;
  customer: string;
  customerEmail: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  lineHaul: number;
  fuelSurcharge: number;
  accessorials: number;
  totalAmount: number;
  amountPaid: number;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'INVOICED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID';
  driverName: string;
  equipment: string;
  mileage: number;
  createdAt: string;
  notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1', loadNumber: 'LD-4521', loadId: 'L001', invoiceNumber: 'INV-2026-1042', cwJobNumber: 'CW-T240410-0021', cwSyncStatus: 'SENT_TO_CLIENT', cwLastSync: '2026-04-11T14:30:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - LAX', customerEmail: 'ap@acmelax.com', origin: 'Memphis, TN', destination: 'Nashville, TN', pickupDate: '2026-04-10', deliveryDate: '2026-04-10',
    lineHaul: 2800, fuelSurcharge: 280, accessorials: 120, totalAmount: 3200, amountPaid: 0, dueDate: '2026-05-10',
    status: 'INVOICED', driverName: 'Marcus Johnson', equipment: "Van - 53'", mileage: 450, createdAt: '2026-04-10', notes: '',
  },
  {
    id: 'inv2', loadNumber: 'LD-4522', loadId: 'L002', invoiceNumber: 'INV-2026-1043', cwJobNumber: 'CW-T240410-0022', cwSyncStatus: 'INVOICE_MATCHED', cwLastSync: '2026-04-11T15:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - ORD', customerEmail: 'ap@acmeord.com', origin: 'Dallas, TX', destination: 'Houston, TX', pickupDate: '2026-04-10', deliveryDate: '2026-04-10',
    lineHaul: 4200, fuelSurcharge: 420, accessorials: 180, totalAmount: 4800, amountPaid: 0, dueDate: '2026-05-10',
    status: 'PENDING', driverName: 'Sarah Chen', equipment: "Reefer - 53'", mileage: 720, createdAt: '2026-04-10', notes: 'Ready to close & send',
  },
  {
    id: 'inv3', loadNumber: 'LD-4523', loadId: 'L003', invoiceNumber: 'INV-2026-1044', cwJobNumber: 'CW-T240410-0023', cwSyncStatus: 'JOB_CREATED', cwLastSync: '2026-04-10T09:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - EWR', customerEmail: 'ap@acmeewr.com', origin: 'Gary, IN', destination: 'Columbus, OH', pickupDate: '2026-04-10', deliveryDate: '2026-04-10',
    lineHaul: 4900, fuelSurcharge: 490, accessorials: 210, totalAmount: 5600, amountPaid: 0, dueDate: '2026-05-24',
    status: 'DRAFT', driverName: 'James Williams', equipment: "Flatbed - 48'", mileage: 890, createdAt: '2026-04-10', notes: 'Awaiting BOL confirmation',
  },
  {
    id: 'inv4', loadNumber: 'LD-4518', loadId: 'L004', invoiceNumber: 'INV-2026-1038', cwJobNumber: 'CW-T240408-0015', cwSyncStatus: 'PAID', cwLastSync: '2026-04-12T10:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - DFW', customerEmail: 'ap@acmedfw.com', origin: 'Nashville, TN', destination: 'Louisville, KY', pickupDate: '2026-04-08', deliveryDate: '2026-04-08',
    lineHaul: 2500, fuelSurcharge: 250, accessorials: 150, totalAmount: 2900, amountPaid: 2900, dueDate: '2026-05-08',
    status: 'PAID', driverName: 'Robert Brown', equipment: "Van - 53'", mileage: 380, createdAt: '2026-04-08', notes: 'Quick pay via factoring',
  },
  {
    id: 'inv5', loadNumber: 'LD-4510', loadId: 'L005', invoiceNumber: 'INV-2026-1030', cwJobNumber: 'CW-T240405-0008', cwSyncStatus: 'SENT_TO_CLIENT', cwLastSync: '2026-04-06T11:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - ATL', customerEmail: 'ap@acmeatl.com', origin: 'Atlanta, GA', destination: 'Jacksonville, FL', pickupDate: '2026-04-05', deliveryDate: '2026-04-05',
    lineHaul: 2700, fuelSurcharge: 270, accessorials: 130, totalAmount: 3100, amountPaid: 1500, dueDate: '2026-05-05',
    status: 'PARTIAL', driverName: 'Maria Rodriguez', equipment: "Van - 53'", mileage: 410, createdAt: '2026-04-05', notes: 'Partial payment received 4/12 — $1,500. Balance due $1,600.',
  },
  {
    id: 'inv6', loadNumber: 'LD-4495', loadId: 'L006', invoiceNumber: 'INV-2026-1018', cwJobNumber: 'CW-T240328-0042', cwSyncStatus: 'SENT_TO_CLIENT', cwLastSync: '2026-03-29T08:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - EWR', customerEmail: 'ap@acmeewr.com', origin: 'Denver, CO', destination: 'Salt Lake City, UT', pickupDate: '2026-03-28', deliveryDate: '2026-03-29',
    lineHaul: 5400, fuelSurcharge: 540, accessorials: 260, totalAmount: 6200, amountPaid: 0, dueDate: '2026-04-12',
    status: 'OVERDUE', driverName: 'Lisa Nguyen', equipment: "Reefer - 53'", mileage: 980, createdAt: '2026-03-28', notes: 'Net 45 customer — past due 1 day. Follow up.',
  },
  {
    id: 'inv7', loadNumber: 'LD-4488', loadId: 'L007', invoiceNumber: 'INV-2026-1012', cwJobNumber: null, cwSyncStatus: 'SYNC_ERROR', cwLastSync: '2026-04-09T16:00:00Z', cwErrorMessage: 'CW API timeout — transport module unavailable. Retry scheduled.',
    customer: 'Echo Global Logistics', customerEmail: 'ap@echo.com', origin: 'Chicago, IL', destination: 'Milwaukee, WI', pickupDate: '2026-03-25', deliveryDate: '2026-03-25',
    lineHaul: 2400, fuelSurcharge: 240, accessorials: 160, totalAmount: 2800, amountPaid: 0, dueDate: '2026-04-15',
    status: 'DRAFT', driverName: 'David Kim', equipment: "Van - 53'", mileage: 350, createdAt: '2026-03-25', notes: 'CW sync failed — manual retry needed',
  },
  {
    id: 'inv8', loadNumber: 'LD-4524', loadId: 'L008', invoiceNumber: '', cwJobNumber: null, cwSyncStatus: 'NOT_SYNCED', cwLastSync: null, cwErrorMessage: null,
    customer: 'Acme Corp - DFW', customerEmail: 'ap@acmedfw.com', origin: 'Nashville, TN', destination: 'Louisville, KY', pickupDate: '2026-04-13', deliveryDate: '2026-04-13',
    lineHaul: 2500, fuelSurcharge: 250, accessorials: 150, totalAmount: 2900, amountPaid: 0, dueDate: '',
    status: 'DRAFT', driverName: 'Robert Brown', equipment: "Van - 53'", mileage: 380, createdAt: '2026-04-13', notes: 'Load in transit — will sync on delivery',
  },
  {
    id: 'inv9', loadNumber: 'LD-4502', loadId: 'L009', invoiceNumber: 'INV-2026-1025', cwJobNumber: 'CW-T240401-0033', cwSyncStatus: 'PAID', cwLastSync: '2026-04-08T14:00:00Z', cwErrorMessage: null,
    customer: 'XPO Logistics', customerEmail: 'carrier.ap@xpo.com', origin: 'Omaha, NE', destination: 'Kansas City, MO', pickupDate: '2026-04-01', deliveryDate: '2026-04-02',
    lineHaul: 2900, fuelSurcharge: 290, accessorials: 210, totalAmount: 3400, amountPaid: 3400, dueDate: '2026-04-22',
    status: 'PAID', driverName: 'Sarah Chen', equipment: "Reefer - 53'", mileage: 490, createdAt: '2026-04-01', notes: '',
  },
  {
    id: 'inv10', loadNumber: 'LD-4508', loadId: 'L010', invoiceNumber: 'INV-2026-1028', cwJobNumber: 'CW-T240403-0039', cwSyncStatus: 'PAID', cwLastSync: '2026-04-10T09:00:00Z', cwErrorMessage: null,
    customer: 'Acme Corp - LAX', customerEmail: 'ap@acmelax.com', origin: 'Atlanta, GA', destination: 'Charlotte, NC', pickupDate: '2026-04-03', deliveryDate: '2026-04-04',
    lineHaul: 3700, fuelSurcharge: 370, accessorials: 130, totalAmount: 4200, amountPaid: 4200, dueDate: '2026-05-03',
    status: 'PAID', driverName: 'Emily Taylor', equipment: "Van - 53'", mileage: 620, createdAt: '2026-04-03', notes: '',
  },
];

// ── Helpers ────────────────────────────────────────────────────────
const CW_SYNC_BADGES: Record<CWSyncStatus, { bg: string; label: string }> = {
  NOT_SYNCED: { bg: 'bg-gray-100 text-gray-600', label: 'Not synced' },
  PUSHED_TO_CW: { bg: 'bg-blue-100 text-blue-800', label: 'Pushed to CW' },
  JOB_CREATED: { bg: 'bg-purple-100 text-purple-800', label: 'CW job created' },
  INVOICE_MATCHED: { bg: 'bg-indigo-100 text-indigo-800', label: 'Invoice matched' },
  INVOICE_CLOSED: { bg: 'bg-teal-100 text-teal-800', label: 'Invoice closed' },
  SENT_TO_CLIENT: { bg: 'bg-green-100 text-green-800', label: 'Sent to client' },
  PAID: { bg: 'bg-green-100 text-green-800', label: 'Paid' },
  SYNC_ERROR: { bg: 'bg-red-100 text-red-800', label: 'Sync error' },
};

const INVOICE_STATUS_BADGES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-800',
  INVOICED: 'bg-blue-100 text-blue-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  VOID: 'bg-gray-100 text-gray-500 line-through',
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  INVOICED: 'Invoiced',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Void',
};

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d: string | null): string {
  if (!d) return '—';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

// ── Component ──────────────────────────────────────────────────────
export function CarrierAccountingPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [cwFilter, setCwFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [carrierAcctTab, setCarrierAcctTab] = useState<'invoices' | 'expenses' | 'cw_sync'>('invoices');
  const [sortField, setSortField] = useState<'loadNumber' | 'totalAmount' | 'dueDate' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter & sort
  const filteredInvoices = useMemo(() => {
    let result = MOCK_INVOICES.filter(inv => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      if (cwFilter === 'ERRORS' && inv.cwSyncStatus !== 'SYNC_ERROR') return false;
      if (cwFilter === 'NOT_SYNCED' && inv.cwSyncStatus !== 'NOT_SYNCED') return false;
      if (cwFilter === 'IN_PROGRESS' && !['PUSHED_TO_CW', 'JOB_CREATED', 'INVOICE_MATCHED'].includes(inv.cwSyncStatus)) return false;
      if (cwFilter === 'COMPLETE' && !['INVOICE_CLOSED', 'SENT_TO_CLIENT', 'PAID'].includes(inv.cwSyncStatus)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          inv.loadNumber.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.cwJobNumber?.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.driverName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'loadNumber': cmp = a.loadNumber.localeCompare(b.loadNumber); break;
        case 'totalAmount': cmp = a.totalAmount - b.totalAmount; break;
        case 'dueDate': cmp = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime(); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [statusFilter, cwFilter, searchQuery, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const sortIcon = (field: typeof sortField) => sortField !== field ? '↕' : sortDir === 'asc' ? '↑' : '↓';

  // Stats
  const stats = useMemo(() => {
    const ar = MOCK_INVOICES.filter(i => ['INVOICED', 'PARTIAL', 'OVERDUE', 'PENDING'].includes(i.status));
    const arTotal = ar.reduce((s, i) => s + (i.totalAmount - i.amountPaid), 0);
    const overdue = MOCK_INVOICES.filter(i => i.status === 'OVERDUE');
    const overdueTotal = overdue.reduce((s, i) => s + (i.totalAmount - i.amountPaid), 0);
    const paidTotal = MOCK_INVOICES.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amountPaid, 0);
    const syncErrors = MOCK_INVOICES.filter(i => i.cwSyncStatus === 'SYNC_ERROR').length;
    const notSynced = MOCK_INVOICES.filter(i => i.cwSyncStatus === 'NOT_SYNCED').length;
    const pendingCW = MOCK_INVOICES.filter(i => ['PUSHED_TO_CW', 'JOB_CREATED', 'INVOICE_MATCHED'].includes(i.cwSyncStatus)).length;
    const revenue = MOCK_INVOICES.reduce((s, i) => s + i.totalAmount, 0);

    return { arTotal, overdueCount: overdue.length, overdueTotal, paidTotal, syncErrors, notSynced, pendingCW, revenue, totalInvoices: MOCK_INVOICES.length };
  }, []);

  // CW action handlers (mock)
  const pushToCW = (inv: Invoice) => {
    alert(`[Mock] Pushing ${inv.loadNumber} to CargoWise transport module...\n\nIn production: POST /api/cargowise/push\nPayload: load data, stops, rates, customer`);
  };

  const closeAndSend = (inv: Invoice) => {
    alert(`[Mock] Closing invoice ${inv.cwJobNumber} in CargoWise and sending to ${inv.customerEmail}...\n\nIn production: POST /api/cargowise/close-and-send\nPayload: cwJobNumber, invoiceNumber`);
  };

  const retryCWSync = (inv: Invoice) => {
    alert(`[Mock] Retrying CW sync for ${inv.loadNumber}...\n\nIn production: POST /api/cargowise/retry\nPayload: loadId, last error context`);
  };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Accounting</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-medium text-purple-800">CargoWise Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search load, invoice, CW job, customer..."
              className="w-72 border border-gray-300 rounded-lg px-3 py-1.5 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button onClick={() => setCarrierAcctTab('invoices')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${carrierAcctTab === 'invoices' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Invoices (AR) <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${carrierAcctTab === 'invoices' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{MOCK_INVOICES.length}</span></button>
        <button onClick={() => setCarrierAcctTab('expenses')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${carrierAcctTab === 'expenses' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Expenses (AP)</button>
        <button onClick={() => setCarrierAcctTab('cw_sync')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${carrierAcctTab === 'cw_sync' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>CargoWise Sync <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${carrierAcctTab === 'cw_sync' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{stats.syncErrors + stats.notSynced}</span></button>
      </div>

      {carrierAcctTab === 'invoices' && (<>
      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Accounts Receivable</p>
          <p className="text-xl font-bold text-gray-900">${stats.arTotal.toLocaleString()}</p>
          <p className="text-xs mt-1.5">{stats.overdueCount > 0 ? <span className="text-red-600 font-medium">${stats.overdueTotal.toLocaleString()} overdue</span> : <span className="text-green-600">None overdue</span>}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Collected (30d)</p>
          <p className="text-xl font-bold text-green-700">${stats.paidTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1.5">{MOCK_INVOICES.filter(i => i.status === 'PAID').length} invoices paid</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.totalInvoices} total invoices</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">CW Sync Status</p>
          <div className="flex items-center gap-3 mt-1">
            {stats.syncErrors > 0 && <span className="text-sm font-bold text-red-600">{stats.syncErrors} err</span>}
            {stats.notSynced > 0 && <span className="text-sm font-bold text-gray-500">{stats.notSynced} pending</span>}
            {stats.pendingCW > 0 && <span className="text-sm font-bold text-blue-600">{stats.pendingCW} in CW</span>}
          </div>
          <p className="text-xs mt-1">{stats.syncErrors > 0 ? <span className="text-red-500">Action required</span> : <span className="text-green-600">All synced</span>}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Ready to Invoice</p>
          <p className="text-xl font-bold text-blue-600">{MOCK_INVOICES.filter(i => i.cwSyncStatus === 'INVOICE_MATCHED').length}</p>
          <p className="text-xs text-gray-400 mt-1.5">Matched in CW — close & send</p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex gap-1">
          {['All', 'DRAFT', 'PENDING', 'INVOICED', 'PARTIAL', 'OVERDUE', 'PAID'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {INVOICE_STATUS_LABELS[s] || 'All'}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex gap-1">
          {[
            { key: 'All', label: 'All CW' },
            { key: 'ERRORS', label: 'Errors' },
            { key: 'NOT_SYNCED', label: 'Not Synced' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'COMPLETE', label: 'Complete' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setCwFilter(f.key)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${cwFilter === f.key ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('loadNumber')}>
                  Load # {sortIcon('loadNumber')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Invoice #</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">CW Job #</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">CW Sync</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Customer</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Route</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('totalAmount')}>
                  Amount {sortIcon('totalAmount')}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Balance</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('dueDate')}>
                  Due {sortIcon('dueDate')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 && (
                <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400">No invoices found matching your filters.</td></tr>
              )}
              {filteredInvoices.map(inv => {
                const balance = inv.totalAmount - inv.amountPaid;
                const overdueDays = inv.dueDate ? -daysUntil(inv.dueDate) : 0;
                const rowHighlight = inv.cwSyncStatus === 'SYNC_ERROR'
                  ? 'bg-red-50 border-l-4 border-l-red-500'
                  : inv.status === 'OVERDUE'
                  ? 'bg-red-50 border-l-4 border-l-red-300'
                  : inv.status === 'PARTIAL'
                  ? 'bg-orange-50 border-l-4 border-l-orange-300'
                  : inv.cwSyncStatus === 'NOT_SYNCED'
                  ? 'bg-gray-50 border-l-4 border-l-gray-300'
                  : '';

                return (
                  <tr
                    key={inv.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-blue-600 font-semibold hover:underline">{inv.loadNumber}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-gray-600">{inv.invoiceNumber || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_BADGES[inv.status]}`}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {inv.cwJobNumber ? (
                        <span className="font-mono text-purple-700 text-xs">{inv.cwJobNumber}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CW_SYNC_BADGES[inv.cwSyncStatus].bg}`}>
                        {CW_SYNC_BADGES[inv.cwSyncStatus].label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{inv.customer}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{inv.origin} → {inv.destination}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">${inv.totalAmount.toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${balance > 0 ? (inv.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-800') : 'text-green-600'}`}>
                      {balance > 0 ? `$${balance.toLocaleString()}` : 'Paid'}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap ${inv.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                      {overdueDays > 0 && inv.status === 'OVERDUE' && <span className="ml-1 text-red-500">({overdueDays}d)</span>}
                    </td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      {inv.cwSyncStatus === 'NOT_SYNCED' && (
                        <button onClick={() => pushToCW(inv)} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Push to CW</button>
                      )}
                      {inv.cwSyncStatus === 'INVOICE_MATCHED' && (
                        <button onClick={() => closeAndSend(inv)} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100">Close & Send</button>
                      )}
                      {inv.cwSyncStatus === 'SYNC_ERROR' && (
                        <button onClick={() => retryCWSync(inv)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100">Retry Sync</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Showing:</strong> {filteredInvoices.length} of {MOCK_INVOICES.length}</span>
          <span><strong className="text-gray-800">Total:</strong> ${filteredInvoices.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}</span>
          <span><strong className="text-gray-800">Outstanding:</strong> ${filteredInvoices.reduce((s, i) => s + (i.totalAmount - i.amountPaid), 0).toLocaleString()}</span>
          <span><strong className="text-gray-800">CW Errors:</strong> <span className={stats.syncErrors > 0 ? 'text-red-600' : ''}>{filteredInvoices.filter(i => i.cwSyncStatus === 'SYNC_ERROR').length}</span></span>
        </div>
      </div>
      </>)}

      {/* ── Expenses (AP) Tab ──────────────────────────────── */}
      {carrierAcctTab === 'expenses' && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Expenses (MTD)</p><p className="text-xl font-bold text-red-600">$48,200</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Fuel</p><p className="text-xl font-bold text-gray-900">$22,400</p><p className="text-xs text-gray-400 mt-1">46% of total</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Repairs & Maint</p><p className="text-xl font-bold text-gray-900">$8,600</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Insurance</p><p className="text-xl font-bold text-gray-900">$12,400</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Expense Register</h3><button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ Add Expense</button></div>
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Category</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Description</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Vendor</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead><tbody>
              {[
                { date: 'Apr 14', cat: 'Fuel', desc: 'Diesel fill-up — Pilot Flying J, Memphis', vendor: 'Pilot Corp', unit: 'T-1042', amount: 485.20, status: 'PAID' },
                { date: 'Apr 13', cat: 'Fuel', desc: 'Diesel fill-up — Love\'s, Dallas', vendor: 'Love\'s Travel', unit: 'T-1038', amount: 512.80, status: 'PAID' },
                { date: 'Apr 12', cat: 'Repair', desc: 'DPF filter cleaning', vendor: 'TruckPro Memphis', unit: 'T-1042', amount: 1200.00, status: 'PAID' },
                { date: 'Apr 11', cat: 'Insurance', desc: 'Monthly auto liability premium', vendor: 'Progressive Comm.', unit: 'Fleet', amount: 4200.00, status: 'PAID' },
                { date: 'Apr 10', cat: 'Tolls', desc: 'I-PASS monthly charges', vendor: 'IL Tollway', unit: 'Fleet', amount: 342.50, status: 'PAID' },
                { date: 'Apr 10', cat: 'Repair', desc: 'Brake pads replacement', vendor: 'FleetPride', unit: 'T-1055', amount: 680.00, status: 'PENDING' },
                { date: 'Apr 9', cat: 'Loan', desc: 'Monthly truck payment — T-1038', vendor: 'Daimler Financial', unit: 'T-1038', amount: 2800.00, status: 'PAID' },
                { date: 'Apr 8', cat: 'Fuel', desc: 'DEF fluid purchase', vendor: 'TA Petro', unit: 'T-1070', amount: 125.00, status: 'PAID' },
                { date: 'Apr 7', cat: 'Tire', desc: '4 drive tires replaced', vendor: 'TA Truck Service', unit: 'T-1082', amount: 2400.00, status: 'PENDING' },
                { date: 'Apr 5', cat: 'License', desc: 'Annual registration renewal — T-1029', vendor: 'IL SOS', unit: 'T-1029', amount: 285.00, status: 'PAID' },
              ].map((e, i) => {
                const catColor: Record<string, string> = { Fuel: 'bg-blue-100 text-blue-800', Repair: 'bg-red-100 text-red-800', Insurance: 'bg-purple-100 text-purple-800', Tolls: 'bg-teal-100 text-teal-800', Loan: 'bg-gray-100 text-gray-700', Tire: 'bg-orange-100 text-orange-800', License: 'bg-indigo-100 text-indigo-800' };
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-gray-600">{e.date}</td>
                    <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${catColor[e.cat] || 'bg-gray-100 text-gray-700'}`}>{e.cat}</span></td>
                    <td className="px-3 py-2.5 text-gray-700">{e.desc}</td>
                    <td className="px-3 py-2.5 text-gray-600">{e.vendor}</td>
                    <td className="px-3 py-2.5 text-gray-600">{e.unit}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-red-600">${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{e.status === 'PAID' ? 'Paid' : 'Pending'}</span></td>
                  </tr>
                );
              })}
            </tbody></table>
          </div>
        </div>
      )}

      {/* ── CargoWise Sync Tab ──────────────────────────────── */}
      {carrierAcctTab === 'cw_sync' && (
        <div>
          {/* Sync Status Cards */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {(['NOT_SYNCED', 'PUSHED_TO_CW', 'JOB_CREATED', 'INVOICE_MATCHED', 'INVOICE_CLOSED', 'SENT_TO_CLIENT', 'PAID'] as CWSyncStatus[]).map(status => {
              const count = MOCK_INVOICES.filter(i => i.cwSyncStatus === status).length;
              return (
                <div key={status} className={`rounded-lg p-2.5 text-center border ${count > 0 ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{CW_SYNC_BADGES[status].label}</p>
                </div>
              );
            })}
          </div>

          {/* Connection & Auto-Sync Config */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">CargoWise Connection</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-semibold text-green-800">Connected — Live Sync Active</span></div>
                  <span className="text-xs text-green-600">Heartbeat: 2 min ago</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Environment</p><p className="text-sm font-bold text-gray-900">Production</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Company Code</p><p className="text-sm font-bold text-gray-900">GMEX-CARRIER</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">API Version</p><p className="text-sm font-bold text-gray-900">eHub v3.2</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Sync Mode</p><p className="text-sm font-bold text-blue-600">Bidirectional</p></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Today's Sync Activity</span><span className="text-gray-700 font-medium">92 transactions</span></div>
                  <div className="flex gap-3 text-xs"><span className="text-green-600">↑ 58 pushed</span><span className="text-blue-600">↓ 33 pulled</span><span className="text-red-600">✕ 1 error</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Automatic Sync Triggers</h4>
              <div className="space-y-1.5">
                {[
                  { event: 'Load Delivered', desc: 'Auto-push load data to CW Transport module on delivery confirmation', direction: '↑ Push', enabled: true, module: 'Loads' },
                  { event: 'Invoice Created', desc: 'Auto-create CW Forwarding Job and AR invoice when invoice is generated', direction: '↑ Push', enabled: true, module: 'AR' },
                  { event: 'Invoice Matched in CW', desc: 'Auto-detect when CW invoice matches and update TMS status', direction: '↓ Pull', enabled: true, module: 'AR' },
                  { event: 'Invoice Closed & Sent', desc: 'Auto-close CW job and send invoice to client via CW email', direction: '↑ Push', enabled: true, module: 'AR' },
                  { event: 'Payment Received', desc: 'Pull payment data from CW when customer pays via ACH/Check', direction: '↓ Pull', enabled: true, module: 'AR' },
                  { event: 'Status Changed', desc: 'Sync load status milestones (dispatched, in-transit, delivered)', direction: '↑ Push', enabled: true, module: 'Operations' },
                  { event: 'Driver Assigned', desc: 'Push driver and equipment info to CW transport job', direction: '↑ Push', enabled: true, module: 'Dispatch' },
                  { event: 'Document Uploaded', desc: 'Push BOL, POD, rate con to CW document management', direction: '↑ Push', enabled: false, module: 'Documents' },
                  { event: 'CW Job Updated', desc: 'Pull manual CW changes back to TMS (rates, dates, references)', direction: '↓ Pull', enabled: true, module: 'Sync' },
                ].map(t => (
                  <div key={t.event} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${t.direction.includes('Push') ? 'text-green-600' : 'text-blue-600'}`}>{t.direction}</span>
                        <span className="text-xs font-semibold text-gray-800">{t.event}</span>
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">{t.module}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{t.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                      <input type="checkbox" defaultChecked={t.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Schedule & Field Mapping */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Sync Schedule</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded"><span className="text-xs text-gray-600">Real-time Push</span><span className="text-xs font-bold text-green-600">Active</span></div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded"><span className="text-xs text-gray-600">Pull Interval</span><span className="text-xs font-bold text-gray-900">Every 5 min</span></div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded"><span className="text-xs text-gray-600">Full Reconciliation</span><span className="text-xs font-bold text-gray-900">Daily 2:00 AM</span></div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded"><span className="text-xs text-gray-600">Error Retry</span><span className="text-xs font-bold text-gray-900">3x with 5 min delay</span></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Field Mapping — Outbound</h4>
              <div className="space-y-1 text-xs">
                {[
                  { tms: 'Load Number', cw: 'Job Reference' },
                  { tms: 'Customer', cw: 'Debtor Organization' },
                  { tms: 'Line Haul', cw: 'Revenue Charge Line' },
                  { tms: 'Fuel Surcharge', cw: 'Surcharge Line' },
                  { tms: 'Accessorials', cw: 'Accessorial Charge Lines' },
                  { tms: 'Invoice #', cw: 'AR Invoice Number' },
                  { tms: 'Driver / Equipment', cw: 'Transport Leg Resource' },
                ].map(m => (
                  <div key={m.tms} className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
                    <span className="flex-1 text-gray-700 font-medium">{m.tms}</span>
                    <span className="text-gray-300">→</span>
                    <span className="flex-1 text-blue-600">{m.cw}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Field Mapping — Inbound</h4>
              <div className="space-y-1 text-xs">
                {[
                  { cw: 'CW Job Number', tms: 'CW Job #' },
                  { cw: 'Invoice Match Status', tms: 'CW Sync Status' },
                  { cw: 'Payment Receipt', tms: 'Amount Paid' },
                  { cw: 'Payment Date', tms: 'Payment Date' },
                  { cw: 'CW Invoice PDF', tms: 'Invoice Document' },
                  { cw: 'Client Send Date', tms: 'Sent to Client Date' },
                  { cw: 'Error Messages', tms: 'CW Error Message' },
                ].map(m => (
                  <div key={m.cw} className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
                    <span className="flex-1 text-blue-600">{m.cw}</span>
                    <span className="text-gray-300">→</span>
                    <span className="flex-1 text-gray-700 font-medium">{m.tms}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Log Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Sync Log — All Invoices</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Force Sync Now</button>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">View Full Log</button>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Invoice #</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customer</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Job #</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Sync Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Sync</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {MOCK_INVOICES.map(inv => (
                  <tr key={inv.id} className={`border-b border-gray-100 hover:bg-gray-50 ${inv.cwSyncStatus === 'SYNC_ERROR' ? 'bg-red-50' : inv.cwSyncStatus === 'NOT_SYNCED' ? 'bg-yellow-50' : ''}`}>
                    <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{inv.loadNumber}</td>
                    <td className="px-3 py-2.5 text-gray-700">{inv.invoiceNumber || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700">{inv.customer}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">${inv.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{inv.cwJobNumber || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CW_SYNC_BADGES[inv.cwSyncStatus].bg}`}>{CW_SYNC_BADGES[inv.cwSyncStatus].label}</span>
                      {inv.cwErrorMessage && <p className="text-xs text-red-500 mt-1 truncate max-w-[200px]">{inv.cwErrorMessage}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{formatDateTime(inv.cwLastSync)}</td>
                    <td className="px-3 py-2.5">
                      {inv.cwSyncStatus === 'NOT_SYNCED' && <span className="text-xs text-yellow-600 font-medium">⏳ Queued</span>}
                      {inv.cwSyncStatus === 'SYNC_ERROR' && <button className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Retry</button>}
                      {inv.cwSyncStatus === 'PUSHED_TO_CW' && <span className="text-xs text-blue-600">⟳ Processing</span>}
                      {inv.cwSyncStatus === 'JOB_CREATED' && <span className="text-xs text-purple-600">⟳ Awaiting match</span>}
                      {inv.cwSyncStatus === 'INVOICE_MATCHED' && <span className="text-xs text-indigo-600">✓ Matched</span>}
                      {['INVOICE_CLOSED', 'SENT_TO_CLIENT'].includes(inv.cwSyncStatus) && <span className="text-xs text-green-600">✓ Sent</span>}
                      {inv.cwSyncStatus === 'PAID' && <span className="text-xs text-green-600 font-medium">✓ Complete</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span>Synced: <strong className="text-green-600">{MOCK_INVOICES.filter(i => !['NOT_SYNCED', 'SYNC_ERROR'].includes(i.cwSyncStatus)).length}</strong></span>
              <span>Queued: <strong className="text-yellow-600">{stats.notSynced}</strong></span>
              <span>Errors: <strong className="text-red-600">{stats.syncErrors}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Detail Flyout ───────────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedInvoice(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[460px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{selectedInvoice.loadNumber}</h3>
                  {selectedInvoice.invoiceNumber && <p className="text-xs text-gray-400 font-mono">{selectedInvoice.invoiceNumber}</p>}
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_BADGES[selectedInvoice.status]}`}>
                  {INVOICE_STATUS_LABELS[selectedInvoice.status]}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CW_SYNC_BADGES[selectedInvoice.cwSyncStatus].bg}`}>
                  {CW_SYNC_BADGES[selectedInvoice.cwSyncStatus].label}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* CW Error banner */}
              {selectedInvoice.cwSyncStatus === 'SYNC_ERROR' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700">CargoWise sync error</p>
                  <p className="text-xs text-red-600 mt-0.5">{selectedInvoice.cwErrorMessage}</p>
                  <button
                    onClick={() => retryCWSync(selectedInvoice)}
                    className="mt-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                  >
                    Retry Sync
                  </button>
                </div>
              )}

              {/* CargoWise Integration */}
              <div>
                <h4 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  CargoWise Integration
                </h4>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-600">CW Job Number</span>
                    <span className="text-xs font-mono font-semibold text-purple-900">{selectedInvoice.cwJobNumber || 'Not created'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-600">Sync Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CW_SYNC_BADGES[selectedInvoice.cwSyncStatus].bg}`}>
                      {CW_SYNC_BADGES[selectedInvoice.cwSyncStatus].label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-600">Last Sync</span>
                    <span className="text-xs text-purple-800">{formatDateTime(selectedInvoice.cwLastSync)}</span>
                  </div>

                  {/* CW Lifecycle Progress */}
                  <div className="pt-2 mt-2 border-t border-purple-200">
                    <p className="text-xs text-purple-600 mb-2">Lifecycle</p>
                    <div className="flex items-center gap-1">
                      {(['NOT_SYNCED', 'PUSHED_TO_CW', 'JOB_CREATED', 'INVOICE_MATCHED', 'SENT_TO_CLIENT', 'PAID'] as CWSyncStatus[]).map((step, i) => {
                        const stepLabels: Record<string, string> = {
                          NOT_SYNCED: 'Push',
                          PUSHED_TO_CW: 'Pushed',
                          JOB_CREATED: 'Job',
                          INVOICE_MATCHED: 'Matched',
                          SENT_TO_CLIENT: 'Sent',
                          PAID: 'Paid',
                        };
                        const stepOrder = ['NOT_SYNCED', 'PUSHED_TO_CW', 'JOB_CREATED', 'INVOICE_MATCHED', 'INVOICE_CLOSED', 'SENT_TO_CLIENT', 'PAID'];
                        const currentIdx = stepOrder.indexOf(selectedInvoice.cwSyncStatus);
                        const thisIdx = stepOrder.indexOf(step);
                        const isComplete = thisIdx <= currentIdx && selectedInvoice.cwSyncStatus !== 'SYNC_ERROR';
                        const isCurrent = step === selectedInvoice.cwSyncStatus;
                        const isError = selectedInvoice.cwSyncStatus === 'SYNC_ERROR';

                        return (
                          <div key={step} className="flex-1 flex flex-col items-center">
                            <div className={`w-full h-1.5 rounded-full ${isError ? 'bg-red-200' : isComplete ? 'bg-purple-500' : 'bg-purple-100'}`} />
                            <span className={`text-xs mt-1 ${isCurrent ? 'text-purple-800 font-medium' : isComplete ? 'text-purple-600' : 'text-purple-300'}`} style={{ fontSize: '10px' }}>
                              {stepLabels[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Load & Customer Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-xs text-gray-400 block">Customer</span>
                  <span className="text-xs font-medium text-gray-900">{selectedInvoice.customer}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Billing Email</span>
                  <span className="text-xs text-blue-600">{selectedInvoice.customerEmail}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Driver</span>
                  <span className="text-xs text-gray-800">{selectedInvoice.driverName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Equipment</span>
                  <span className="text-xs text-gray-800">{selectedInvoice.equipment}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Route</span>
                  <span className="text-xs text-gray-800">{selectedInvoice.origin} → {selectedInvoice.destination}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Miles</span>
                  <span className="text-xs text-gray-800">{selectedInvoice.mileage}</span>
                </div>
              </div>

              {/* Rate Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Rate Breakdown</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Line Haul</span><span className="text-xs text-gray-800">${selectedInvoice.lineHaul.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Fuel Surcharge</span><span className="text-xs text-gray-800">${selectedInvoice.fuelSurcharge.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Accessorials</span><span className="text-xs text-gray-800">${selectedInvoice.accessorials.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-700">Total</span>
                    <span className="text-sm font-bold text-gray-900">${selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between"><span className="text-xs text-gray-500">Paid</span><span className="text-xs text-green-600">-${selectedInvoice.amountPaid.toLocaleString()}</span></div>
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-gray-700">Balance Due</span>
                        <span className={`text-sm font-bold ${(selectedInvoice.totalAmount - selectedInvoice.amountPaid) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-400 block">Created</span>
                  <span className="text-xs text-gray-800">{formatDate(selectedInvoice.createdAt)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Due Date</span>
                  <span className={`text-xs ${selectedInvoice.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-800'}`}>
                    {formatDate(selectedInvoice.dueDate)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 space-y-2">
              <div className="flex gap-2">
                {selectedInvoice.cwSyncStatus === 'NOT_SYNCED' && (
                  <button onClick={() => pushToCW(selectedInvoice)} className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                    Push to CargoWise
                  </button>
                )}
                {selectedInvoice.cwSyncStatus === 'INVOICE_MATCHED' && (
                  <button onClick={() => closeAndSend(selectedInvoice)} className="flex-1 px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                    Close Invoice & Send to Client
                  </button>
                )}
                {selectedInvoice.cwSyncStatus === 'SYNC_ERROR' && (
                  <button onClick={() => retryCWSync(selectedInvoice)} className="flex-1 px-4 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">
                    Retry CargoWise Sync
                  </button>
                )}
                <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  View in CargoWise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
