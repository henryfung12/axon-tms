import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface ComplianceItem {
  id: string;
  entityType: 'DRIVER' | 'TRUCK' | 'TRAILER';
  entityId: string;
  entityName: string;
  documentType: string;
  status: 'CURRENT' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  expiryDate: string | null;
  lastUpdated: string;
  notes: string;
}

interface Incident {
  id: string;
  incidentNumber: string;
  type: 'ACCIDENT' | 'ROADSIDE_INSPECTION' | 'HOS_VIOLATION' | 'CARGO_CLAIM' | 'NEAR_MISS' | 'INJURY';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  date: string;
  driverName: string;
  driverId: string;
  unitNumber: string;
  location: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  preventable: boolean | null;
  cost: number;
  notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_COMPLIANCE: ComplianceItem[] = [
  // Drivers
  { id: 'dc1', entityType: 'DRIVER', entityId: 'd1', entityName: 'Marcus Johnson', documentType: 'CDL', status: 'CURRENT', expiryDate: '2028-06-15', lastUpdated: '2026-03-01', notes: '' },
  { id: 'dc2', entityType: 'DRIVER', entityId: 'd1', entityName: 'Marcus Johnson', documentType: 'Medical Card', status: 'EXPIRING_SOON', expiryDate: '2026-05-10', lastUpdated: '2024-05-10', notes: 'Schedule DOT physical by 5/1' },
  { id: 'dc3', entityType: 'DRIVER', entityId: 'd1', entityName: 'Marcus Johnson', documentType: 'Drug Test', status: 'CURRENT', expiryDate: '2027-01-15', lastUpdated: '2026-01-15', notes: 'Random  passed' },
  { id: 'dc4', entityType: 'DRIVER', entityId: 'd2', entityName: 'Sarah Chen', documentType: 'CDL', status: 'CURRENT', expiryDate: '2029-03-20', lastUpdated: '2026-02-15', notes: '' },
  { id: 'dc5', entityType: 'DRIVER', entityId: 'd2', entityName: 'Sarah Chen', documentType: 'Medical Card', status: 'CURRENT', expiryDate: '2027-08-22', lastUpdated: '2025-08-22', notes: '' },
  { id: 'dc6', entityType: 'DRIVER', entityId: 'd2', entityName: 'Sarah Chen', documentType: 'MVR Review', status: 'CURRENT', expiryDate: '2027-02-15', lastUpdated: '2026-02-15', notes: 'Clean record' },
  { id: 'dc7', entityType: 'DRIVER', entityId: 'd3', entityName: 'James Williams', documentType: 'CDL', status: 'CURRENT', expiryDate: '2027-11-30', lastUpdated: '2026-01-10', notes: '' },
  { id: 'dc8', entityType: 'DRIVER', entityId: 'd3', entityName: 'James Williams', documentType: 'Medical Card', status: 'CURRENT', expiryDate: '2026-09-15', lastUpdated: '2024-09-15', notes: '' },
  { id: 'dc9', entityType: 'DRIVER', entityId: 'd3', entityName: 'James Williams', documentType: 'HazMat Endorsement', status: 'EXPIRED', expiryDate: '2026-03-01', lastUpdated: '2021-03-01', notes: 'EXPIRED  do not dispatch HazMat loads' },
  { id: 'dc10', entityType: 'DRIVER', entityId: 'd4', entityName: 'Maria Rodriguez', documentType: 'CDL', status: 'CURRENT', expiryDate: '2030-01-10', lastUpdated: '2026-04-01', notes: 'Renewed' },
  { id: 'dc11', entityType: 'DRIVER', entityId: 'd4', entityName: 'Maria Rodriguez', documentType: 'Medical Card', status: 'CURRENT', expiryDate: '2028-04-01', lastUpdated: '2026-04-01', notes: '' },
  { id: 'dc12', entityType: 'DRIVER', entityId: 'd5', entityName: 'David Kim', documentType: 'CDL', status: 'CURRENT', expiryDate: '2028-09-22', lastUpdated: '2025-12-01', notes: '' },
  { id: 'dc13', entityType: 'DRIVER', entityId: 'd5', entityName: 'David Kim', documentType: 'Drug Test', status: 'EXPIRING_SOON', expiryDate: '2026-04-30', lastUpdated: '2025-04-30', notes: 'Annual random due  schedule by 4/25' },
  { id: 'dc14', entityType: 'DRIVER', entityId: 'd6', entityName: 'Emily Taylor', documentType: 'CDL', status: 'CURRENT', expiryDate: '2029-07-14', lastUpdated: '2026-01-20', notes: '' },
  { id: 'dc15', entityType: 'DRIVER', entityId: 'd6', entityName: 'Emily Taylor', documentType: 'Medical Card', status: 'CURRENT', expiryDate: '2027-01-20', lastUpdated: '2025-01-20', notes: '' },
  { id: 'dc16', entityType: 'DRIVER', entityId: 'd7', entityName: 'Robert Brown', documentType: 'CDL', status: 'CURRENT', expiryDate: '2028-04-18', lastUpdated: '2026-02-10', notes: '' },
  { id: 'dc17', entityType: 'DRIVER', entityId: 'd7', entityName: 'Robert Brown', documentType: 'Medical Card', status: 'CURRENT', expiryDate: '2027-02-10', lastUpdated: '2025-02-10', notes: '' },
  { id: 'dc18', entityType: 'DRIVER', entityId: 'd8', entityName: 'Lisa Nguyen', documentType: 'CDL', status: 'CURRENT', expiryDate: '2029-11-05', lastUpdated: '2025-11-05', notes: '' },
  { id: 'dc19', entityType: 'DRIVER', entityId: 'd8', entityName: 'Lisa Nguyen', documentType: 'Medical Card', status: 'EXPIRING_SOON', expiryDate: '2026-05-05', lastUpdated: '2024-05-05', notes: 'Schedule physical' },
  // Vehicles
  { id: 'vc1', entityType: 'TRUCK', entityId: 't5', entityName: 'T-1044', documentType: 'Annual Inspection', status: 'EXPIRING_SOON', expiryDate: '2026-04-22', lastUpdated: '2025-07-10', notes: 'WO scheduled 4/18' },
  { id: 'vc2', entityType: 'TRUCK', entityId: 't10', entityName: 'T-1082', documentType: 'Annual Inspection', status: 'EXPIRED', expiryDate: '2026-04-01', lastUpdated: '2025-04-01', notes: 'Unit OOS  frame damage' },
  { id: 'vc3', entityType: 'TRUCK', entityId: 't10', entityName: 'T-1082', documentType: 'Registration', status: 'EXPIRING_SOON', expiryDate: '2026-05-01', lastUpdated: '2025-05-01', notes: 'Do not renew  pending total loss' },
  { id: 'vc4', entityType: 'TRAILER', entityId: 'tr7', entityName: 'TR-2222', documentType: 'Annual Inspection', status: 'EXPIRED', expiryDate: '2026-04-10', lastUpdated: '2025-07-10', notes: 'EXPIRED 4/10  do not dispatch' },
  { id: 'vc5', entityType: 'TRAILER', entityId: 'tr9', entityName: 'TR-2240', documentType: 'Annual Inspection', status: 'EXPIRING_SOON', expiryDate: '2026-05-15', lastUpdated: '2025-05-15', notes: '' },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc1', incidentNumber: 'INC-2026-042', type: 'ROADSIDE_INSPECTION', severity: 'MINOR', date: '2026-04-10',
    driverName: 'Robert Brown', driverId: 'd7', unitNumber: 'T-1070', location: 'I-65 SB, Mile 42, KY',
    description: 'Level 2 roadside inspection  no violations found. Clean inspection.',
    status: 'CLOSED', preventable: null, cost: 0, notes: 'Clean inspection added to driver file.',
  },
  {
    id: 'inc2', incidentNumber: 'INC-2026-038', type: 'ACCIDENT', severity: 'MAJOR', date: '2026-04-06',
    driverName: 'James Williams', driverId: 'd3', unitNumber: 'T-1082', location: 'I-76 WB, Exit 28, PA',
    description: 'Road debris (tire tread) struck right frame rail at highway speed. No injuries. Frame damage  unit towed to Pittsburgh yard.',
    status: 'UNDER_REVIEW', preventable: false, cost: 15000, notes: 'Insurance claim filed. Adjuster inspection 4/15. Driver cleared  non-preventable.',
  },
  {
    id: 'inc3', incidentNumber: 'INC-2026-035', type: 'HOS_VIOLATION', severity: 'MINOR', date: '2026-04-02',
    driverName: 'Marcus Johnson', driverId: 'd1', unitNumber: 'T-1042', location: 'Memphis, TN (yard)',
    description: 'ELD flagged 14-hour rule violation  driver logged 14h 22m. Delayed at shipper dock 3.5 hours contributed.',
    status: 'RESOLVED', preventable: true, cost: 0, notes: 'Driver counseled on proper use of sleeper split. Shipper detention documented for future rate negotiations.',
  },
  {
    id: 'inc4', incidentNumber: 'INC-2026-029', type: 'CARGO_CLAIM', severity: 'MINOR', date: '2026-03-25',
    driverName: 'Sarah Chen', driverId: 'd2', unitNumber: 'TR-2204', location: 'Dallas, TX',
    description: 'Reefer temperature excursion  unit set to 34°F, recorded 42°F for 45 minutes during fueling stop. Customer filed partial claim on 4 pallets of produce.',
    status: 'RESOLVED', preventable: true, cost: 3200, notes: 'Reefer left in cycle-sentry during fueling. Driver retrained on continuous run protocol. Claim settled $3,200.',
  },
  {
    id: 'inc5', incidentNumber: 'INC-2026-022', type: 'ROADSIDE_INSPECTION', severity: 'MAJOR', date: '2026-03-18',
    driverName: 'David Kim', driverId: 'd5', unitNumber: 'T-1029', location: 'I-55 NB, Sikeston, MO',
    description: 'Level 1 inspection  brake adjustment violation on drive axle. 20% out of adjustment. OOS for 4 hours while repaired roadside.',
    status: 'CLOSED', preventable: true, cost: 450, notes: 'PM schedule reviewed. Added brake check to pre-trip emphasis items. Cost: $450 roadside repair.',
  },
  {
    id: 'inc6', incidentNumber: 'INC-2026-018', type: 'NEAR_MISS', severity: 'INFO', date: '2026-03-12',
    driverName: 'Maria Rodriguez', driverId: 'd4', unitNumber: 'T-1061', location: 'I-85 NB, Greenville, SC',
    description: 'Passenger vehicle merged into lane occupied by truck. Dashcam recorded near-miss. No contact made. Driver took evasive action safely.',
    status: 'CLOSED', preventable: false, cost: 0, notes: 'Dashcam footage saved. Good defensive driving by MR.',
  },
];

