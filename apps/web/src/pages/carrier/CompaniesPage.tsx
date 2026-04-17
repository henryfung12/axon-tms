import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

interface Company {
  id: string;
  name: string;
  type: 'SHIPPER' | 'CONSIGNEE' | 'VENDOR' | 'FACTORING' | 'BROKER' | 'REPAIR_SHOP';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_HOLD' | 'PENDING';
  dotNumber: string;
  mcNumber: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  contacts: Contact[];
  paymentTerms: string;
  creditLimit: number;
  creditUsed: number;
  totalLoads: number;
  totalRevenue: number;
  avgDaysToPay: number;
  lastLoadDate: string;
  createdAt: string;
  notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1', name: 'Acme Corp - LAX', type: 'SHIPPER', status: 'ACTIVE',
    dotNumber: '3214567', mcNumber: 'MC-891234', taxId: '82-1234567',
    address: '1200 Commerce Dr', city: 'Los Angeles', state: 'CA', zip: '90012',
    phone: '(310) 555-1200', email: 'shipping@acmelax.com', website: 'acmelax.com',
    contacts: [
      { name: 'Jennifer Walsh', title: 'Logistics Manager', email: 'j.walsh@acmelax.com', phone: '(310) 555-1201', isPrimary: true },
      { name: 'Tom Rivera', title: 'Shipping Coordinator', email: 't.rivera@acmelax.com', phone: '(310) 555-1202', isPrimary: false },
    ],
    paymentTerms: 'Net 30', creditLimit: 500000, creditUsed: 187500, totalLoads: 142, totalRevenue: 1533265, avgDaysToPay: 27, lastLoadDate: '2026-04-11', createdAt: '2024-06-15', notes: 'Preferred partner  high volume west coast',
  },
  {
    id: 'c2', name: 'Acme Corp - ORD', type: 'SHIPPER', status: 'ACTIVE',
    dotNumber: '3214567', mcNumber: 'MC-891234', taxId: '82-1234568',
    address: '8800 Industrial Pkwy', city: 'Chicago', state: 'IL', zip: '60632',
    phone: '(312) 555-8800', email: 'logistics@acmeord.com', website: 'acmeord.com',
    contacts: [
      { name: 'Mark Patterson', title: 'Supply Chain Director', email: 'm.patterson@acmeord.com', phone: '(312) 555-8801', isPrimary: true },
    ],
    paymentTerms: 'Net 30', creditLimit: 400000, creditUsed: 134200, totalLoads: 98, totalRevenue: 1090560, avgDaysToPay: 24, lastLoadDate: '2026-04-10', createdAt: '2024-08-22', notes: '',
  },
  {
    id: 'c3', name: 'Acme Corp - EWR', type: 'SHIPPER', status: 'ACTIVE',
    dotNumber: '3214567', mcNumber: 'MC-891234', taxId: '82-1234569',
    address: '450 Port Authority Blvd', city: 'Newark', state: 'NJ', zip: '07114',
    phone: '(973) 555-4500', email: 'dispatch@acmeewr.com', website: 'acmeewr.com',
    contacts: [
      { name: 'Diana Chen', title: 'Freight Operations Manager', email: 'd.chen@acmeewr.com', phone: '(973) 555-4501', isPrimary: true },
      { name: 'Paul Kowalski', title: 'AP Coordinator', email: 'p.kowalski@acmeewr.com', phone: '(973) 555-4502', isPrimary: false },
    ],
    paymentTerms: 'Net 45', creditLimit: 350000, creditUsed: 210000, totalLoads: 76, totalRevenue: 957335, avgDaysToPay: 38, lastLoadDate: '2026-04-09', createdAt: '2024-11-03', notes: 'Slow payer  monitor AR closely',
  },
  {
    id: 'c4', name: 'Acme Corp - DFW', type: 'SHIPPER', status: 'ACTIVE',
    dotNumber: '3214567', mcNumber: 'MC-891234', taxId: '82-1234570',
    address: '2100 Freight Terminal Rd', city: 'Fort Worth', state: 'TX', zip: '76106',
    phone: '(817) 555-2100', email: 'ops@acmedfw.com', website: 'acmedfw.com',
    contacts: [
      { name: 'Carlos Mendez', title: 'Operations Manager', email: 'c.mendez@acmedfw.com', phone: '(817) 555-2101', isPrimary: true },
    ],
    paymentTerms: 'Net 30', creditLimit: 250000, creditUsed: 78000, totalLoads: 34, totalRevenue: 317005, avgDaysToPay: 22, lastLoadDate: '2026-04-12', createdAt: '2025-02-18', notes: '',
  },
  {
    id: 'c5', name: 'Acme Corp - ATL', type: 'SHIPPER', status: 'ACTIVE',
    dotNumber: '3214567', mcNumber: 'MC-891234', taxId: '82-1234571',
    address: '6700 Logistics Center Dr', city: 'Atlanta', state: 'GA', zip: '30336',
    phone: '(404) 555-6700', email: 'shipping@acmeatl.com', website: 'acmeatl.com',
    contacts: [
      { name: 'Angela Brooks', title: 'Logistics Coordinator', email: 'a.brooks@acmeatl.com', phone: '(404) 555-6701', isPrimary: true },
    ],
    paymentTerms: 'Net 30', creditLimit: 200000, creditUsed: 41000, totalLoads: 22, totalRevenue: 181703, avgDaysToPay: 19, lastLoadDate: '2026-04-08', createdAt: '2025-05-10', notes: 'Growing account  review credit limit Q3',
  },
  {
    id: 'c6', name: 'Triumph Business Capital', type: 'FACTORING', status: 'ACTIVE',
    dotNumber: '', mcNumber: '', taxId: '75-3012889',
    address: '12404 Park Central Dr', city: 'Dallas', state: 'TX', zip: '75251',
    phone: '(866) 555-4200', email: 'funding@triumph.com', website: 'triumphpay.com',
    contacts: [
      { name: 'Rachel Torres', title: 'Account Manager', email: 'r.torres@triumph.com', phone: '(866) 555-4201', isPrimary: true },
    ],
    paymentTerms: 'Same Day (2.5% fee)', creditLimit: 0, creditUsed: 0, totalLoads: 0, totalRevenue: 0, avgDaysToPay: 1, lastLoadDate: '', createdAt: '2024-06-15', notes: 'Primary factoring partner  2.5% flat rate',
  },
  {
    id: 'c7', name: 'Rush Truck Centers', type: 'REPAIR_SHOP', status: 'ACTIVE',
    dotNumber: '', mcNumber: '', taxId: '74-2018330',
    address: '555 IH-35 South', city: 'San Antonio', state: 'TX', zip: '78204',
    phone: '(210) 555-3800', email: 'service@rushtrucks.com', website: 'rushtruckcenters.com',
    contacts: [
      { name: 'Mike Dawson', title: 'Service Advisor', email: 'm.dawson@rushtrucks.com', phone: '(210) 555-3801', isPrimary: true },
    ],
    paymentTerms: 'Net 15', creditLimit: 75000, creditUsed: 12400, totalLoads: 0, totalRevenue: 0, avgDaysToPay: 12, lastLoadDate: '', createdAt: '2025-01-08', notes: 'Freightliner & Peterbilt certified',
  },
  {
    id: 'c8', name: 'TA Petro - Nashville', type: 'REPAIR_SHOP', status: 'ACTIVE',
    dotNumber: '', mcNumber: '', taxId: '62-1887443',
    address: '1400 Briley Pkwy', city: 'Nashville', state: 'TN', zip: '37217',
    phone: '(615) 555-1400', email: 'shop@tapetro-nash.com', website: 'ta-petro.com',
    contacts: [
      { name: 'Steve Ellis', title: 'Shop Manager', email: 's.ellis@tapetro.com', phone: '(615) 555-1401', isPrimary: true },
    ],
    paymentTerms: 'Net 15', creditLimit: 50000, creditUsed: 3200, totalLoads: 0, totalRevenue: 0, avgDaysToPay: 10, lastLoadDate: '', createdAt: '2025-03-22', notes: 'Emergency roadside available 24/7',
  },
  {
    id: 'c9', name: 'XPO Logistics', type: 'BROKER', status: 'ACTIVE',
    dotNumber: '2183144', mcNumber: 'MC-766857', taxId: '61-1478523',
    address: '5 American Ln', city: 'Greenwich', state: 'CT', zip: '06831',
    phone: '(855) 555-9700', email: 'carrier.ops@xpo.com', website: 'xpo.com',
    contacts: [
      { name: 'Brian Yates', title: 'Carrier Manager', email: 'b.yates@xpo.com', phone: '(855) 555-9701', isPrimary: true },
      { name: 'Sarah Kim', title: 'Lane Analyst', email: 's.kim@xpo.com', phone: '(855) 555-9702', isPrimary: false },
    ],
    paymentTerms: 'Net 30', creditLimit: 300000, creditUsed: 67000, totalLoads: 41, totalRevenue: 289400, avgDaysToPay: 26, lastLoadDate: '2026-04-11', createdAt: '2024-09-14', notes: '',
  },
  {
    id: 'c10', name: 'Echo Global Logistics', type: 'BROKER', status: 'ACTIVE',
    dotNumber: '2125791', mcNumber: 'MC-741043', taxId: '20-8051714',
    address: '600 W Chicago Ave', city: 'Chicago', state: 'IL', zip: '60654',
    phone: '(800) 555-3826', email: 'capacity@echo.com', website: 'echo.com',
    contacts: [
      { name: 'Lisa Tran', title: 'Capacity Coordinator', email: 'l.tran@echo.com', phone: '(800) 555-3827', isPrimary: true },
    ],
    paymentTerms: 'Net 21', creditLimit: 200000, creditUsed: 38000, totalLoads: 28, totalRevenue: 196700, avgDaysToPay: 18, lastLoadDate: '2026-04-10', createdAt: '2025-01-20', notes: 'Quick pay option available at 1.5%',
  },
  {
    id: 'c11', name: 'National Freight Industries', type: 'SHIPPER', status: 'ON_HOLD',
    dotNumber: '1987654', mcNumber: 'MC-654321', taxId: '36-4455667',
    address: '900 Distribution Way', city: 'Memphis', state: 'TN', zip: '38118',
    phone: '(901) 555-9000', email: 'transport@nationalfreight.com', website: 'nationalfreight.com',
    contacts: [
      { name: 'Robert Hall', title: 'Transportation Manager', email: 'r.hall@nationalfreight.com', phone: '(901) 555-9001', isPrimary: true },
    ],
    paymentTerms: 'Net 45', creditLimit: 150000, creditUsed: 148500, totalLoads: 15, totalRevenue: 148500, avgDaysToPay: 52, lastLoadDate: '2026-03-15', createdAt: '2025-04-01', notes: 'CREDIT HOLD  AR over 60 days. Do not dispatch until resolved.',
  },
  {
    id: 'c12', name: 'QuickShip Warehousing', type: 'CONSIGNEE', status: 'INACTIVE',
    dotNumber: '', mcNumber: '', taxId: '45-7788990',
    address: '3200 Warehouse Blvd', city: 'Louisville', state: 'KY', zip: '40299',
    phone: '(502) 555-3200', email: 'receiving@quickship.com', website: 'quickshipwh.com',
    contacts: [
      { name: 'Amy Foster', title: 'Receiving Manager', email: 'a.foster@quickship.com', phone: '(502) 555-3201', isPrimary: true },
    ],
    paymentTerms: 'N/A', creditLimit: 0, creditUsed: 0, totalLoads: 8, totalRevenue: 0, avgDaysToPay: 0, lastLoadDate: '2025-11-20', createdAt: '2025-06-12', notes: 'Facility closed  relocated to Cincinnati',
  },
];

