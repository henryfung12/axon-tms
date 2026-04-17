import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

// ─ Types ─
type ELDProvider = 'motive' | 'samsara';
type ActiveTab = 'overview' | 'ifta' | 'hut' | 'cameras' | 'fuel' | 'hos' | 'tolls';

interface VehicleTracking {
  unitNumber: string; type: 'TRUCK' | 'TRAILER'; driverName: string; provider: ELDProvider;
  lat: number; lng: number; city: string; state: string; speed: number; heading: string;
  engineStatus: 'ON' | 'OFF' | 'IDLE'; lastUpdate: string; odometerToday: number;
  fuelLevelPct: number; dtcCodes: number;
}

interface IFTARecord {
  quarter: string; state: string; miles: number; gallons: number; mpg: number; taxRate: number; taxOwed: number; status: 'FILED' | 'PENDING' | 'DUE';
}

interface HUTRecord {
  month: string; state: string; unitNumber: string; miles: number; taxableWeight: number; taxRate: number; taxOwed: number; status: 'PAID' | 'PENDING' | 'OVERDUE'; hutNumber: string;
}

interface CameraEvent {
  id: string; timestamp: string; unitNumber: string; driverName: string; provider: ELDProvider;
  eventType: 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'ROLLING_STOP' | 'DISTRACTED_DRIVING' | 'TAILGATING' | 'COLLISION' | 'LANE_DEPARTURE' | 'DROWSINESS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; location: string; reviewed: boolean; coachable: boolean;
}

interface FuelTransaction {
  id: string; date: string; unitNumber: string; driverName: string; provider: 'motive';
  stationName: string; city: string; state: string; gallons: number; pricePerGallon: number;
  totalCost: number; fuelType: 'DIESEL' | 'DEF'; odometer: number; cardLast4: string;
  flagged: boolean; flagReason: string;
}

interface HOSSnapshot {
  driverId: string; driverName: string; provider: ELDProvider; unitNumber: string;
  currentStatus: 'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY'; hoursAvailable: number;
  drivingUsed: number; onDutyUsed: number; cycleUsed: number; cycleAvailable: number;
  lastStatusChange: string; violationsThisWeek: number;
}