// ── ELD Camera Events (from Motive + Samsara) ─────────────────────
interface CameraEvent {
  id: string; timestamp: string; unitNumber: string; driverName: string; driverId: string;
  provider: 'motive' | 'samsara';
  eventType: 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'ROLLING_STOP' | 'DISTRACTED_DRIVING' | 'TAILGATING' | 'COLLISION' | 'LANE_DEPARTURE' | 'DROWSINESS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; location: string; reviewed: boolean; coachable: boolean;
}

interface DriverScore {
  driverId: string; driverName: string; provider: 'motive' | 'samsara'; unitNumber: string;
  safetyScore: number; hardBrakeCount: number; harshAccelCount: number; speedingCount: number;
  distractedCount: number; cameraEventsTotal: number; cameraEventsUnreviewed: number;
  milesThisMonth: number; hosViolations: number;
}

const CAMERA_EVENTS: CameraEvent[] = [
  { id: 'ce1', timestamp: '2026-04-13T11:42:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', driverId: 'd1', provider: 'motive', eventType: 'HARSH_BRAKING', severity: 'MEDIUM', location: 'I-40 EB, Memphis TN', reviewed: false, coachable: true },
  { id: 'ce2', timestamp: '2026-04-12T16:15:00Z', unitNumber: 'T-1055', driverName: 'James Williams', driverId: 'd3', provider: 'motive', eventType: 'DISTRACTED_DRIVING', severity: 'HIGH', location: 'I-65 NB, Indianapolis IN', reviewed: false, coachable: true },
  { id: 'ce3', timestamp: '2026-04-12T09:30:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', driverId: 'd7', provider: 'samsara', eventType: 'TAILGATING', severity: 'MEDIUM', location: 'I-24 WB, Nashville TN', reviewed: true, coachable: true },
  { id: 'ce4', timestamp: '2026-04-11T14:22:00Z', unitNumber: 'T-1038', driverName: 'Sarah Chen', driverId: 'd2', provider: 'samsara', eventType: 'ROLLING_STOP', severity: 'LOW', location: 'FM 1382, Dallas TX', reviewed: true, coachable: false },
  { id: 'ce5', timestamp: '2026-04-11T08:05:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', driverId: 'd1', provider: 'motive', eventType: 'LANE_DEPARTURE', severity: 'LOW', location: 'I-55 SB, Memphis TN', reviewed: true, coachable: false },
  { id: 'ce6', timestamp: '2026-04-10T17:50:00Z', unitNumber: 'T-1055', driverName: 'James Williams', driverId: 'd3', provider: 'motive', eventType: 'HARSH_ACCELERATION', severity: 'LOW', location: 'I-70 WB, Indianapolis IN', reviewed: true, coachable: false },
  { id: 'ce7', timestamp: '2026-04-10T10:12:00Z', unitNumber: 'T-1061', driverName: 'Maria Rodriguez', driverId: 'd4', provider: 'samsara', eventType: 'DROWSINESS', severity: 'CRITICAL', location: 'I-85 SB, Atlanta GA', reviewed: true, coachable: true },
  { id: 'ce8', timestamp: '2026-04-09T22:30:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', driverId: 'd7', provider: 'samsara', eventType: 'HARSH_BRAKING', severity: 'MEDIUM', location: 'I-65 SB, Nashville TN', reviewed: true, coachable: true },
  { id: 'ce9', timestamp: '2026-04-09T06:15:00Z', unitNumber: 'T-1055', driverName: 'James Williams', driverId: 'd3', provider: 'motive', eventType: 'HARSH_BRAKING', severity: 'MEDIUM', location: 'I-74 EB, Champaign IL', reviewed: true, coachable: true },
  { id: 'ce10', timestamp: '2026-04-08T14:00:00Z', unitNumber: 'T-1029', driverName: 'David Kim', driverId: 'd5', provider: 'motive', eventType: 'HARSH_BRAKING', severity: 'LOW', location: 'I-94 WB, Chicago IL', reviewed: true, coachable: false },
];

