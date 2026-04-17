import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AddDriverModal } from '@/components/drivers/AddDriverModal';

// ─ Types ─
interface ELDDriverData {
  driverId: string;
  provider: 'motive' | 'samsara';
  unitNumber: string;
  currentCity: string;
  currentState: string;
  currentStatus: 'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY';
  hoursAvailable: number;
  drivingUsed: number;
  onDutyUsed: number;
  cycleUsed: number;
  cycleAvailable: number;
  lastStatusChange: string;
  violationsThisWeek: number;
  violationsThisMonth: number;
  safetyScore: number; // 0-100
  cameraEventsUnreviewed: number;
  cameraEventsTotal: number;
  hardBrakeCount: number;
  harshAccelCount: number;
  speedingCount: number;
  distractedCount: number;
  milesThisWeek: number;
  milesThisMonth: number;
}

// ─ ELD Mock Data (overlaid on API drivers) ─
const ELD_DRIVER_DATA: Record<string, ELDDriverData> = {
  'd1': { driverId: 'd1', provider: 'motive', unitNumber: 'T-1042', currentCity: 'Memphis', currentState: 'TN', currentStatus: 'DRIVING', hoursAvailable: 6.5, drivingUsed: 4.5, onDutyUsed: 6.0, cycleUsed: 48.5, cycleAvailable: 21.5, lastStatusChange: '2026-04-13T06:00:00Z', violationsThisWeek: 0, violationsThisMonth: 1, safetyScore: 88, cameraEventsUnreviewed: 1, cameraEventsTotal: 4, hardBrakeCount: 2, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, milesThisWeek: 1840, milesThisMonth: 6420 },
  'd2': { driverId: 'd2', provider: 'samsara', unitNumber: 'T-1038', currentCity: 'Dallas', currentState: 'TX', currentStatus: 'ON_DUTY', hoursAvailable: 11.0, drivingUsed: 0, onDutyUsed: 1.0, cycleUsed: 32.0, cycleAvailable: 38.0, lastStatusChange: '2026-04-13T11:30:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 95, cameraEventsUnreviewed: 0, cameraEventsTotal: 2, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, milesThisWeek: 2100, milesThisMonth: 7800 },
  'd3': { driverId: 'd3', provider: 'motive', unitNumber: 'T-1055', currentCity: 'Indianapolis', currentState: 'IN', currentStatus: 'DRIVING', hoursAvailable: 3.2, drivingUsed: 7.8, onDutyUsed: 9.0, cycleUsed: 56.0, cycleAvailable: 14.0, lastStatusChange: '2026-04-13T04:30:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 78, cameraEventsUnreviewed: 1, cameraEventsTotal: 6, hardBrakeCount: 1, harshAccelCount: 2, speedingCount: 2, distractedCount: 1, milesThisWeek: 2400, milesThisMonth: 8900 },
  'd4': { driverId: 'd4', provider: 'samsara', unitNumber: 'T-1061', currentCity: 'Atlanta', currentState: 'GA', currentStatus: 'OFF_DUTY', hoursAvailable: 10.5, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 28.0, cycleAvailable: 42.0, lastStatusChange: '2026-04-12T20:00:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 97, cameraEventsUnreviewed: 0, cameraEventsTotal: 1, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, milesThisWeek: 1200, milesThisMonth: 4800 },
  'd5': { driverId: 'd5', provider: 'motive', unitNumber: 'T-1029', currentCity: 'Chicago', currentState: 'IL', currentStatus: 'OFF_DUTY', hoursAvailable: 11.0, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 22.0, cycleAvailable: 48.0, lastStatusChange: '2026-04-12T18:00:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 82, cameraEventsUnreviewed: 0, cameraEventsTotal: 3, hardBrakeCount: 1, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, milesThisWeek: 1600, milesThisMonth: 5900 },
  'd6': { driverId: 'd6', provider: 'samsara', unitNumber: 'T-1044', currentCity: 'Phoenix', currentState: 'AZ', currentStatus: 'SLEEPER', hoursAvailable: 0, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 44.0, cycleAvailable: 26.0, lastStatusChange: '2026-04-13T02:00:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 91, cameraEventsUnreviewed: 0, cameraEventsTotal: 1, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, milesThisWeek: 1950, milesThisMonth: 7200 },
  'd7': { driverId: 'd7', provider: 'motive', unitNumber: 'T-1070', currentCity: 'Nashville', currentState: 'TN', currentStatus: 'DRIVING', hoursAvailable: 8.0, drivingUsed: 3.0, onDutyUsed: 4.0, cycleUsed: 38.0, cycleAvailable: 32.0, lastStatusChange: '2026-04-13T08:30:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 93, cameraEventsUnreviewed: 0, cameraEventsTotal: 2, hardBrakeCount: 1, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, milesThisWeek: 1700, milesThisMonth: 6100 },
  'd8': { driverId: 'd8', provider: 'samsara', unitNumber: 'T-1033', currentCity: 'Denver', currentState: 'CO', currentStatus: 'OFF_DUTY', hoursAvailable: 9.5, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 35.0, cycleAvailable: 35.0, lastStatusChange: '2026-04-12T22:00:00Z', violationsThisWeek: 0, violationsThisMonth: 0, safetyScore: 90, cameraEventsUnreviewed: 0, cameraEventsTotal: 0, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, milesThisWeek: 1500, milesThisMonth: 6300 },
};

// ─ Helpers ─
const STATUS_STYLES: Record<string, string> = {
  DRIVING: 'bg-green-100 text-green-800', ON_DUTY: 'bg-blue-100 text-blue-800',
  SLEEPER: 'bg-purple-100 text-purple-800', OFF_DUTY: 'bg-gray-100 text-gray-600',
  AVAILABLE: 'bg-green-100 text-green-800', ON_BREAK: 'bg-yellow-100 text-yellow-800',
  SLEEPER_BERTH: 'bg-purple-100 text-purple-800', HOS_LIMIT: 'bg-red-100 text-red-800', INACTIVE: 'bg-gray-100 text-gray-400',
};
const STATUS_LABELS: Record<string, string> = {
  DRIVING: 'Driving', ON_DUTY: 'On Duty', SLEEPER: 'Sleeper', OFF_DUTY: 'Off Duty',
  AVAILABLE: 'Available', ON_BREAK: 'On Break', SLEEPER_BERTH: 'Sleeper Berth', HOS_LIMIT: 'HOS Limit', INACTIVE: 'Inactive',
};
const PROV: Record<string, { bg: string; text: string; label: string }> = {
  motive: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Motive' },
  samsara: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Samsara' },
};
const STATUS_DOT: Record<string, string> = { DRIVING: 'bg-green-500', ON_DUTY: 'bg-blue-500', SLEEPER: 'bg-purple-500', OFF_DUTY: 'bg-gray-400' };

function scoreColor(s: number) { return s >= 90 ? 'text-green-600' : s >= 80 ? 'text-yellow-600' : 'text-red-600'; }
function scoreBg(s: number) { return s >= 90 ? 'bg-green-500' : s >= 80 ? 'bg-yellow-500' : 'bg-red-500'; }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

// ─ Mock Driver Data (fallback when API is empty) ─
const MOCK_DRIVERS = [
  { id: 'd1', user: { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@axontms.com', phone: '(555) 901-2345' }, cdlClass: 'A', cdlExpiry: '2028-06-15', hosHoursUsed: 4.5, status: 'DRIVING' },
  { id: 'd2', user: { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.c@axontms.com', phone: '(555) 234-5678' }, cdlClass: 'A', cdlExpiry: '2029-03-20', hosHoursUsed: 0, status: 'AVAILABLE' },
  { id: 'd3', user: { firstName: 'James', lastName: 'Williams', email: 'james.w@axontms.com', phone: '(555) 567-8901' }, cdlClass: 'A', cdlExpiry: '2027-11-30', hosHoursUsed: 7.8, status: 'DRIVING' },
  { id: 'd4', user: { firstName: 'Maria', lastName: 'Rodriguez', email: 'maria.r@axontms.com', phone: '(555) 678-9012' }, cdlClass: 'A', cdlExpiry: '2030-01-10', hosHoursUsed: 0, status: 'AVAILABLE' },
  { id: 'd5', user: { firstName: 'David', lastName: 'Kim', email: 'david.k@axontms.com', phone: '(555) 789-0123' }, cdlClass: 'A', cdlExpiry: '2028-09-22', hosHoursUsed: 0, status: 'OFF_DUTY' },
  { id: 'd6', user: { firstName: 'Emily', lastName: 'Taylor', email: 'emily.t@axontms.com', phone: '(555) 345-6789' }, cdlClass: 'A', cdlExpiry: '2029-07-14', hosHoursUsed: 0, status: 'SLEEPER_BERTH' },
  { id: 'd7', user: { firstName: 'Robert', lastName: 'Brown', email: 'robert.b@axontms.com', phone: '(555) 456-7890' }, cdlClass: 'A', cdlExpiry: '2028-04-18', hosHoursUsed: 3.0, status: 'DRIVING' },
  { id: 'd8', user: { firstName: 'Lisa', lastName: 'Nguyen', email: 'lisa.n@axontms.com', phone: '(555) 012-3456' }, cdlClass: 'A', cdlExpiry: '2029-11-05', hosHoursUsed: 0, status: 'AVAILABLE' },
];

// ─ Component ─
export function DriversPage() {
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driversTab, setDriversTab] = useState<'roster' | 'pay'>('roster');

  const { data: apiDrivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => { const { data } = await api.get('/drivers'); return data; },
  });

  // Use API drivers if available, fall back to mock
  const drivers = (apiDrivers && apiDrivers.length > 0) ? apiDrivers : MOCK_DRIVERS;

  const eldValues = Object.values(ELD_DRIVER_DATA);

  const stats = useMemo(() => ({
    total: eldValues.length,
    driving: eldValues.filter(d => d.currentStatus === 'DRIVING').length,
    available: eldValues.filter(d => d.currentStatus === 'ON_DUTY' || d.currentStatus === 'OFF_DUTY').length,
    sleeper: eldValues.filter(d => d.currentStatus === 'SLEEPER').length,
    avgScore: Math.round(eldValues.reduce((s, d) => s + d.safetyScore, 0) / eldValues.length),
    unreviewedCamera: eldValues.reduce((s, d) => s + d.cameraEventsUnreviewed, 0),
    violations: eldValues.reduce((s, d) => s + d.violationsThisMonth, 0),
    totalMiles: eldValues.reduce((s, d) => s + d.milesThisMonth, 0),
  }), []);

  // Get ELD data for a driver
  const getELD = (driver: any): ELDDriverData | null => {
    return ELD_DRIVER_DATA[driver.id] || null;
  };

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    if (statusFilter === 'All') return drivers;
    return drivers.filter((d: any) => {
      const eld = getELD(d);
      if (!eld) return false;
      return eld.currentStatus === statusFilter;
    });
  }, [drivers, statusFilter]);

  return (
    <div>
      {showModal && <AddDriverModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Drivers</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700">+ Add Driver</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button onClick={() => setDriversTab('roster')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${driversTab === 'roster' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>Roster & ELD</button>
        <button onClick={() => setDriversTab('pay')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${driversTab === 'pay' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}>Pay & Settlement</button>
      </div>

      {driversTab === 'roster' && (<>
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Active Drivers</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            <span className="text-green-600">{stats.driving} driving</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">{stats.available} avail</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Avg Safety Score</p>
          <p className={`text-xl font-bold ${scoreColor(stats.avgScore)}`}>{stats.avgScore}</p>
          <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${scoreBg(stats.avgScore)}`} style={{ width: `${stats.avgScore}%` }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Camera Events</p>
          <p className={`text-xl font-bold ${stats.unreviewedCamera > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.unreviewedCamera}</p>
          <p className="text-xs text-gray-400 mt-1.5">unreviewed this week</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">HOS Violations</p>
          <p className={`text-xl font-bold ${stats.violations > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.violations}</p>
          <p className="text-xs text-gray-400 mt-1.5">this month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Fleet Miles (MTD)</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalMiles.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1.5">across all drivers</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1 mb-3">
        {['All', 'DRIVING', 'ON_DUTY', 'OFF_DUTY', 'SLEEPER'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {STATUS_LABELS[s] || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">ELD</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">HOS Available</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Cycle (70h)</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Safety</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Camera</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles (MTD)</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">CDL Expiry</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400">Loading drivers...</td></tr>}
              {!isLoading && filteredDrivers.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400">No drivers found.</td></tr>}
              {filteredDrivers.map((driver: any) => {
                const eld = getELD(driver);
                const hosWarning = eld && eld.hoursAvailable <= 2 && eld.currentStatus === 'DRIVING';
                const hosLow = eld && eld.hoursAvailable <= 4 && eld.currentStatus === 'DRIVING';
                const rowHighlight = hosWarning ? 'bg-red-50 border-l-4 border-l-red-400' : hosLow ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : '';

                return (
                  <tr key={driver.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`} onClick={() => setSelectedDriver(driver)}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                          {driver.user.firstName[0]}{driver.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">{driver.user.firstName} {driver.user.lastName}</p>
                          <p className="text-xs text-gray-400">{driver.user.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {eld ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PROV[eld.provider].bg} ${PROV[eld.provider].text}`}>{PROV[eld.provider].label}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {eld ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[eld.currentStatus]}`} />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[eld.currentStatus]}`}>{STATUS_LABELS[eld.currentStatus]}</span>
                        </div>
                      ) : <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[driver.status]}`}>{STATUS_LABELS[driver.status]}</span>}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{eld?.unitNumber || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600">{eld ? `${eld.currentCity}, ${eld.currentState}` : '—'}</td>
                    <td className="px-3 py-2.5">
                      {eld ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${eld.hoursAvailable <= 2 ? 'bg-red-500' : eld.hoursAvailable <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.max((eld.hoursAvailable / 11) * 100, 5)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${eld.hoursAvailable <= 2 ? 'text-red-600' : eld.hoursAvailable <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>{eld.hoursAvailable}h</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {eld ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${eld.cycleAvailable <= 10 ? 'bg-red-500' : 'bg-blue-400'}`} style={{ width: `${(eld.cycleUsed / 70) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{eld.cycleAvailable}h left</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {eld ? <span className={`text-xs font-bold ${scoreColor(eld.safetyScore)}`}>{eld.safetyScore}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {eld ? (
                        eld.cameraEventsUnreviewed > 0
                          ? <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">{eld.cameraEventsUnreviewed}</span>
                          : <span className="text-green-600 text-xs">0</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{eld ? eld.milesThisMonth.toLocaleString() : '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600">{driver.cdlExpiry ? new Date(driver.cdlExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Showing:</strong> {filteredDrivers.length}</span>
          <span><strong className="text-gray-800">Driving:</strong> <span className="text-green-600">{eldValues.filter(d => d.currentStatus === 'DRIVING').length}</span></span>
          <span><strong className="text-gray-800">Avg Safety:</strong> <span className={scoreColor(stats.avgScore)}>{stats.avgScore}</span></span>
          <span><strong className="text-gray-800">Total Miles (MTD):</strong> {stats.totalMiles.toLocaleString()}</span>
        </div>
      </div>
      </>)}

      {/* ─ Pay & Settlement Tab ─ */}
      {driversTab === 'pay' && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Payroll (This Period)</p><p className="text-xl font-bold text-gray-900">$24,680</p><p className="text-xs text-gray-400 mt-1">Apr 1-14, 2026</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Pending Settlement</p><p className="text-xl font-bold text-yellow-600">$8,420</p><p className="text-xs text-yellow-600 mt-1">3 drivers</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Avg Pay / Mile</p><p className="text-xl font-bold text-blue-600">$0.58</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Deductions (Total)</p><p className="text-xl font-bold text-red-600">$3,240</p><p className="text-xs text-gray-400 mt-1">Insurance, advances, other</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Driver Settlement — Current Period</h3><div className="flex gap-2"><button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">⬇ Export Settlements</button><button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Process Payroll</button></div></div>
            <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Pay Type</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Loads</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Gross Pay</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Deductions</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Net Pay</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead><tbody>
              {[
                { name: 'Marcus Johnson', payType: 'Per Mile ($0.58)', loads: 8, miles: 3200, gross: 1856, deductions: 320, net: 1536, status: 'SETTLED' },
                { name: 'Sarah Chen', payType: 'Percentage (28%)', loads: 6, miles: 2800, gross: 3024, deductions: 480, net: 2544, status: 'SETTLED' },
                { name: 'Robert Brown', payType: 'Per Mile ($0.55)', loads: 7, miles: 2600, gross: 1430, deductions: 280, net: 1150, status: 'PENDING' },
                { name: 'James Williams', payType: 'Flat Rate ($850/load)', loads: 5, miles: 3400, gross: 4250, deductions: 520, net: 3730, status: 'PENDING' },
                { name: 'Maria Rodriguez', payType: 'Per Mile ($0.58)', loads: 9, miles: 3800, gross: 2204, deductions: 380, net: 1824, status: 'SETTLED' },
                { name: 'David Kim', payType: 'Percentage (25%)', loads: 4, miles: 1900, gross: 2100, deductions: 340, net: 1760, status: 'PENDING' },
                { name: 'Emily Taylor', payType: 'Per Mile ($0.55)', loads: 6, miles: 2400, gross: 1320, deductions: 220, net: 1100, status: 'SETTLED' },
                { name: 'Lisa Nguyen', payType: 'Flat Rate ($900/load)', loads: 5, miles: 2900, gross: 4500, deductions: 700, net: 3800, status: 'SETTLED' },
              ].map((d, i) => (
                <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${d.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{d.name}</td>
                  <td className="px-3 py-2.5 text-gray-600">{d.payType}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{d.loads}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{d.miles.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">${d.gross.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-red-600">-${d.deductions.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-green-600">${d.net.toLocaleString()}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'SETTLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{d.status === 'SETTLED' ? 'Settled' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody></table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span>Total Gross: <strong className="text-gray-800">$20,684</strong></span>
              <span>Total Deductions: <strong className="text-red-600">-$3,240</strong></span>
              <span>Total Net: <strong className="text-green-600">$17,444</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ─ Driver Detail Flyout ─ */}
      {selectedDriver && (() => {
        const eld = getELD(selectedDriver);
        return (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedDriver(null)}>
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                      {selectedDriver.user.firstName[0]}{selectedDriver.user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{selectedDriver.user.firstName} {selectedDriver.user.lastName}</h3>
                      <p className="text-xs text-gray-400">{selectedDriver.user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                </div>
                {eld && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[eld.currentStatus]}`}>{STATUS_LABELS[eld.currentStatus]}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PROV[eld.provider].bg} ${PROV[eld.provider].text}`}>{PROV[eld.provider].label}</span>
                    <span className="text-xs text-gray-400">{eld.unitNumber} · {eld.currentCity}, {eld.currentState}</span>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 space-y-5">
                {/* ELD HOS Dashboard */}
                {eld && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">HOS (from {PROV[eld.provider].label} ELD)</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className={`text-lg font-bold ${eld.hoursAvailable <= 2 ? 'text-red-600' : eld.hoursAvailable <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>{eld.hoursAvailable}h</p>
                          <p className="text-xs text-gray-400">Drive left</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{eld.drivingUsed}h</p>
                          <p className="text-xs text-gray-400">Driving used</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{eld.onDutyUsed}h</p>
                          <p className="text-xs text-gray-400">On-duty used</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">70-hour cycle</span>
                          <span className="text-xs font-medium text-gray-700">{eld.cycleUsed}h used · {eld.cycleAvailable}h left</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${eld.cycleAvailable <= 10 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(eld.cycleUsed / 70) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Last status change</span>
                        <span className="text-gray-700">{fmtTime(eld.lastStatusChange)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Violations (this month)</span>
                        <span className={eld.violationsThisMonth > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{eld.violationsThisMonth}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety Score */}
                {eld && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Safety & Driving Behavior</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${scoreBg(eld.safetyScore)}`}>
                          {eld.safetyScore}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">Safety Score</p>
                          <p className="text-xs text-gray-400">{eld.safetyScore >= 90 ? 'Excellent' : eld.safetyScore >= 80 ? 'Good — room for improvement' : 'Needs attention'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-white">
                          <span className="text-xs text-gray-500">Hard braking</span>
                          <span className={`text-xs font-medium ${eld.hardBrakeCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{eld.hardBrakeCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-white">
                          <span className="text-xs text-gray-500">Harsh accel</span>
                          <span className={`text-xs font-medium ${eld.harshAccelCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{eld.harshAccelCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-white">
                          <span className="text-xs text-gray-500">Speeding</span>
                          <span className={`text-xs font-medium ${eld.speedingCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{eld.speedingCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-white">
                          <span className="text-xs text-gray-500">Distracted</span>
                          <span className={`text-xs font-medium ${eld.distractedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{eld.distractedCount}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 text-xs">
                        <span className="text-gray-500">Camera events (total)</span>
                        <span className="text-gray-700">{eld.cameraEventsTotal} events · {eld.cameraEventsUnreviewed > 0 ? <span className="text-yellow-600 font-medium">{eld.cameraEventsUnreviewed} unreviewed</span> : <span className="text-green-600">all reviewed</span>}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mileage */}
                {eld && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Mileage</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-900">{eld.milesThisWeek.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">This week</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-900">{eld.milesThisMonth.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">This month</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Info */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Driver Information</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div><span className="text-xs text-gray-400 block">Phone</span><span className="text-xs text-gray-800">{selectedDriver.user.phone || '—'}</span></div>
                    <div><span className="text-xs text-gray-400 block">Email</span><span className="text-xs text-blue-600">{selectedDriver.user.email}</span></div>
                    <div><span className="text-xs text-gray-400 block">CDL Class</span><span className="text-xs text-gray-800">{selectedDriver.cdlClass || '—'}</span></div>
                    <div><span className="text-xs text-gray-400 block">CDL Expiry</span><span className="text-xs text-gray-800">{selectedDriver.cdlExpiry ? new Date(selectedDriver.cdlExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">View ELD Logs</button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit Driver</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