// ── Helpers ────────────────────────────────────────────────────────
const TYPE_BADGES: Record<string, string> = {
  SHIPPER: 'bg-blue-100 text-blue-800',
  CONSIGNEE: 'bg-teal-100 text-teal-800',
  VENDOR: 'bg-gray-100 text-gray-700',
  FACTORING: 'bg-purple-100 text-purple-800',
  BROKER: 'bg-indigo-100 text-indigo-800',
  REPAIR_SHOP: 'bg-orange-100 text-orange-800',
};

const TYPE_LABELS: Record<string, string> = {
  SHIPPER: 'Shipper',
  CONSIGNEE: 'Consignee',
  VENDOR: 'Vendor',
  FACTORING: 'Factoring',
  BROKER: 'Broker',
  REPAIR_SHOP: 'Repair Shop',
};

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_HOLD: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_HOLD: 'On Hold',
  PENDING: 'Pending',
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatDate(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────
export function CompaniesPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'totalRevenue' | 'totalLoads' | 'avgDaysToPay' | 'lastLoadDate'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter & sort
  const filteredCompanies = useMemo(() => {
    let result = MOCK_COMPANIES.filter(c => {
      if (typeFilter !== 'All' && c.type !== typeFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.mcNumber.toLowerCase().includes(q) ||
          c.dotNumber.includes(q) ||
          c.contacts.some(ct => ct.name.toLowerCase().includes(q))
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'totalRevenue': cmp = a.totalRevenue - b.totalRevenue; break;
        case 'totalLoads': cmp = a.totalLoads - b.totalLoads; break;
        case 'avgDaysToPay': cmp = a.avgDaysToPay - b.avgDaysToPay; break;
        case 'lastLoadDate': cmp = new Date(a.lastLoadDate || 0).getTime() - new Date(b.lastLoadDate || 0).getTime(); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [typeFilter, statusFilter, searchQuery, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const sortIcon = (field: typeof sortField) => sortField !== field ? '↕' : sortDir === 'asc' ? '↑' : '↓';

  // Stats
  const stats = useMemo(() => {
    const active = MOCK_COMPANIES.filter(c => c.status === 'ACTIVE');
    const shippers = MOCK_COMPANIES.filter(c => c.type === 'SHIPPER');
    const onHold = MOCK_COMPANIES.filter(c => c.status === 'ON_HOLD');
    const totalRev = shippers.reduce((s, c) => s + c.totalRevenue, 0);
    const totalLoads = MOCK_COMPANIES.reduce((s, c) => s + c.totalLoads, 0);
    const avgDays = shippers.length > 0
      ? Math.round(shippers.reduce((s, c) => s + c.avgDaysToPay, 0) / shippers.length)
      : 0;
    const overCreditLimit = MOCK_COMPANIES.filter(c => c.creditLimit > 0 && c.creditUsed >= c.creditLimit * 0.9);

    return { total: MOCK_COMPANIES.length, active: active.length, shippers: shippers.length, onHold: onHold.length, totalRev, totalLoads, avgDays, overCreditLimit: overCreditLimit.length };
  }, []);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, city, MC#, contact..."
              className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Company
          </button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Companies</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            <span className="text-green-600">{stats.active} active</span>
            <span className="text-gray-300">·</span>
            <span className="text-blue-600">{stats.shippers} shippers</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(stats.totalRev)}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.totalLoads} total loads</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Avg Days to Pay</p>
          <p className={`text-xl font-bold ${stats.avgDays > 35 ? 'text-red-600' : stats.avgDays > 28 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.avgDays}</p>
          <p className="text-xs text-gray-400 mt-1.5">across shippers</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">On Hold</p>
          <p className={`text-xl font-bold ${stats.onHold > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.onHold}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.overCreditLimit > 0 ? <span className="text-orange-500">{stats.overCreditLimit} near credit limit</span> : 'No credit issues'}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Company Types</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = MOCK_COMPANIES.filter(c => c.type === key).length;
              if (!count) return null;
              return (
                <span key={key} className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_BADGES[key]}`}>
                  {count} {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex gap-1">
          {['All', 'SHIPPER', 'BROKER', 'FACTORING', 'REPAIR_SHOP', 'CONSIGNEE'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                typeFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TYPE_LABELS[t] || 'All Types'}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex gap-1">
          {['All', 'ACTIVE', 'ON_HOLD', 'INACTIVE'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[s] || 'All Status'}
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
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('name')}>
                  Company {sortIcon('name')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Type</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Location</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Primary Contact</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Terms</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('totalLoads')}>
                  Loads {sortIcon('totalLoads')}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('totalRevenue')}>
                  Revenue {sortIcon('totalRevenue')}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('avgDaysToPay')}>
                  Avg Pay {sortIcon('avgDaysToPay')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('lastLoadDate')}>
                  Last Load {sortIcon('lastLoadDate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                    No companies found matching your filters.
                  </td>
                </tr>
              )}
              {filteredCompanies.map(company => {
                const primary = company.contacts.find(c => c.isPrimary) || company.contacts[0];
                const creditPct = company.creditLimit > 0 ? (company.creditUsed / company.creditLimit) * 100 : 0;
                const rowHighlight = company.status === 'ON_HOLD'
                  ? 'bg-red-50 border-l-4 border-l-red-400'
                  : company.status === 'INACTIVE'
                  ? 'bg-gray-50 opacity-60'
                  : creditPct >= 90
                  ? 'bg-orange-50 border-l-4 border-l-orange-300'
                  : '';

                return (
                  <tr
                    key={company.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-blue-600 font-semibold hover:underline">{company.name}</span>
                      {company.mcNumber && <p className="text-xs text-gray-400 mt-0.5">{company.mcNumber}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGES[company.type]}`}>
                        {TYPE_LABELS[company.type]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[company.status]}`}>
                        {STATUS_LABELS[company.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{company.city}, {company.state}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {primary ? (
                        <div>
                          <span className="text-gray-700">{primary.name}</span>
                          <p className="text-gray-400">{primary.title}</p>
                        </div>
                      ) : <span className="text-gray-400 italic">No contact</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{company.paymentTerms}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{company.totalLoads || ''}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                      {company.totalRevenue ? `$${company.totalRevenue.toLocaleString()}` : ''}
                    </td>
                    <td className={`px-3 py-2.5 text-right ${company.avgDaysToPay > 35 ? 'text-red-600 font-medium' : company.avgDaysToPay > 28 ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {company.avgDaysToPay ? `${company.avgDaysToPay}d` : ''}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(company.lastLoadDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Showing:</strong> {filteredCompanies.length} of {MOCK_COMPANIES.length}</span>
          <span><strong className="text-gray-800">Total Revenue:</strong> ${filteredCompanies.reduce((s, c) => s + c.totalRevenue, 0).toLocaleString()}</span>
          <span><strong className="text-gray-800">Total Loads:</strong> {filteredCompanies.reduce((s, c) => s + c.totalLoads, 0)}</span>
        </div>
      </div>

      {/* ── Company Detail Flyout ───────────────────────────── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCompany(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{selectedCompany.name}</h3>
                <button onClick={() => setSelectedCompany(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGES[selectedCompany.type]}`}>
                  {TYPE_LABELS[selectedCompany.type]}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[selectedCompany.status]}`}>
                  {STATUS_LABELS[selectedCompany.status]}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* On Hold Warning */}
              {selectedCompany.status === 'ON_HOLD' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700">⚠ Account On Hold</p>
                  <p className="text-xs text-red-600 mt-0.5">{selectedCompany.notes || 'Contact AP for details'}</p>
                </div>
              )}

              {/* Company Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Company Information</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block">Address</span>
                    <span className="text-xs text-gray-800">{selectedCompany.address}</span>
                    <span className="text-xs text-gray-600 block">{selectedCompany.city}, {selectedCompany.state} {selectedCompany.zip}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Phone</span>
                    <span className="text-xs text-gray-800">{selectedCompany.phone}</span>
                  </div>
                  {selectedCompany.dotNumber && (
                    <div>
                      <span className="text-xs text-gray-400 block">DOT #</span>
                      <span className="text-xs font-mono text-gray-800">{selectedCompany.dotNumber}</span>
                    </div>
                  )}
                  {selectedCompany.mcNumber && (
                    <div>
                      <span className="text-xs text-gray-400 block">MC #</span>
                      <span className="text-xs font-mono text-gray-800">{selectedCompany.mcNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-400 block">Tax ID</span>
                    <span className="text-xs font-mono text-gray-800">{selectedCompany.taxId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Email</span>
                    <span className="text-xs text-blue-600">{selectedCompany.email}</span>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Contacts ({selectedCompany.contacts.length})</h4>
                <div className="space-y-2">
                  {selectedCompany.contacts.map((contact, i) => (
                    <div key={i} className={`rounded-lg p-3 ${contact.isPrimary ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-900">{contact.name}</span>
                          {contact.isPrimary && <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Primary</span>}
                        </div>
                      </div>
                      <div className="ml-8 space-y-0.5">
                        <p className="text-xs text-gray-500">{contact.title}</p>
                        <p className="text-xs text-blue-600">{contact.email}</p>
                        <p className="text-xs text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Financial</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Payment Terms</span>
                    <span className="text-xs font-medium text-gray-800">{selectedCompany.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Avg Days to Pay</span>
                    <span className={`text-xs font-medium ${selectedCompany.avgDaysToPay > 35 ? 'text-red-600' : 'text-gray-800'}`}>
                      {selectedCompany.avgDaysToPay || ''} days
                    </span>
                  </div>
                  {selectedCompany.creditLimit > 0 && (
                    <>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Credit Limit</span>
                        <span className="text-xs font-medium text-gray-800">${selectedCompany.creditLimit.toLocaleString()}</span>
                      </div>
                      <div className="py-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Credit Used</span>
                          <span className="text-xs font-medium text-gray-800">
                            ${selectedCompany.creditUsed.toLocaleString()}
                            <span className="text-gray-400 ml-1">({Math.round((selectedCompany.creditUsed / selectedCompany.creditLimit) * 100)}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (selectedCompany.creditUsed / selectedCompany.creditLimit) >= 0.9
                                ? 'bg-red-500'
                                : (selectedCompany.creditUsed / selectedCompany.creditLimit) >= 0.7
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedCompany.creditUsed / selectedCompany.creditLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Load History Summary */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Load History</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedCompany.totalLoads}</p>
                    <p className="text-xs text-gray-400">Total Loads</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-green-700">{formatCurrency(selectedCompany.totalRevenue)}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-gray-800">{formatDate(selectedCompany.lastLoadDate)}</p>
                    <p className="text-xs text-gray-400">Last Load</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCompany.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                  <p className={`text-xs bg-gray-50 rounded-lg p-3 ${selectedCompany.status === 'ON_HOLD' ? 'text-red-700 bg-red-50' : 'text-gray-600'}`}>
                    {selectedCompany.notes}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                <p>Added: {formatDate(selectedCompany.createdAt)}</p>
                {selectedCompany.website && <p>Website: <span className="text-blue-500">{selectedCompany.website}</span></p>}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Edit Company</button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">View Loads</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Company Modal ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Add New Company</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" placeholder="Company name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select type</option>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">DOT #</label>
                  <input type="text" placeholder="DOT number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">MC #</label>
                  <input type="text" placeholder="MC-000000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax ID</label>
                  <input type="text" placeholder="XX-XXXXXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <input type="text" placeholder="Street address" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="text" placeholder="ST" maxLength={2} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="text" placeholder="ZIP" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" placeholder="(555) 000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="contact@company.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Net 15</option>
                    <option>Net 21</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                    <option>COD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit</label>
                  <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                  <input type="text" placeholder="company.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} placeholder="Internal notes..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Add Company</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