const DRIVER_SCORES: DriverScore[] = [
  { driverId: 'd1', driverName: 'Marcus Johnson', provider: 'motive', unitNumber: 'T-1042', safetyScore: 88, hardBrakeCount: 2, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, cameraEventsTotal: 4, cameraEventsUnreviewed: 1, milesThisMonth: 6420, hosViolations: 1 },
  { driverId: 'd2', driverName: 'Sarah Chen', provider: 'samsara', unitNumber: 'T-1038', safetyScore: 95, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, cameraEventsTotal: 2, cameraEventsUnreviewed: 0, milesThisMonth: 7800, hosViolations: 0 },
  { driverId: 'd3', driverName: 'James Williams', provider: 'motive', unitNumber: 'T-1055', safetyScore: 78, hardBrakeCount: 1, harshAccelCount: 2, speedingCount: 2, distractedCount: 1, cameraEventsTotal: 6, cameraEventsUnreviewed: 1, milesThisMonth: 8900, hosViolations: 0 },
  { driverId: 'd4', driverName: 'Maria Rodriguez', provider: 'samsara', unitNumber: 'T-1061', safetyScore: 97, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, cameraEventsTotal: 1, cameraEventsUnreviewed: 0, milesThisMonth: 4800, hosViolations: 0 },
  { driverId: 'd5', driverName: 'David Kim', provider: 'motive', unitNumber: 'T-1029', safetyScore: 82, hardBrakeCount: 1, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, cameraEventsTotal: 3, cameraEventsUnreviewed: 0, milesThisMonth: 5900, hosViolations: 0 },
  { driverId: 'd6', driverName: 'Emily Taylor', provider: 'samsara', unitNumber: 'T-1044', safetyScore: 91, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 1, distractedCount: 0, cameraEventsTotal: 1, cameraEventsUnreviewed: 0, milesThisMonth: 7200, hosViolations: 0 },
  { driverId: 'd7', driverName: 'Robert Brown', provider: 'motive', unitNumber: 'T-1070', safetyScore: 93, hardBrakeCount: 1, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, cameraEventsTotal: 2, cameraEventsUnreviewed: 0, milesThisMonth: 6100, hosViolations: 0 },
  { driverId: 'd8', driverName: 'Lisa Nguyen', provider: 'samsara', unitNumber: 'T-1033', safetyScore: 90, hardBrakeCount: 0, harshAccelCount: 0, speedingCount: 0, distractedCount: 0, cameraEventsTotal: 0, cameraEventsUnreviewed: 0, milesThisMonth: 6300, hosViolations: 0 },
];