// ─ Mock Data ─
const MOCK_TRACKING: VehicleTracking[] = [
  { unitNumber: 'T-1042', type: 'TRUCK', driverName: 'Marcus Johnson', provider: 'motive', lat: 35.1495, lng: -90.0490, city: 'Memphis', state: 'TN', speed: 62, heading: 'NE', engineStatus: 'ON', lastUpdate: '2026-04-13T12:30:00Z', odometerToday: 284, fuelLevelPct: 68, dtcCodes: 0 },
  { unitNumber: 'T-1038', type: 'TRUCK', driverName: 'Sarah Chen', provider: 'samsara', lat: 32.7767, lng: -96.7970, city: 'Dallas', state: 'TX', speed: 0, heading: 'N', engineStatus: 'IDLE', lastUpdate: '2026-04-13T12:28:00Z', odometerToday: 0, fuelLevelPct: 82, dtcCodes: 0 },
  { unitNumber: 'T-1055', type: 'TRUCK', driverName: 'James Williams', provider: 'motive', lat: 39.7684, lng: -86.1581, city: 'Indianapolis', state: 'IN', speed: 58, heading: 'E', engineStatus: 'ON', lastUpdate: '2026-04-13T12:31:00Z', odometerToday: 196, fuelLevelPct: 45, dtcCodes: 1 },
  { unitNumber: 'T-1061', type: 'TRUCK', driverName: 'Maria Rodriguez', provider: 'samsara', lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA', speed: 0, heading: 'S', engineStatus: 'OFF', lastUpdate: '2026-04-13T12:25:00Z', odometerToday: 0, fuelLevelPct: 91, dtcCodes: 0 },
  { unitNumber: 'T-1070', type: 'TRUCK', driverName: 'Robert Brown', provider: 'motive', lat: 36.1627, lng: -86.7816, city: 'Nashville', state: 'TN', speed: 65, heading: 'N', engineStatus: 'ON', lastUpdate: '2026-04-13T12:32:00Z', odometerToday: 312, fuelLevelPct: 52, dtcCodes: 0 },
  { unitNumber: 'T-1033', type: 'TRUCK', driverName: 'Lisa Nguyen', provider: 'samsara', lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', speed: 0, heading: 'W', engineStatus: 'OFF', lastUpdate: '2026-04-13T12:20:00Z', odometerToday: 0, fuelLevelPct: 74, dtcCodes: 0 },
  { unitNumber: 'T-1029', type: 'TRUCK', driverName: 'David Kim', provider: 'motive', lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', speed: 0, heading: 'N', engineStatus: 'OFF', lastUpdate: '2026-04-13T08:00:00Z', odometerToday: 0, fuelLevelPct: 88, dtcCodes: 0 },
  { unitNumber: 'T-1044', type: 'TRUCK', driverName: 'Emily Taylor', provider: 'samsara', lat: 33.4484, lng: -112.0740, city: 'Phoenix', state: 'AZ', speed: 0, heading: 'E', engineStatus: 'OFF', lastUpdate: '2026-04-13T10:15:00Z', odometerToday: 0, fuelLevelPct: 61, dtcCodes: 0 },
];

const MOCK_IFTA: IFTARecord[] = [
  { quarter: 'Q1 2026', state: 'TN', miles: 18420, gallons: 2740, mpg: 6.72, taxRate: 0.27, taxOwed: 740, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'TX', miles: 14800, gallons: 2190, mpg: 6.76, taxRate: 0.20, taxOwed: 438, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'IL', miles: 12100, gallons: 1810, mpg: 6.69, taxRate: 0.467, taxOwed: 845, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'IN', miles: 9800, gallons: 1460, mpg: 6.71, taxRate: 0.33, taxOwed: 482, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'GA', miles: 8400, gallons: 1250, mpg: 6.72, taxRate: 0.315, taxOwed: 394, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'OH', miles: 7200, gallons: 1070, mpg: 6.73, taxRate: 0.385, taxOwed: 412, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'KY', miles: 6800, gallons: 1010, mpg: 6.73, taxRate: 0.246, taxOwed: 248, status: 'FILED' },
  { quarter: 'Q1 2026', state: 'CO', miles: 5100, gallons: 780, mpg: 6.54, taxRate: 0.22, taxOwed: 172, status: 'FILED' },
  { quarter: 'Q2 2026', state: 'TN', miles: 6200, gallons: 920, mpg: 6.74, taxRate: 0.27, taxOwed: 248, status: 'PENDING' },
  { quarter: 'Q2 2026', state: 'TX', miles: 4900, gallons: 725, mpg: 6.76, taxRate: 0.20, taxOwed: 145, status: 'PENDING' },
  { quarter: 'Q2 2026', state: 'IL', miles: 3800, gallons: 568, mpg: 6.69, taxRate: 0.467, taxOwed: 265, status: 'PENDING' },
  { quarter: 'Q2 2026', state: 'GA', miles: 2900, gallons: 431, mpg: 6.73, taxRate: 0.315, taxOwed: 136, status: 'PENDING' },
];

const MOCK_HUT: HUTRecord[] = [
  { month: 'Mar 2026', state: 'NY', unitNumber: 'T-1042', miles: 820, taxableWeight: 80000, taxRate: 0.045, taxOwed: 37, status: 'PAID', hutNumber: 'NY-HUT-2026-1042' },
  { month: 'Mar 2026', state: 'NY', unitNumber: 'T-1055', miles: 640, taxableWeight: 80000, taxRate: 0.045, taxOwed: 29, status: 'PAID', hutNumber: 'NY-HUT-2026-1055' },
  { month: 'Mar 2026', state: 'NY', unitNumber: 'T-1029', miles: 940, taxableWeight: 80000, taxRate: 0.045, taxOwed: 42, status: 'PAID', hutNumber: 'NY-HUT-2026-1029' },
  { month: 'Mar 2026', state: 'OR', unitNumber: 'T-1033', miles: 1100, taxableWeight: 80000, taxRate: 0.038, taxOwed: 42, status: 'PAID', hutNumber: 'OR-WMT-2026-1033' },
  { month: 'Mar 2026', state: 'OR', unitNumber: 'T-1042', miles: 700, taxableWeight: 80000, taxRate: 0.038, taxOwed: 27, status: 'PAID', hutNumber: 'OR-WMT-2026-1042' },
  { month: 'Mar 2026', state: 'KY', unitNumber: 'T-1042', miles: 1200, taxableWeight: 80000, taxRate: 0.0285, taxOwed: 34, status: 'PAID', hutNumber: 'KY-KIT-2026-1042' },
  { month: 'Mar 2026', state: 'KY', unitNumber: 'T-1070', miles: 1400, taxableWeight: 80000, taxRate: 0.0285, taxOwed: 40, status: 'PAID', hutNumber: 'KY-KIT-2026-1070' },
  { month: 'Mar 2026', state: 'NM', unitNumber: 'T-1044', miles: 680, taxableWeight: 80000, taxRate: 0.021, taxOwed: 14, status: 'PAID', hutNumber: 'NM-WDT-2026-1044' },
  { month: 'Apr 2026', state: 'NY', unitNumber: 'T-1042', miles: 480, taxableWeight: 80000, taxRate: 0.045, taxOwed: 22, status: 'PENDING', hutNumber: '' },
  { month: 'Apr 2026', state: 'NY', unitNumber: 'T-1029', miles: 320, taxableWeight: 80000, taxRate: 0.045, taxOwed: 14, status: 'PENDING', hutNumber: '' },
  { month: 'Apr 2026', state: 'OR', unitNumber: 'T-1033', miles: 600, taxableWeight: 80000, taxRate: 0.038, taxOwed: 23, status: 'PENDING', hutNumber: '' },
  { month: 'Apr 2026', state: 'KY', unitNumber: 'T-1070', miles: 720, taxableWeight: 80000, taxRate: 0.0285, taxOwed: 21, status: 'PENDING', hutNumber: '' },
];

const MOCK_CAMERA_EVENTS: CameraEvent[] = [
  { id: 'cam1', timestamp: '2026-04-13T11:42:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'motive', eventType: 'HARSH_BRAKING', severity: 'MEDIUM', location: 'I-40 EB, Memphis TN', reviewed: false, coachable: true },
  { id: 'cam2', timestamp: '2026-04-12T16:15:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'motive', eventType: 'DISTRACTED_DRIVING', severity: 'HIGH', location: 'I-65 NB, Indianapolis IN', reviewed: false, coachable: true },
  { id: 'cam3', timestamp: '2026-04-12T09:30:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'samsara', eventType: 'TAILGATING', severity: 'MEDIUM', location: 'I-24 WB, Nashville TN', reviewed: true, coachable: true },
  { id: 'cam4', timestamp: '2026-04-11T14:22:00Z', unitNumber: 'T-1038', driverName: 'Sarah Chen', provider: 'samsara', eventType: 'ROLLING_STOP', severity: 'LOW', location: 'FM 1382, Dallas TX', reviewed: true, coachable: false },
  { id: 'cam5', timestamp: '2026-04-11T08:05:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'motive', eventType: 'LANE_DEPARTURE', severity: 'LOW', location: 'I-55 SB, Memphis TN', reviewed: true, coachable: false },
  { id: 'cam6', timestamp: '2026-04-10T17:50:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'motive', eventType: 'HARSH_ACCELERATION', severity: 'LOW', location: 'I-70 WB, Indianapolis IN', reviewed: true, coachable: false },
  { id: 'cam7', timestamp: '2026-04-10T10:12:00Z', unitNumber: 'T-1061', driverName: 'Maria Rodriguez', provider: 'samsara', eventType: 'DROWSINESS', severity: 'CRITICAL', location: 'I-85 SB, Atlanta GA', reviewed: true, coachable: true },
  { id: 'cam8', timestamp: '2026-04-09T22:30:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'samsara', eventType: 'HARSH_BRAKING', severity: 'MEDIUM', location: 'I-65 SB, Nashville TN', reviewed: true, coachable: true },
];

const MOCK_FUEL: FuelTransaction[] = [
  { id: 'f1', date: '2026-04-13T07:15:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'motive', stationName: 'Pilot Travel Center #412', city: 'Memphis', state: 'TN', gallons: 98.4, pricePerGallon: 3.82, totalCost: 375.89, fuelType: 'DIESEL', odometer: 223816, cardLast4: '4421', flagged: false, flagReason: '' },
  { id: 'f2', date: '2026-04-12T18:30:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'motive', stationName: 'Love\'s #508', city: 'Nashville', state: 'TN', gallons: 82.1, pricePerGallon: 3.79, totalCost: 311.16, fuelType: 'DIESEL', odometer: 189388, cardLast4: '4421', flagged: false, flagReason: '' },
  { id: 'f3', date: '2026-04-12T14:45:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'motive', stationName: 'TA #198', city: 'Terre Haute', state: 'IN', gallons: 112.6, pricePerGallon: 3.85, totalCost: 433.51, fuelType: 'DIESEL', odometer: 312188, cardLast4: '4433', flagged: true, flagReason: 'Over 110 gal — exceeds tank capacity alert' },
  { id: 'f4', date: '2026-04-12T06:00:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'motive', stationName: 'Pilot Travel Center #412', city: 'Memphis', state: 'TN', gallons: 12.5, pricePerGallon: 4.22, totalCost: 52.75, fuelType: 'DEF', odometer: 223532, cardLast4: '4421', flagged: false, flagReason: '' },
  { id: 'f5', date: '2026-04-11T15:20:00Z', unitNumber: 'T-1029', driverName: 'David Kim', provider: 'motive', stationName: 'Flying J #742', city: 'Chicago', state: 'IL', gallons: 94.8, pricePerGallon: 3.91, totalCost: 370.67, fuelType: 'DIESEL', odometer: 142506, cardLast4: '4447', flagged: false, flagReason: '' },
  { id: 'f6', date: '2026-04-11T09:10:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'motive', stationName: 'TA #201', city: 'Nashville', state: 'TN', gallons: 76.3, pricePerGallon: 3.84, totalCost: 292.99, fuelType: 'DIESEL', odometer: 189076, cardLast4: '4421', flagged: false, flagReason: '' },
  { id: 'f7', date: '2026-04-10T20:45:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'motive', stationName: 'Pilot #310', city: 'Dayton', state: 'OH', gallons: 88.2, pricePerGallon: 3.78, totalCost: 333.40, fuelType: 'DIESEL', odometer: 311876, cardLast4: '4433', flagged: false, flagReason: '' },
];

const MOCK_HOS: HOSSnapshot[] = [
  { driverId: 'd1', driverName: 'Marcus Johnson', provider: 'motive', unitNumber: 'T-1042', currentStatus: 'DRIVING', hoursAvailable: 6.5, drivingUsed: 4.5, onDutyUsed: 6.0, cycleUsed: 48.5, cycleAvailable: 21.5, lastStatusChange: '2026-04-13T06:00:00Z', violationsThisWeek: 0 },
  { driverId: 'd2', driverName: 'Sarah Chen', provider: 'samsara', unitNumber: 'T-1038', currentStatus: 'ON_DUTY', hoursAvailable: 11.0, drivingUsed: 0, onDutyUsed: 1.0, cycleUsed: 32.0, cycleAvailable: 38.0, lastStatusChange: '2026-04-13T11:30:00Z', violationsThisWeek: 0 },
  { driverId: 'd3', driverName: 'James Williams', provider: 'motive', unitNumber: 'T-1055', currentStatus: 'DRIVING', hoursAvailable: 3.2, drivingUsed: 7.8, onDutyUsed: 9.0, cycleUsed: 56.0, cycleAvailable: 14.0, lastStatusChange: '2026-04-13T04:30:00Z', violationsThisWeek: 0 },
  { driverId: 'd4', driverName: 'Maria Rodriguez', provider: 'samsara', unitNumber: 'T-1061', currentStatus: 'OFF_DUTY', hoursAvailable: 10.5, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 28.0, cycleAvailable: 42.0, lastStatusChange: '2026-04-12T20:00:00Z', violationsThisWeek: 0 },
  { driverId: 'd5', driverName: 'David Kim', provider: 'motive', unitNumber: 'T-1029', currentStatus: 'OFF_DUTY', hoursAvailable: 11.0, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 22.0, cycleAvailable: 48.0, lastStatusChange: '2026-04-12T18:00:00Z', violationsThisWeek: 0 },
  { driverId: 'd6', driverName: 'Emily Taylor', provider: 'samsara', unitNumber: 'T-1044', currentStatus: 'SLEEPER', hoursAvailable: 0, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 44.0, cycleAvailable: 26.0, lastStatusChange: '2026-04-13T02:00:00Z', violationsThisWeek: 0 },
  { driverId: 'd7', driverName: 'Robert Brown', provider: 'motive', unitNumber: 'T-1070', currentStatus: 'DRIVING', hoursAvailable: 8.0, drivingUsed: 3.0, onDutyUsed: 4.0, cycleUsed: 38.0, cycleAvailable: 32.0, lastStatusChange: '2026-04-13T08:30:00Z', violationsThisWeek: 0 },
  { driverId: 'd8', driverName: 'Lisa Nguyen', provider: 'samsara', unitNumber: 'T-1033', currentStatus: 'OFF_DUTY', hoursAvailable: 9.5, drivingUsed: 0, onDutyUsed: 0, cycleUsed: 35.0, cycleAvailable: 35.0, lastStatusChange: '2026-04-12T22:00:00Z', violationsThisWeek: 0 },
];

interface TollTransaction {
  id: string; date: string; unitNumber: string; driverName: string; provider: 'IPASS' | 'EZPASS_NY' | 'EZPASS_NJ' | 'BESTPASS';
  plaza: string; location: string; state: string; amount: number; transponder: string; status: 'POSTED' | 'PENDING' | 'DISPUTED';
}

const MOCK_TOLLS: TollTransaction[] = [
  { id: 'tl1', date: '2026-04-13T08:22:00Z', unitNumber: 'T-1029', driverName: 'David Kim', provider: 'IPASS', plaza: 'I-90 Tollway', location: 'O\'Hare Plaza', state: 'IL', amount: 4.80, transponder: 'IP-44210', status: 'POSTED' },
  { id: 'tl2', date: '2026-04-13T06:15:00Z', unitNumber: 'T-1029', driverName: 'David Kim', provider: 'IPASS', plaza: 'I-88 Reagan Memorial', location: 'York Rd Plaza', state: 'IL', amount: 3.20, transponder: 'IP-44210', status: 'POSTED' },
  { id: 'tl3', date: '2026-04-12T14:30:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'EZPASS_NY', plaza: 'NY Thruway', location: 'Harriman Toll Barrier', state: 'NY', amount: 11.75, transponder: 'EZ-NY-88201', status: 'POSTED' },
  { id: 'tl4', date: '2026-04-12T12:40:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'EZPASS_NY', plaza: 'George Washington Bridge', location: 'GWB Upper Level', state: 'NJ', amount: 16.00, transponder: 'EZ-NY-88201', status: 'POSTED' },
  { id: 'tl5', date: '2026-04-12T09:10:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'EZPASS_NY', plaza: 'NJ Turnpike', location: 'Exit 8A', state: 'NJ', amount: 12.50, transponder: 'EZ-NY-88202', status: 'POSTED' },
  { id: 'tl6', date: '2026-04-11T17:45:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'IPASS', plaza: 'I-294 Tri-State', location: 'Cermak Plaza', state: 'IL', amount: 5.60, transponder: 'IP-44211', status: 'POSTED' },
  { id: 'tl7', date: '2026-04-11T14:20:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'EZPASS_NY', plaza: 'PA Turnpike', location: 'Gateway Toll Plaza', state: 'PA', amount: 42.80, transponder: 'EZ-NY-88202', status: 'POSTED' },
  { id: 'tl8', date: '2026-04-11T11:00:00Z', unitNumber: 'T-1029', driverName: 'David Kim', provider: 'IPASS', plaza: 'I-355 Veterans Memorial', location: 'I-55 Interchange', state: 'IL', amount: 4.00, transponder: 'IP-44210', status: 'POSTED' },
  { id: 'tl9', date: '2026-04-10T16:30:00Z', unitNumber: 'T-1055', driverName: 'James Williams', provider: 'EZPASS_NJ', plaza: 'NJ Turnpike', location: 'Exit 14C (Holland Tunnel)', state: 'NJ', amount: 16.00, transponder: 'EZ-NY-88201', status: 'PENDING' },
  { id: 'tl10', date: '2026-04-10T08:00:00Z', unitNumber: 'T-1070', driverName: 'Robert Brown', provider: 'IPASS', plaza: 'I-90 Tollway', location: 'Belvidere Oasis', state: 'IL', amount: 3.60, transponder: 'IP-44211', status: 'POSTED' },
  { id: 'tl11', date: '2026-04-09T21:15:00Z', unitNumber: 'T-1042', driverName: 'Marcus Johnson', provider: 'EZPASS_NY', plaza: 'NY Thruway', location: 'Spring Valley Toll', state: 'NY', amount: 8.25, transponder: 'EZ-NY-88202', status: 'POSTED' },
  { id: 'tl12', date: '2026-04-09T13:00:00Z', unitNumber: 'T-1033', driverName: 'Lisa Nguyen', provider: 'IPASS', plaza: 'I-90 Tollway', location: 'O\'Hare Plaza', state: 'IL', amount: 4.80, transponder: 'IP-44212', status: 'DISPUTED' },
];

const TOLL_PROVIDER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  IPASS: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'I-PASS' },
  EZPASS_NY: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'E-ZPass NY' },
  EZPASS_NJ: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'E-ZPass NJ' },
  BESTPASS: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Bestpass' },
};

// ─ Helpers ─
const PROVIDER_COLORS = { motive: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', label: 'Motive' }, samsara: { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500', label: 'Samsara' } };
const ENGINE_STATUS = { ON: 'text-green-600', OFF: 'text-gray-400', IDLE: 'text-yellow-600' };
const HOS_STATUS_DOT: Record<string, string> = { DRIVING: 'bg-green-500', ON_DUTY: 'bg-blue-500', SLEEPER: 'bg-yellow-500', OFF_DUTY: 'bg-gray-400' };
const HOS_STATUS_LABEL: Record<string, string> = { DRIVING: 'Driving', ON_DUTY: 'On Duty', SLEEPER: 'Sleeper', OFF_DUTY: 'Off Duty' };
const CAMERA_SEVERITY: Record<string, string> = { CRITICAL: 'bg-red-600 text-white', HIGH: 'bg-red-100 text-red-800', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-gray-100 text-gray-600' };
const CAMERA_TYPE_LABELS: Record<string, string> = { HARSH_BRAKING: 'Harsh braking', HARSH_ACCELERATION: 'Harsh accel', ROLLING_STOP: 'Rolling stop', DISTRACTED_DRIVING: 'Distracted driving', TAILGATING: 'Tailgating', COLLISION: 'Collision', LANE_DEPARTURE: 'Lane departure', DROWSINESS: 'Drowsiness' };

function formatDateTime(d: string): string { const dt = new Date(d); return `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; }
function formatTime(d: string): string { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

// ─ Component ─
export function FleetIntelligencePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [providerFilter, setProviderFilter] = useState<'all' | ELDProvider>('all');
  const [cameraReviewFilter, setCameraReviewFilter] = useState<'all' | 'unreviewed' | 'coachable'>('all');

  // IFTA/HUT date range
  type PeriodType = 'monthly' | 'quarterly' | 'yearly';
  const [iftaPeriodType, setIftaPeriodType] = useState<PeriodType>('quarterly');
  const [iftaYear, setIftaYear] = useState('2026');
  const [iftaStartMonth, setIftaStartMonth] = useState('01');
  const [iftaEndMonth, setIftaEndMonth] = useState('12');
  const [iftaQuarter, setIftaQuarter] = useState('Q1');

  const [hutPeriodType, setHutPeriodType] = useState<PeriodType>('monthly');
  const [hutYear, setHutYear] = useState('2026');
  const [hutStartMonth, setHutStartMonth] = useState('01');
  const [hutEndMonth, setHutEndMonth] = useState('12');
  const [hutQuarter, setHutQuarter] = useState('Q1');

  const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const MONTH_NAMES: Record<string, string> = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' };
  const QUARTER_MONTHS: Record<string, string[]> = { Q1: ['01','02','03'], Q2: ['04','05','06'], Q3: ['07','08','09'], Q4: ['10','11','12'] };
  const YEARS = ['2024','2025','2026','2027'];

  const getMonthRange = (periodType: PeriodType, year: string, startM: string, endM: string, quarter: string): string[] => {
    if (periodType === 'yearly') return MONTHS.map(m => `${MONTH_NAMES[m]} ${year}`);
    if (periodType === 'quarterly') return QUARTER_MONTHS[quarter].map(m => `${MONTH_NAMES[m]} ${year}`);
    const si = MONTHS.indexOf(startM); const ei = MONTHS.indexOf(endM);
    return MONTHS.slice(si, ei + 1).map(m => `${MONTH_NAMES[m]} ${year}`);
  };

  const getQuarterRange = (periodType: PeriodType, year: string, startM: string, endM: string, quarter: string): string[] => {
    if (periodType === 'yearly') return ['Q1','Q2','Q3','Q4'].map(q => `${q} ${year}`);
    if (periodType === 'quarterly') return [`${quarter} ${year}`];
    const si = MONTHS.indexOf(startM); const ei = MONTHS.indexOf(endM);
    const qs = new Set<string>();
    for (let i = si; i <= ei; i++) { if (i < 3) qs.add('Q1'); else if (i < 6) qs.add('Q2'); else if (i < 9) qs.add('Q3'); else qs.add('Q4'); }
    return Array.from(qs).map(q => `${q} ${year}`);
  };

  const filteredIFTA = useMemo(() => {
    const validQuarters = getQuarterRange(iftaPeriodType, iftaYear, iftaStartMonth, iftaEndMonth, iftaQuarter);
    return MOCK_IFTA.filter(r => validQuarters.includes(r.quarter));
  }, [iftaPeriodType, iftaYear, iftaStartMonth, iftaEndMonth, iftaQuarter]);

  const filteredHUT = useMemo(() => {
    const validMonths = getMonthRange(hutPeriodType, hutYear, hutStartMonth, hutEndMonth, hutQuarter);
    return MOCK_HUT.filter(r => validMonths.includes(r.month));
  }, [hutPeriodType, hutYear, hutStartMonth, hutEndMonth, hutQuarter]);
  const [hutNumbers, setHutNumbers] = useState<Record<number, string>>(
    Object.fromEntries(MOCK_HUT.map((r, i) => [i, r.hutNumber]))
  );

  const updateHutNumber = (index: number, value: string) => {
    setHutNumbers(prev => ({ ...prev, [index]: value }));
  };

  const exportIFTA = () => {
    const data = filteredIFTA.map(r => ({
      'Quarter': r.quarter, 'State': r.state, 'Miles': r.miles, 'Gallons': r.gallons,
      'MPG': r.mpg, 'Tax Rate ($/gal)': r.taxRate, 'Tax Owed': r.taxOwed, 'Status': r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
    data.forEach((_, i) => {
      const taxCell = XLSX.utils.encode_cell({ c: 6, r: i + 1 });
      if (ws[taxCell]) ws[taxCell].z = '$#,##0';
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IFTA Report');
    XLSX.writeFile(wb, `AXON_TMS_IFTA_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportHUT = () => {
    const data = filteredHUT.map(r => {
      const origIdx = MOCK_HUT.indexOf(r);
      return {
        'Month': r.month, 'State': r.state, 'Unit': r.unitNumber, 'HUT Permit # (from Assets)': r.hutNumber,
        'Filing Receipt #': hutNumbers[origIdx] || '', 'Miles': r.miles,
        'Taxable Weight (lbs)': r.taxableWeight, 'Tax Rate ($/mi)': r.taxRate,
        'Tax Owed': r.taxOwed, 'Status': r.status,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 24 }, { wch: 20 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
    data.forEach((_, i) => {
      const taxCell = XLSX.utils.encode_cell({ c: 8, r: i + 1 });
      if (ws[taxCell]) ws[taxCell].z = '$#,##0';
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HUT Report');
    XLSX.writeFile(wb, `AXON_TMS_HUT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filterByProvider = <T extends { provider: ELDProvider }>(items: T[]) =>
    providerFilter === 'all' ? items : items.filter(i => i.provider === providerFilter);

  const tracking = filterByProvider(MOCK_TRACKING);
  const cameraEvents = useMemo(() => {
    let items = filterByProvider(MOCK_CAMERA_EVENTS);
    if (cameraReviewFilter === 'unreviewed') items = items.filter(e => !e.reviewed);
    if (cameraReviewFilter === 'coachable') items = items.filter(e => e.coachable);
    return items;
  }, [providerFilter, cameraReviewFilter]);

  const stats = useMemo(() => ({
    totalVehicles: MOCK_TRACKING.length,
    moving: MOCK_TRACKING.filter(v => v.speed > 0).length,
    idle: MOCK_TRACKING.filter(v => v.engineStatus === 'IDLE').length,
    dtcAlerts: MOCK_TRACKING.filter(v => v.dtcCodes > 0).length,
    unreviewedCamera: MOCK_CAMERA_EVENTS.filter(e => !e.reviewed).length,
    criticalCamera: MOCK_CAMERA_EVENTS.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length,
    fuelSpend7d: MOCK_FUEL.reduce((s, f) => s + f.totalCost, 0),
    flaggedFuel: MOCK_FUEL.filter(f => f.flagged).length,
    iftaPendingTax: MOCK_IFTA.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.taxOwed, 0),
    hutPendingTax: MOCK_HUT.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.taxOwed, 0),
    motiveCount: MOCK_TRACKING.filter(v => v.provider === 'motive').length,
    samsaraCount: MOCK_TRACKING.filter(v => v.provider === 'samsara').length,
  }), []);

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'ifta', label: 'IFTA' }, { id: 'hut', label: 'HUT' },
    { id: 'cameras', label: `Cameras (${stats.unreviewedCamera})` }, { id: 'fuel', label: 'Fuel Cards' }, { id: 'hos', label: 'HOS' },
    { id: 'tolls', label: 'Tolls' },
  ];

  return (
    <div>
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Fleet Intelligence</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-xs font-medium text-orange-800">Motive ({stats.motiveCount})</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-xs font-medium text-teal-800">Samsara ({stats.samsaraCount})</span>
            </div>
          </div>
        </div>
        <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
          {(['all', 'motive', 'samsara'] as const).map(p => (
            <button key={p} onClick={() => setProviderFilter(p)} className={`px-3 py-1.5 font-medium capitalize ${providerFilter === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {p === 'all' ? 'All Providers' : PROVIDER_COLORS[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* ─ Summary Cards ─ */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Fleet Status</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalVehicles}</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            <span className="text-green-600">{stats.moving} moving</span><span className="text-gray-300">·</span>
            <span className="text-yellow-600">{stats.idle} idle</span>
            {stats.dtcAlerts > 0 && <><span className="text-gray-300">·</span><span className="text-red-500">{stats.dtcAlerts} DTC</span></>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Camera Events</p>
          <p className={`text-xl font-bold ${stats.unreviewedCamera > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.unreviewedCamera}</p>
          <p className="text-xs mt-1.5">{stats.criticalCamera > 0 ? <span className="text-red-500">{stats.criticalCamera} high/critical</span> : <span className="text-green-600">No critical events</span>}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Fuel Spend (7d)</p>
          <p className="text-xl font-bold text-gray-900">${stats.fuelSpend7d.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="text-xs mt-1.5">{stats.flaggedFuel > 0 ? <span className="text-red-500">{stats.flaggedFuel} flagged txn</span> : <span className="text-green-600">No flags</span>}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">IFTA Pending</p>
          <p className="text-xl font-bold text-orange-600">${stats.iftaPendingTax.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1.5">Q2 2026 accrual</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">HUT Pending</p>
          <p className="text-xl font-bold text-orange-600">${stats.hutPendingTax}</p>
          <p className="text-xs text-gray-400 mt-1.5">Apr 2026 accrual</p>
        </div>
      </div>

      {/* ─ Tabs ─ */}
      <div className="flex gap-1 mb-4">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1.5 text-xs rounded font-medium transition-colors ${activeTab === tab.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─ Overview Tab ─ */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Speed</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Engine</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles Today</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Fuel %</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">DTC</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {tracking.map(v => (
                  <tr key={v.unitNumber} className={`border-b border-gray-100 hover:bg-gray-50 ${v.dtcCodes > 0 ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`}>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{v.unitNumber}</td>
                    <td className="px-3 py-2.5 text-gray-700">{v.driverName}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER_COLORS[v.provider].bg} ${PROVIDER_COLORS[v.provider].text}`}>{PROVIDER_COLORS[v.provider].label}</span></td>
                    <td className="px-3 py-2.5 text-gray-600">{v.city}, {v.state}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{v.speed > 0 ? `${v.speed} mph` : '—'}</td>
                    <td className={`px-3 py-2.5 font-medium ${ENGINE_STATUS[v.engineStatus]}`}>{v.engineStatus === 'ON' ? 'Running' : v.engineStatus === 'IDLE' ? 'Idle' : 'Off'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{v.odometerToday > 0 ? `${v.odometerToday} mi` : '—'}</td>
                    <td className="px-3 py-2.5 text-right"><span className={`font-medium ${v.fuelLevelPct < 25 ? 'text-red-600' : v.fuelLevelPct < 50 ? 'text-yellow-600' : 'text-gray-700'}`}>{v.fuelLevelPct}%</span></td>
                    <td className="px-3 py-2.5">{v.dtcCodes > 0 ? <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">{v.dtcCodes} code{v.dtcCodes > 1 ? 's' : ''}</span> : <span className="text-green-600">Clear</span>}</td>
                    <td className="px-3 py-2.5 text-gray-500">{formatTime(v.lastUpdate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─ IFTA Tab ─ */}
      {activeTab === 'ifta' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">IFTA Account: <span className="font-mono font-semibold text-blue-700">IFTA-TN-62441</span> — mileage and fuel tax by state, sourced from ELD data (pulled from Assets)</p>
            <button onClick={exportIFTA} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">â¬‡ Export IFTA to Excel</button>
          </div>
          <div className="flex items-center gap-2 mb-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-500 mr-1">Period:</span>
            <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
              {(['monthly', 'quarterly', 'yearly'] as PeriodType[]).map(p => (
                <button key={p} onClick={() => setIftaPeriodType(p)} className={`px-3 py-1 font-medium capitalize ${iftaPeriodType === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
            </div>
            <select value={iftaYear} onChange={e => setIftaYear(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {iftaPeriodType === 'quarterly' && (
              <select value={iftaQuarter} onChange={e => setIftaQuarter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            )}
            {iftaPeriodType === 'monthly' && (
              <>
                <select value={iftaStartMonth} onChange={e => setIftaStartMonth(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {MONTHS.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
                </select>
                <span className="text-xs text-gray-400">to</span>
                <select value={iftaEndMonth} onChange={e => setIftaEndMonth(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {MONTHS.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
                </select>
              </>
            )}
            <span className="text-xs text-gray-400 ml-2">{filteredIFTA.length} records</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Quarter</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">State</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Gallons</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">MPG</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Tax Rate</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Tax Owed</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {filteredIFTA.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${r.status === 'DUE' ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{r.quarter}</td><td className="px-3 py-2.5 text-gray-700">{r.state}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{r.miles.toLocaleString()}</td><td className="px-3 py-2.5 text-right text-gray-700">{r.gallons.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{r.mpg.toFixed(2)}</td><td className="px-3 py-2.5 text-right text-gray-600">${r.taxRate.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">${r.taxOwed.toLocaleString()}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'FILED' ? 'bg-green-100 text-green-800' : r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
            <span><strong className="text-gray-800">Total Miles:</strong> {filteredIFTA.reduce((s, r) => s + r.miles, 0).toLocaleString()}</span>
            <span><strong className="text-gray-800">Total Tax:</strong> ${filteredIFTA.reduce((s, r) => s + r.taxOwed, 0).toLocaleString()}</span>
            <span><strong className="text-gray-800">Pending:</strong> <span className="text-yellow-600">${filteredIFTA.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.taxOwed, 0).toLocaleString()}</span></span>
          </div>
        </div>
        </>
      )}

      {/* ─ HUT Tab ─ */}
      {activeTab === 'hut' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">Highway Use Tax by vehicle — HUT permit numbers pulled from Assets. Enter receipt # after filing.</p>
            <button onClick={exportHUT} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">â¬‡ Export HUT to Excel</button>
          </div>
          <div className="flex items-center gap-2 mb-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-500 mr-1">Period:</span>
            <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
              {(['monthly', 'quarterly', 'yearly'] as PeriodType[]).map(p => (
                <button key={p} onClick={() => setHutPeriodType(p)} className={`px-3 py-1 font-medium capitalize ${hutPeriodType === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
            </div>
            <select value={hutYear} onChange={e => setHutYear(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {hutPeriodType === 'quarterly' && (
              <select value={hutQuarter} onChange={e => setHutQuarter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            )}
            {hutPeriodType === 'monthly' && (
              <>
                <select value={hutStartMonth} onChange={e => setHutStartMonth(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {MONTHS.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
                </select>
                <span className="text-xs text-gray-400">to</span>
                <select value={hutEndMonth} onChange={e => setHutEndMonth(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {MONTHS.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
                </select>
              </>
            )}
            <span className="text-xs text-gray-400 ml-2">{filteredHUT.length} records</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Month</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">State</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">HUT Permit # (from Assets)</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Filing Receipt #</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Miles</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Taxable Weight</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Tax Rate</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Tax Owed</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {filteredHUT.map((r) => {
                  const origIdx = MOCK_HUT.indexOf(r);
                  return (
                  <tr key={origIdx} className={`border-b border-gray-100 hover:bg-gray-50 ${r.status === 'OVERDUE' ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{r.month}</td>
                    <td className="px-3 py-2.5 text-gray-700">{r.state}</td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{r.unitNumber}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-purple-700">{r.hutNumber || <span className="text-gray-400 italic">Set in Assets</span>}</td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={hutNumbers[origIdx] || ''}
                        onChange={e => updateHutNumber(origIdx, e.target.value)}
                        placeholder={r.status === 'PENDING' ? 'Enter after filing' : 'Receipt #'}
                        className={`w-full border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 ${hutNumbers[origIdx] ? 'border-gray-300 text-gray-800 bg-white' : 'border-dashed border-gray-300 text-gray-400 bg-gray-50'}`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{r.miles.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{r.taxableWeight.toLocaleString()} lbs</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">${r.taxRate.toFixed(4)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">${r.taxOwed}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'PAID' ? 'bg-green-100 text-green-800' : r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
            <span><strong className="text-gray-800">Total Tax:</strong> ${filteredHUT.reduce((s, r) => s + r.taxOwed, 0)}</span>
            <span><strong className="text-gray-800">Pending:</strong> <span className="text-yellow-600">${filteredHUT.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.taxOwed, 0)}</span></span>
            <span><strong className="text-gray-800">Records:</strong> {filteredHUT.length}</span>
          </div>
        </div>
        </>
      )}

      {/* ─ Cameras Tab ─ */}
      {activeTab === 'cameras' && (
        <>
          <div className="flex gap-1 mb-3">
            {(['all', 'unreviewed', 'coachable'] as const).map(f => (
              <button key={f} onClick={() => setCameraReviewFilter(f)} className={`px-3 py-1 text-xs rounded font-medium transition-colors capitalize ${cameraReviewFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Time</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Event</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Severity</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Reviewed</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Coachable</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Action</th>
                </tr></thead>
                <tbody>
                  {cameraEvents.map(e => (
                    <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${e.severity === 'CRITICAL' ? 'bg-red-50 border-l-4 border-l-red-500' : e.severity === 'HIGH' && !e.reviewed ? 'bg-red-50 border-l-4 border-l-red-300' : !e.reviewed ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                      <td className="px-3 py-2.5 font-semibold text-blue-600">{e.unitNumber}</td>
                      <td className="px-3 py-2.5 text-gray-700">{e.driverName}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER_COLORS[e.provider].bg} ${PROVIDER_COLORS[e.provider].text}`}>{PROVIDER_COLORS[e.provider].label}</span></td>
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
              <span><strong className="text-gray-800">Total:</strong> {cameraEvents.length}</span>
              <span><strong className="text-gray-800">Unreviewed:</strong> <span className="text-yellow-600">{cameraEvents.filter(e => !e.reviewed).length}</span></span>
              <span><strong className="text-gray-800">Coachable:</strong> {cameraEvents.filter(e => e.coachable).length}</span>
            </div>
          </div>
        </>
      )}

      {/* ─ Fuel Cards Tab ─ */}
      {activeTab === 'fuel' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Station</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Gallons</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">$/Gal</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Total</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Card</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Flag</th>
              </tr></thead>
              <tbody>
                {MOCK_FUEL.map(f => (
                  <tr key={f.id} className={`border-b border-gray-100 hover:bg-gray-50 ${f.flagged ? 'bg-red-50 border-l-4 border-l-red-400' : ''}`}>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDateTime(f.date)}</td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{f.unitNumber}</td>
                    <td className="px-3 py-2.5 text-gray-700">{f.driverName}</td>
                    <td className="px-3 py-2.5 text-gray-700">{f.stationName}</td>
                    <td className="px-3 py-2.5 text-gray-600">{f.city}, {f.state}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.fuelType === 'DIESEL' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'}`}>{f.fuelType}</span></td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{f.gallons.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">${f.pricePerGallon.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">${f.totalCost.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono">•••• {f.cardLast4}</td>
                    <td className="px-3 py-2.5">{f.flagged ? <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium" title={f.flagReason}>Flagged</span> : <span className="text-green-600">OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
            <span><strong className="text-gray-800">Total Spend:</strong> ${MOCK_FUEL.reduce((s, f) => s + f.totalCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span><strong className="text-gray-800">Total Gallons:</strong> {MOCK_FUEL.reduce((s, f) => s + f.gallons, 0).toFixed(1)}</span>
            <span><strong className="text-gray-800">Avg $/Gal:</strong> ${(MOCK_FUEL.filter(f => f.fuelType === 'DIESEL').reduce((s, f) => s + f.pricePerGallon, 0) / MOCK_FUEL.filter(f => f.fuelType === 'DIESEL').length).toFixed(2)}</span>
            <span><strong className="text-gray-800">Flagged:</strong> <span className={MOCK_FUEL.filter(f => f.flagged).length > 0 ? 'text-red-600' : ''}>{MOCK_FUEL.filter(f => f.flagged).length}</span></span>
          </div>
        </div>
      )}

      {/* ─ HOS Tab ─ */}
      {activeTab === 'hos' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Driving Left</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Driving Used</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">On-Duty Used</th><th className="text-right px-3 py-2.5 font-medium text-gray-500">Cycle Used</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Cycle Left</th><th className="text-left px-3 py-2.5 font-medium text-gray-500">Violations</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Change</th>
              </tr></thead>
              <tbody>
                {filterByProvider(MOCK_HOS).map(h => (
                  <tr key={h.driverId} className={`border-b border-gray-100 hover:bg-gray-50 ${h.hoursAvailable <= 2 && h.currentStatus === 'DRIVING' ? 'bg-red-50 border-l-4 border-l-red-400' : h.hoursAvailable <= 4 && h.currentStatus === 'DRIVING' ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{h.driverName}</td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{h.unitNumber}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER_COLORS[h.provider].bg} ${PROVIDER_COLORS[h.provider].text}`}>{PROVIDER_COLORS[h.provider].label}</span></td>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${HOS_STATUS_DOT[h.currentStatus]}`} /><span className="text-gray-700">{HOS_STATUS_LABEL[h.currentStatus]}</span></div></td>
                    <td className={`px-3 py-2.5 text-right font-medium ${h.hoursAvailable <= 2 ? 'text-red-600' : h.hoursAvailable <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>{h.hoursAvailable}h</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{h.drivingUsed}h</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{h.onDutyUsed}h</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{h.cycleUsed}h</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${h.cycleAvailable <= 10 ? 'text-red-600' : 'text-gray-700'}`}>{h.cycleAvailable}h</td>
                    <td className="px-3 py-2.5">{h.violationsThisWeek > 0 ? <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">{h.violationsThisWeek}</span> : <span className="text-green-600">0</span>}</td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDateTime(h.lastStatusChange)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─ Tolls Tab ─ */}
      {activeTab === 'tolls' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">Toll transactions synced from I-PASS, E-ZPass NY, and connected toll providers</p>
            <button onClick={() => {
              const data = MOCK_TOLLS.map(t => ({ 'Date': new Date(t.date).toLocaleDateString(), 'Unit': t.unitNumber, 'Driver': t.driverName, 'Provider': TOLL_PROVIDER_BADGES[t.provider].label, 'Plaza': t.plaza, 'Location': t.location, 'State': t.state, 'Amount': t.amount, 'Transponder': t.transponder, 'Status': t.status }));
              const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Tolls');
              XLSX.writeFile(wb, `AXON_TMS_Tolls_${new Date().toISOString().split('T')[0]}.xlsx`);
            }} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">â¬‡ Export Tolls to Excel</button>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Total Tolls (7d)</p>
              <p className="text-lg font-bold text-gray-900">${MOCK_TOLLS.reduce((s, t) => s + t.amount, 0).toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Transactions</p>
              <p className="text-lg font-bold text-gray-900">{MOCK_TOLLS.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">I-PASS</p>
              <p className="text-lg font-bold text-purple-600">${MOCK_TOLLS.filter(t => t.provider === 'IPASS').reduce((s, t) => s + t.amount, 0).toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">E-ZPass</p>
              <p className="text-lg font-bold text-indigo-600">${MOCK_TOLLS.filter(t => t.provider.startsWith('EZPASS')).reduce((s, t) => s + t.amount, 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Driver</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Provider</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Plaza / Road</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Location</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">State</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Transponder</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                </tr></thead>
                <tbody>
                  {MOCK_TOLLS.map(t => (
                    <tr key={t.id} className={`border-b border-gray-100 hover:bg-gray-50 ${t.status === 'DISPUTED' ? 'bg-red-50 border-l-4 border-l-red-400' : t.status === 'PENDING' ? 'bg-yellow-50 border-l-4 border-l-yellow-300' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDateTime(t.date)}</td>
                      <td className="px-3 py-2.5 font-semibold text-blue-600">{t.unitNumber}</td>
                      <td className="px-3 py-2.5 text-gray-700">{t.driverName}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TOLL_PROVIDER_BADGES[t.provider].bg} ${TOLL_PROVIDER_BADGES[t.provider].text}`}>{TOLL_PROVIDER_BADGES[t.provider].label}</span></td>
                      <td className="px-3 py-2.5 text-gray-700">{t.plaza}</td>
                      <td className="px-3 py-2.5 text-gray-600">{t.location}</td>
                      <td className="px-3 py-2.5 text-gray-600">{t.state}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-900">${t.amount.toFixed(2)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{t.transponder}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'POSTED' ? 'bg-green-100 text-green-800' : t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><strong className="text-gray-800">Total:</strong> ${MOCK_TOLLS.reduce((s, t) => s + t.amount, 0).toFixed(2)}</span>
              <span><strong className="text-gray-800">Posted:</strong> {MOCK_TOLLS.filter(t => t.status === 'POSTED').length}</span>
              <span><strong className="text-gray-800">Pending:</strong> <span className="text-yellow-600">{MOCK_TOLLS.filter(t => t.status === 'PENDING').length}</span></span>
              <span><strong className="text-gray-800">Disputed:</strong> <span className="text-red-600">{MOCK_TOLLS.filter(t => t.status === 'DISPUTED').length}</span></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