const CAMERA_TYPE_LABELS: Record<string, string> = { HARSH_BRAKING: 'Harsh braking', HARSH_ACCELERATION: 'Harsh accel', ROLLING_STOP: 'Rolling stop', DISTRACTED_DRIVING: 'Distracted driving', TAILGATING: 'Tailgating', COLLISION: 'Collision', LANE_DEPARTURE: 'Lane departure', DROWSINESS: 'Drowsiness' };
const CAMERA_SEVERITY: Record<string, string> = { CRITICAL: 'bg-red-600 text-white', HIGH: 'bg-red-100 text-red-800', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-gray-100 text-gray-600' };
const PROV: Record<string, { bg: string; text: string; label: string }> = { motive: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Motive' }, samsara: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Samsara' } };
function scoreColor(s: number) { return s >= 90 ? 'text-green-600' : s >= 80 ? 'text-yellow-600' : 'text-red-600'; }
function scoreBg(s: number) { return s >= 90 ? 'bg-green-500' : s >= 80 ? 'bg-yellow-500' : 'bg-red-500'; }
function fmtDT(d: string) { const t = new Date(d); return `${t.toLocaleDateString('en-US',{month:'short',day:'numeric'})} ${t.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`; }
const COMPLIANCE_STATUS_BADGES: Record<string, string> = {
  CURRENT: 'bg-green-100 text-green-800',
  EXPIRING_SOON: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
  MISSING: 'bg-gray-100 text-gray-600',
};

const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  CURRENT: 'Current',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
  MISSING: 'Missing',
};

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  ACCIDENT: 'Accident',
  ROADSIDE_INSPECTION: 'Roadside Inspection',
  HOS_VIOLATION: 'HOS Violation',
  CARGO_CLAIM: 'Cargo Claim',
  NEAR_MISS: 'Near Miss',
  INJURY: 'Injury',
};

const INCIDENT_TYPE_ICONS: Record<string, string> = {
  ACCIDENT: '💥',
  ROADSIDE_INSPECTION: '🛑',
  HOS_VIOLATION: '⏱',
  CARGO_CLAIM: '📦',
  NEAR_MISS: '⚠',
  INJURY: '🏥',
};

const SEVERITY_BADGES: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  MAJOR: 'bg-red-100 text-red-800',
  MINOR: 'bg-yellow-100 text-yellow-800',
  INFO: 'bg-blue-100 text-blue-800',
};

const INCIDENT_STATUS_BADGES: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return -9999;
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────
export function SafetyPage() {
  const [activeTab, setActiveTab] = useState<'compliance' | 'incidents' | 'camera_events' | 'driver_scores'>('compliance');
  const [complianceFilter, setComplianceFilter] = useState<'All' | 'DRIVER' | 'TRUCK' | 'TRAILER'>('All');
  const [complianceStatusFilter, setComplianceStatusFilter] = useState('All');
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('All');
  const [cameraFilter, setCameraFilter] = useState<'all' | 'unreviewed' | 'coachable'>('all');
  const [cameraProvFilter, setCameraProvFilter] = useState<'all' | 'motive' | 'samsara'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceItem | null>(null);

  // Camera events filtering
  const filteredCameraEvents = useMemo(() => {
    let items = CAMERA_EVENTS.filter(e => cameraProvFilter === 'all' || e.provider === cameraProvFilter);
    if (cameraFilter === 'unreviewed') items = items.filter(e => !e.reviewed);
    if (cameraFilter === 'coachable') items = items.filter(e => e.coachable);
    if (searchQuery) { const q = searchQuery.toLowerCase(); items = items.filter(e => e.driverName.toLowerCase().includes(q) || e.unitNumber.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)); }
    return items;
  }, [cameraFilter, cameraProvFilter, searchQuery]);

  // Compliance filtering
  const filteredCompliance = useMemo(() => {
    return MOCK_COMPLIANCE.filter(c => {
      if (complianceFilter !== 'All' && c.entityType !== complianceFilter) return false;
      if (complianceStatusFilter !== 'All' && c.status !== complianceStatusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.entityName.toLowerCase().includes(q) || c.documentType.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      const order = { EXPIRED: 0, EXPIRING_SOON: 1, MISSING: 2, CURRENT: 3 };
      return order[a.status] - order[b.status];
    });
  }, [complianceFilter, complianceStatusFilter, searchQuery]);

  // Incident filtering
  const filteredIncidents = useMemo(() => {
    return MOCK_INCIDENTS.filter(inc => {
      if (incidentTypeFilter !== 'All' && inc.type !== incidentTypeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return inc.incidentNumber.toLowerCase().includes(q) || inc.driverName.toLowerCase().includes(q) || inc.location.toLowerCase().includes(q) || inc.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [incidentTypeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const expired = MOCK_COMPLIANCE.filter(c => c.status === 'EXPIRED');
    const expiringSoon = MOCK_COMPLIANCE.filter(c => c.status === 'EXPIRING_SOON');
    const driverIssues = MOCK_COMPLIANCE.filter(c => c.entityType === 'DRIVER' && (c.status === 'EXPIRED' || c.status === 'EXPIRING_SOON'));
    const vehicleIssues = MOCK_COMPLIANCE.filter(c => (c.entityType === 'TRUCK' || c.entityType === 'TRAILER') && (c.status === 'EXPIRED' || c.status === 'EXPIRING_SOON'));
    const openIncidents = MOCK_INCIDENTS.filter(i => i.status === 'OPEN' || i.status === 'UNDER_REVIEW');
    const totalIncidentCost = MOCK_INCIDENTS.reduce((s, i) => s + i.cost, 0);
    const preventable = MOCK_INCIDENTS.filter(i => i.preventable === true);
    const complianceRate = Math.round(((MOCK_COMPLIANCE.length - expired.length) / MOCK_COMPLIANCE.length) * 100);

    return { expired: expired.length, expiringSoon: expiringSoon.length, driverIssues: driverIssues.length, vehicleIssues: vehicleIssues.length, openIncidents: openIncidents.length, totalIncidentCost, preventable: preventable.length, totalIncidents: MOCK_INCIDENTS.length, complianceRate,
      // ELD stats
      unreviewedCamera: CAMERA_EVENTS.filter(e => !e.reviewed).length,
      totalCamera: CAMERA_EVENTS.length,
      criticalCamera: CAMERA_EVENTS.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length,
      avgScore: Math.round(DRIVER_SCORES.reduce((s, d) => s + d.safetyScore, 0) / DRIVER_SCORES.length),
      lowestScore: Math.min(...DRIVER_SCORES.map(d => d.safetyScore)),
      lowestScoreDriver: DRIVER_SCORES.reduce((a, b) => a.safetyScore < b.safetyScore ? a : b).driverName,
    };
  }, []);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Safety & Compliance</h2>
          <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
            {([
              { id: 'compliance' as const, label: 'Compliance Tracker' },
              { id: 'incidents' as const, label: `Incidents (${MOCK_INCIDENTS.length})` },
              { id: 'camera_events' as const, label: `Camera Events (${CAMERA_EVENTS.filter(e => !e.reviewed).length})` },
              { id: 'driver_scores' as const, label: 'Driver Scores' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`px-4 py-1.5 font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'compliance' ? 'Search driver, unit, document...' : 'Search incident, driver, location...'}
            className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Compliance Rate</p>
          <p className={`text-xl font-bold ${stats.complianceRate >= 95 ? 'text-green-700' : stats.complianceRate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>{stats.complianceRate}%</p>
          <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${stats.complianceRate >= 95 ? 'bg-green-500' : stats.complianceRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stats.complianceRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Expired Documents</p>
          <p className={`text-xl font-bold ${stats.expired > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.expired}</p>
          <p className="text-xs mt-1.5">{stats.expiringSoon > 0 ? <span className="text-yellow-600">{stats.expiringSoon} expiring soon</span> : <span className="text-green-600">None expiring</span>}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Driver Issues</p>
          <p className={`text-xl font-bold ${stats.driverIssues > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{stats.driverIssues}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.vehicleIssues} vehicle issues</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Open Incidents</p>
          <p className={`text-xl font-bold ${stats.openIncidents > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.openIncidents}</p>
          <p className="text-xs text-gray-400 mt-1.5">{stats.totalIncidents} total (90d)</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Camera Events</p>
          <p className={`text-xl font-bold ${stats.unreviewedCamera > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.unreviewedCamera}</p>
          <p className="text-xs mt-1.5">{stats.criticalCamera > 0 ? <span className="text-red-500">{stats.criticalCamera} high/critical</span> : <span className="text-green-600">No critical</span>} · {stats.totalCamera} total</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Avg Safety Score</p>
          <p className={`text-xl font-bold ${scoreColor(stats.avgScore)}`}>{stats.avgScore}</p>
          <p className="text-xs mt-1.5">Lowest: <span className={scoreColor(stats.lowestScore)}>{stats.lowestScore} ({stats.lowestScoreDriver.split(' ')[1]})</span></p>
        </div>
      </div>

      {/* ── Compliance Tracker Tab ──────────────────────────── */}
      {activeTab === 'compliance' && (
        <>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex gap-1">
              {['All', 'DRIVER', 'TRUCK', 'TRAILER'].map(f => (
                <button
                  key={f}
                  onClick={() => setComplianceFilter(f as any)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${complianceFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f === 'All' ? 'All' : f === 'DRIVER' ? 'Drivers' : f === 'TRUCK' ? 'Trucks' : 'Trailers'}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex gap-1">
              {['All', 'EXPIRED', 'EXPIRING_SOON', 'CURRENT'].map(s => (
                <button
                  key={s}
                  onClick={() => setComplianceStatusFilter(s)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${complianceStatusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {COMPLIANCE_STATUS_LABELS[s] || 'All Status'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Entity</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Document</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Expiry Date</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Days Remaining</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Updated</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompliance.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400">No compliance items found.</td></tr>
                  )}
                  {filteredCompliance.map(item => {
                    const days = daysUntil(item.expiryDate);
                    const rowHighlight = item.status === 'EXPIRED'
                      ? 'bg-red-50 border-l-4 border-l-red-500'
                      : item.status === 'EXPIRING_SOON'
                      ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                      : '';

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                        onClick={() => setSelectedCompliance(item)}
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-blue-600 font-semibold">{item.entityName}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.entityType === 'DRIVER' ? 'bg-blue-50 text-blue-700' : item.entityType === 'TRUCK' ? 'bg-gray-100 text-gray-700' : 'bg-teal-50 text-teal-700'}`}>
                            {item.entityType === 'DRIVER' ? 'Driver' : item.entityType === 'TRUCK' ? 'Truck' : 'Trailer'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-700 font-medium">{item.documentType}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMPLIANCE_STATUS_BADGES[item.status]}`}>
                            {COMPLIANCE_STATUS_LABELS[item.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">{formatDate(item.expiryDate)}</td>
                        <td className="px-3 py-2.5">
                          {item.expiryDate ? (
                            <span className={`text-xs font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                            </span>
                          ) : ''}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{formatDate(item.lastUpdated)}</td>
                        <td className="px-3 py-2.5 text-gray-500 max-w-xs truncate">{item.notes || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><strong className="text-gray-800">Showing:</strong> {filteredCompliance.length} of {MOCK_COMPLIANCE.length}</span>
              <span><strong className="text-gray-800">Expired:</strong> <span className="text-red-600">{filteredCompliance.filter(c => c.status === 'EXPIRED').length}</span></span>
              <span><strong className="text-gray-800">Expiring:</strong> <span className="text-yellow-600">{filteredCompliance.filter(c => c.status === 'EXPIRING_SOON').length}</span></span>
              <span><strong className="text-gray-800">Current:</strong> <span className="text-green-600">{filteredCompliance.filter(c => c.status === 'CURRENT').length}</span></span>
            </div>
          </div>
        </>
      )}

      {/* ── Incidents Tab ───────────────────────────────────── */}
      {activeTab === 'incidents' && (
        <>
          <div className="flex gap-1 mb-3">
            {['All', 'ACCIDENT', 'ROADSIDE_INSPECTION', 'HOS_VIOLATION', 'CARGO_CLAIM', 'NEAR_MISS'].map(t => (
              <button
                key={t}
                onClick={() => setIncidentTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${incidentTypeFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {INCIDENT_TYPE_LABELS[t] || 'All Types'}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Incident #</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Severity</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Preventable</th>
                    <th className="text-right px-3 py-2.5 font-medium text-gray-500">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-400">No incidents found.</td></tr>
                  )}
                  {filteredIncidents.map(inc => {
                    const rowHighlight = inc.severity === 'CRITICAL'
                      ? 'bg-red-50 border-l-4 border-l-red-500'
                      : inc.severity === 'MAJOR'
                      ? 'bg-red-50 border-l-4 border-l-red-300'
                      : inc.status === 'OPEN' || inc.status === 'UNDER_REVIEW'
                      ? 'bg-yellow-50 border-l-4 border-l-yellow-300'
                      : '';

                    return (
                      <tr
                        key={inc.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                        onClick={() => setSelectedIncident(inc)}
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-blue-600 font-semibold hover:underline">{inc.incidentNumber}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                          <span className="mr-1">{INCIDENT_TYPE_ICONS[inc.type]}</span>{INCIDENT_TYPE_LABELS[inc.type]}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_BADGES[inc.severity]}`}>
                            {inc.severity.charAt(0) + inc.severity.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(inc.date)}</td>
                        <td className="px-3 py-2.5 text-gray-700">{inc.driverName}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">{inc.unitNumber}</td>
                        <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate">{inc.location}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INCIDENT_STATUS_BADGES[inc.status]}`}>
                            {inc.status.replace('_', ' ').charAt(0) + inc.status.replace('_', ' ').slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {inc.preventable === null ? <span className="text-gray-400">N/A</span> : inc.preventable
                            ? <span className="text-red-600 font-medium">Yes</span>
                            : <span className="text-green-600">No</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                          {inc.cost > 0 ? `$${inc.cost.toLocaleString()}` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><strong className="text-gray-800">Showing:</strong> {filteredIncidents.length}</span>
              <span><strong className="text-gray-800">Total Cost:</strong> ${filteredIncidents.reduce((s, i) => s + i.cost, 0).toLocaleString()}</span>
              <span><strong className="text-gray-800">Preventable:</strong> <span className="text-red-600">{filteredIncidents.filter(i => i.preventable).length}</span></span>
            </div>
          </div>
        </>
      )}

      {/* ── Camera Events Tab (from ELD) ─────────────────────── */}
      {activeTab === 'camera_events' && (
        <>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex gap-1">
              {(['all', 'unreviewed', 'coachable'] as const).map(f => (
                <button key={f} onClick={() => setCameraFilter(f)} className={`px-3 py-1 text-xs rounded font-medium transition-colors capitalize ${cameraFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex gap-1">
              {(['all', 'motive', 'samsara'] as const).map(p => (
                <button key={p} onClick={() => setCameraProvFilter(p)} className={`px-3 py-1 text-xs rounded font-medium transition-colors capitalize ${cameraProvFilter === p ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p === 'all' ? 'All Providers' : PROV[p].label}</button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Time</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Event</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Severity</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Reviewed</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Coachable</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Action</th>
                </tr></thead>
                <tbody>
                  {filteredCameraEvents.length === 0 && <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-400">No camera events found.</td></tr>}
                  {filteredCameraEvents.map(e => (
                    <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${e.severity === 'CRITICAL' ? 'bg-red-50 border-l-4 border-l-red-500' : e.severity === 'HIGH' && !e.reviewed ? 'bg-red-50 border-l-4 border-l-red-300' : !e.reviewed ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{fmtDT(e.timestamp)}</td>
                      <td className="px-3 py-2.5 font-semibold text-blue-600">{e.unitNumber}</td>
                      <td className="px-3 py-2.5 text-gray-700">{e.driverName}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROV[e.provider].bg} ${PROV[e.provider].text}`}>{PROV[e.provider].label}</span></td>
                      <td className="px-3 py-2.5 text-gray-700 font-medium">{CAMERA_TYPE_LABELS[e.eventType]}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAMERA_SEVERITY[e.severity]}`}>{e.severity}</span></td>
                      <td className="px-3 py-2.5 text-gray-600">{e.location}</td>
                      <td className="px-3 py-2.5">{e.reviewed ? <span className="text-green-600">Yes</span> : <span className="text-yellow-600 font-medium">No</span>}</td>
                      <td className="px-3 py-2.5">{e.coachable ? <span className="text-blue-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                      <td className="px-3 py-2.5">{!e.reviewed && <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Review</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><strong className="text-gray-800">Total:</strong> {filteredCameraEvents.length}</span>
              <span><strong className="text-gray-800">Unreviewed:</strong> <span className="text-yellow-600">{filteredCameraEvents.filter(e => !e.reviewed).length}</span></span>
              <span><strong className="text-gray-800">Coachable:</strong> {filteredCameraEvents.filter(e => e.coachable).length}</span>
            </div>
          </div>
        </>
      )}

      {/* ── Driver Scores Tab (from ELD) ─────────────────────── */}
      {activeTab === 'driver_scores' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Safety Score</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Hard Braking</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Harsh Accel</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Speeding</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Distracted</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">Camera Events</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-500">HOS Violations</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles (MTD)</th>
              </tr></thead>
              <tbody>
                {[...DRIVER_SCORES].sort((a, b) => a.safetyScore - b.safetyScore).map(d => (
                  <tr key={d.driverId} className={`border-b border-gray-100 hover:bg-gray-50 ${d.safetyScore < 80 ? 'bg-red-50 border-l-4 border-l-red-400' : d.safetyScore < 90 ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{d.driverName}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROV[d.provider].bg} ${PROV[d.provider].text}`}>{PROV[d.provider].label}</span></td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{d.unitNumber}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${scoreBg(d.safetyScore)}`}>{d.safetyScore}</div>
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 text-center font-medium ${d.hardBrakeCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{d.hardBrakeCount}</td>
                    <td className={`px-3 py-2.5 text-center font-medium ${d.harshAccelCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{d.harshAccelCount}</td>
                    <td className={`px-3 py-2.5 text-center font-medium ${d.speedingCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.speedingCount}</td>
                    <td className={`px-3 py-2.5 text-center font-medium ${d.distractedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.distractedCount}</td>
                    <td className="px-3 py-2.5 text-center">
                      {d.cameraEventsUnreviewed > 0
                        ? <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">{d.cameraEventsUnreviewed} / {d.cameraEventsTotal}</span>
                        : <span className="text-gray-600">{d.cameraEventsTotal}</span>}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-medium ${d.hosViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.hosViolations}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{d.milesThisMonth.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
            <span><strong className="text-gray-800">Fleet Avg:</strong> <span className={scoreColor(stats.avgScore)}>{stats.avgScore}</span></span>
            <span><strong className="text-gray-800">Lowest:</strong> <span className={scoreColor(stats.lowestScore)}>{stats.lowestScore} ({stats.lowestScoreDriver})</span></span>
            <span><strong className="text-gray-800">Total Camera Events:</strong> {CAMERA_EVENTS.length}</span>
            <span><strong className="text-gray-800">Total HOS Violations:</strong> {DRIVER_SCORES.reduce((s, d) => s + d.hosViolations, 0)}</span>
          </div>
        </div>
      )}

      {/* ── Incident Detail Flyout ──────────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedIncident(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{selectedIncident.incidentNumber}</h3>
                <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_BADGES[selectedIncident.severity]}`}>
                  {selectedIncident.severity.charAt(0) + selectedIncident.severity.slice(1).toLowerCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INCIDENT_STATUS_BADGES[selectedIncident.status]}`}>
                  {selectedIncident.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">{INCIDENT_TYPE_ICONS[selectedIncident.type]} {INCIDENT_TYPE_LABELS[selectedIncident.type]}</span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              <div>
                <p className="text-xs text-gray-700 leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-xs text-gray-400 block">Date</span>
                  <span className="text-xs font-medium text-gray-800">{formatDate(selectedIncident.date)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Location</span>
                  <span className="text-xs text-gray-800">{selectedIncident.location}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Driver</span>
                  <span className="text-xs font-medium text-gray-800">{selectedIncident.driverName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Unit</span>
                  <span className="text-xs font-medium text-gray-800">{selectedIncident.unitNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Preventable</span>
                  {selectedIncident.preventable === null
                    ? <span className="text-xs text-gray-400">N/A</span>
                    : selectedIncident.preventable
                    ? <span className="text-xs font-medium text-red-600">Yes  Preventable</span>
                    : <span className="text-xs font-medium text-green-600">No  Not Preventable</span>}
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Cost</span>
                  <span className="text-xs font-semibold text-gray-900">{selectedIncident.cost > 0 ? `$${selectedIncident.cost.toLocaleString()}` : 'No cost'}</span>
                </div>
              </div>

              {selectedIncident.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Investigation Notes</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{selectedIncident.notes}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              {(selectedIncident.status === 'OPEN' || selectedIncident.status === 'UNDER_REVIEW') && (
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Update Status</button>
              )}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">Print Report</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compliance Detail Flyout ─────────────────────────── */}
      {selectedCompliance && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCompliance(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[400px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{selectedCompliance.entityName}</h3>
                <button onClick={() => setSelectedCompliance(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCompliance.entityType === 'DRIVER' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedCompliance.entityType === 'DRIVER' ? 'Driver' : selectedCompliance.entityType === 'TRUCK' ? 'Truck' : 'Trailer'}
                </span>
                <span className="text-xs font-medium text-gray-700">{selectedCompliance.documentType}</span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className={`rounded-lg p-4 ${selectedCompliance.status === 'EXPIRED' ? 'bg-red-50 border border-red-200' : selectedCompliance.status === 'EXPIRING_SOON' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMPLIANCE_STATUS_BADGES[selectedCompliance.status]}`}>
                    {COMPLIANCE_STATUS_LABELS[selectedCompliance.status]}
                  </span>
                  {selectedCompliance.expiryDate && (
                    <span className={`text-xs font-semibold ${daysUntil(selectedCompliance.expiryDate) < 0 ? 'text-red-700' : daysUntil(selectedCompliance.expiryDate) <= 30 ? 'text-yellow-700' : 'text-green-700'}`}>
                      {daysUntil(selectedCompliance.expiryDate) < 0
                        ? `${Math.abs(daysUntil(selectedCompliance.expiryDate))} days overdue`
                        : `${daysUntil(selectedCompliance.expiryDate)} days remaining`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <span className="text-xs text-gray-500 block">Expiry Date</span>
                    <span className="text-xs font-medium text-gray-800">{formatDate(selectedCompliance.expiryDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Last Updated</span>
                    <span className="text-xs font-medium text-gray-800">{formatDate(selectedCompliance.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              {selectedCompliance.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                  <p className={`text-xs rounded-lg p-3 leading-relaxed ${selectedCompliance.status === 'EXPIRED' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                    {selectedCompliance.notes}
                  </p>
                </div>
              )}

              {/* Related items for same entity */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Other Documents for {selectedCompliance.entityName}</h4>
                <div className="space-y-1">
                  {MOCK_COMPLIANCE.filter(c => c.entityId === selectedCompliance.entityId && c.id !== selectedCompliance.id).map(c => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedCompliance(c)}
                    >
                      <span className="text-xs text-gray-700">{c.documentType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMPLIANCE_STATUS_BADGES[c.status]}`}>
                        {COMPLIANCE_STATUS_LABELS[c.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                {selectedCompliance.status === 'EXPIRED' ? 'Renew Document' : 'Update Document'}
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">View History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
