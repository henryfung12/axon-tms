import { useState, useMemo } from 'react';

// ─ Types ─
interface Asset {
  id: string;
  type: 'TRUCK' | 'TRAILER';
  unitNumber: string;
  status: 'ACTIVE' | 'IN_SHOP' | 'OUT_OF_SERVICE' | 'AVAILABLE';
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  licenseState: string;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  currentCity: string;
  currentState: string;
  mileage: number;
  fuelType?: string;
  capacity?: string;
  // Ownership
  ownershipType: 'OWN' | 'LEASE' | 'RENTAL';
  ownershipCompany: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyPayment: number;
  // Insurance Cards
  insuranceCards: { id: string; state: string; policyNumber: string; carrier: string; effectiveDate: string; expirationDate: string; vinMatched: boolean; fileName: string }[];
  // Registration Cards
  registrationCards: { id: string; state: string; plateNumber: string; vin: string; year: number; make: string; expiry: string; vinMatched: boolean; fileName: string }[];
  lastServiceDate: string;
  nextServiceDue: string;
  nextServiceMiles: number;
  insuranceExpiry: string;
  registrationExpiry: string;
  inspectionExpiry: string;
  iftaNumber: string;
  hutPermits: { state: string; permitNumber: string; expiryDate: string }[];
  // ELD Integration
  eldProvider: 'motive' | 'samsara' | null;
  eldConnected: boolean;
  eldLastPing: string | null;
  gpsSpeed: number;
  gpsHeading: string;
  engineStatus: 'ON' | 'OFF' | 'IDLE' | null;
  fuelLevelPct: number | null;
  odometerToday: number;
  dtcCodes: { code: string; description: string; severity: 'CRITICAL' | 'WARNING' | 'INFO' }[];
  // Toll Tags
  tollTags: { provider: string; tagId: string; accountNumber: string; status: 'ACTIVE' | 'INACTIVE' }[];
  notes: string;
}

// ─ Mock Data ─
const MOCK_TRUCKS: Asset[] = [
  { id: 't1', type: 'TRUCK', unitNumber: 'T-1029', status: 'ACTIVE', make: 'Freightliner', model: 'Cascadia', year: 2023, vin: '3AKJGLDR5NSLA1029', licensePlate: 'IL-T4821', licenseState: 'IL', assignedDriverId: 'd5', assignedDriverName: 'David Kim', currentCity: 'Chicago', currentState: 'IL', mileage: 142800, fuelType: 'Diesel', ownershipType: 'OWN', ownershipCompany: '', leaseStartDate: '', leaseEndDate: '', monthlyPayment: 0, insuranceCards: [{ id: 'ic1', state: 'IL', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'IL_Insurance_T1029.pdf' }], registrationCards: [{ id: 'rc1', state: 'IL', plateNumber: 'IL-T4821', vin: '3AKJGLDR5NSLA1029', year: 2023, make: 'Freightliner', expiry: '2026-09-30', vinMatched: true, fileName: 'Reg_IL_T1029.pdf' }],  lastServiceDate: '2026-03-15', nextServiceDue: '2026-05-15', nextServiceMiles: 155000, insuranceExpiry: '2026-12-31', registrationExpiry: '2027-03-01', inspectionExpiry: '2026-09-15', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1029', expiryDate: '2026-12-31' }, { state: 'OR', permitNumber: 'OR-WMT-2026-1029', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1029', expiryDate: '2026-12-31' }], eldProvider: 'motive', eldConnected: true, eldLastPing: '2026-04-13T08:00:00Z', gpsSpeed: 0, gpsHeading: 'N', engineStatus: 'OFF', fuelLevelPct: 88, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'I-PASS', tagId: 'IP-44210', accountNumber: 'IPASS-GX-001', status: 'ACTIVE' }, { provider: 'E-ZPass NY', tagId: 'EZ-NY-88203', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'New engine ECM update completed' },
  { id: 't2', type: 'TRUCK', unitNumber: 'T-1033', status: 'ACTIVE', make: 'Kenworth', model: 'T680', year: 2022, vin: '1XKYD49X5NJ331033', licensePlate: 'CO-T9102', licenseState: 'CO', assignedDriverId: 'd8', assignedDriverName: 'Lisa Nguyen', currentCity: 'Denver', currentState: 'CO', mileage: 198400, fuelType: 'Diesel', ownershipType: 'LEASE', ownershipCompany: 'Penske Truck Leasing', leaseStartDate: '2024-06-01', leaseEndDate: '2027-06-01', monthlyPayment: 2800, insuranceCards: [{ id: 'ic2', state: 'CO', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'CO_Insurance_T1033.pdf' }], registrationCards: [{ id: 'rc2', state: 'CO', plateNumber: 'CO-T9102', vin: '1XKYD49X5NJ331033', year: 2022, make: 'Kenworth', expiry: '2026-08-01', vinMatched: true, fileName: 'Reg_CO_T1033.pdf' }],  lastServiceDate: '2026-03-28', nextServiceDue: '2026-05-28', nextServiceMiles: 210000, insuranceExpiry: '2026-11-15', registrationExpiry: '2026-08-01', inspectionExpiry: '2026-10-01', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1033', expiryDate: '2026-12-31' }, { state: 'OR', permitNumber: 'OR-WMT-2026-1033', expiryDate: '2026-12-31' }, { state: 'NM', permitNumber: 'NM-WDT-2026-1033', expiryDate: '2026-12-31' }], eldProvider: 'samsara', eldConnected: true, eldLastPing: '2026-04-13T12:20:00Z', gpsSpeed: 0, gpsHeading: 'W', engineStatus: 'OFF', fuelLevelPct: 74, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'I-PASS', tagId: 'IP-44212', accountNumber: 'IPASS-GX-001', status: 'ACTIVE' }], notes: '' },
  { id: 't3', type: 'TRUCK', unitNumber: 'T-1038', status: 'ACTIVE', make: 'Peterbilt', model: '579', year: 2024, vin: '1XPBDP9X7ND481038', licensePlate: 'TX-T3344', licenseState: 'TX', assignedDriverId: 'd2', assignedDriverName: 'Sarah Chen', currentCity: 'Dallas', currentState: 'TX', mileage: 67200, fuelType: 'Diesel', ownershipType: 'OWN', ownershipCompany: '', leaseStartDate: '', leaseEndDate: '', monthlyPayment: 0, insuranceCards: [{ id: 'ic3', state: 'TX', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'TX_Insurance_T1038.pdf' }], registrationCards: [{ id: 'rc3', state: 'TX', plateNumber: 'TX-T3344', vin: '1XPBDP9X7ND481038', year: 2024, make: 'Peterbilt', expiry: '2027-05-01', vinMatched: true, fileName: 'Reg_TX_T1038.pdf' }],  lastServiceDate: '2026-04-01', nextServiceDue: '2026-06-01', nextServiceMiles: 80000, insuranceExpiry: '2027-01-31', registrationExpiry: '2027-05-01', inspectionExpiry: '2027-01-15', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1038', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1038', expiryDate: '2026-12-31' }], eldProvider: 'samsara', eldConnected: true, eldLastPing: '2026-04-13T12:28:00Z', gpsSpeed: 0, gpsHeading: 'N', engineStatus: 'IDLE', fuelLevelPct: 82, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'E-ZPass NY', tagId: 'EZ-NY-88204', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'New unit  under warranty' },
  { id: 't4', type: 'TRUCK', unitNumber: 'T-1042', status: 'ACTIVE', make: 'Freightliner', model: 'Cascadia', year: 2022, vin: '3AKJGLDR7NSLA1042', licensePlate: 'TN-T7756', licenseState: 'TN', assignedDriverId: 'd1', assignedDriverName: 'Marcus Johnson', currentCity: 'Memphis', currentState: 'TN', mileage: 224100, fuelType: 'Diesel', ownershipType: 'OWN', ownershipCompany: '', leaseStartDate: '', leaseEndDate: '', monthlyPayment: 0, insuranceCards: [{ id: 'ic4', state: 'TN', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'TN_Insurance_T1042.pdf' }], registrationCards: [{ id: 'rc4', state: 'NY', plateNumber: '14087NF', vin: '3ALACWFC9KDKB9162', year: 2019, make: 'Freightliner', expiry: '2025-06-30', vinMatched: true, fileName: 'Reg_NY_T1042.pdf' }],  lastServiceDate: '2026-03-10', nextServiceDue: '2026-05-10', nextServiceMiles: 237000, insuranceExpiry: '2026-10-31', registrationExpiry: '2026-07-01', inspectionExpiry: '2026-08-20', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1042', expiryDate: '2026-12-31' }, { state: 'OR', permitNumber: 'OR-WMT-2026-1042', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1042', expiryDate: '2026-12-31' }, { state: 'NM', permitNumber: 'NM-WDT-2026-1042', expiryDate: '2026-12-31' }], eldProvider: 'motive', eldConnected: true, eldLastPing: '2026-04-13T12:30:00Z', gpsSpeed: 62, gpsHeading: 'NE', engineStatus: 'ON', fuelLevelPct: 68, odometerToday: 284, dtcCodes: [], tollTags: [{ provider: 'I-PASS', tagId: 'IP-44213', accountNumber: 'IPASS-GX-001', status: 'ACTIVE' }, { provider: 'E-ZPass NY', tagId: 'EZ-NY-88202', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'DPF regen issue  monitor' },
  { id: 't5', type: 'TRUCK', unitNumber: 'T-1044', status: 'ACTIVE', make: 'Volvo', model: 'VNL 860', year: 2023, vin: '4V4NC9EH5PN441044', licensePlate: 'AZ-T5518', licenseState: 'AZ', assignedDriverId: 'd6', assignedDriverName: 'Emily Taylor', currentCity: 'Phoenix', currentState: 'AZ', mileage: 156900, fuelType: 'Diesel', lastServiceDate: '2026-02-20', nextServiceDue: '2026-04-20', nextServiceMiles: 170000, insuranceExpiry: '2026-09-30', registrationExpiry: '2026-12-01', inspectionExpiry: '2026-07-10', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1044', expiryDate: '2026-12-31' }, { state: 'NM', permitNumber: 'NM-WDT-2026-1044', expiryDate: '2026-12-31' }], eldProvider: 'samsara', eldConnected: true, eldLastPing: '2026-04-13T10:15:00Z', gpsSpeed: 0, gpsHeading: 'E', engineStatus: 'OFF', fuelLevelPct: 61, odometerToday: 0, dtcCodes: [], tollTags: [], notes: '' },
  { id: 't6', type: 'TRUCK', unitNumber: 'T-1055', status: 'ACTIVE', make: 'International', model: 'LT', year: 2021, vin: '3HSDJSJR2MN551055', licensePlate: 'IN-T2289', licenseState: 'IN', assignedDriverId: 'd3', assignedDriverName: 'James Williams', currentCity: 'Indianapolis', currentState: 'IN', mileage: 312500, fuelType: 'Diesel', ownershipType: 'LEASE', ownershipCompany: 'Daimler Truck Financial', leaseStartDate: '2025-01-15', leaseEndDate: '2028-01-15', monthlyPayment: 3200, insuranceCards: [{ id: 'ic5', state: 'NY', policyNumber: '73TRB006636', carrier: 'National Liability & Fire Insurance', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'NY_Insurance_T1055.pdf' }], registrationCards: [{ id: 'rc5', state: 'NY', plateNumber: 'NY-T5501', vin: '5PVNJ8JVXL4S76467', year: 2020, make: 'HINO', expiry: '2026-12-31', vinMatched: true, fileName: 'Reg_NY_T1055.pdf' }],  lastServiceDate: '2026-03-22', nextServiceDue: '2026-05-22', nextServiceMiles: 325000, insuranceExpiry: '2026-11-30', registrationExpiry: '2027-02-01', inspectionExpiry: '2026-09-01', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1055', expiryDate: '2026-12-31' }, { state: 'OR', permitNumber: 'OR-WMT-2026-1055', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1055', expiryDate: '2026-12-31' }], eldProvider: 'motive', eldConnected: true, eldLastPing: '2026-04-13T12:31:00Z', gpsSpeed: 58, gpsHeading: 'E', engineStatus: 'ON', fuelLevelPct: 45, odometerToday: 196, dtcCodes: [{ code: 'P0401', description: 'EGR Flow Insufficient', severity: 'WARNING' }], tollTags: [{ provider: 'E-ZPass NY', tagId: 'EZ-NY-88201', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'High mileage  schedule full inspection' },
  { id: 't7', type: 'TRUCK', unitNumber: 'T-1061', status: 'ACTIVE', make: 'Kenworth', model: 'W990', year: 2024, vin: '1XKYD49X1PJ661061', licensePlate: 'GA-T8134', licenseState: 'GA', assignedDriverId: 'd4', assignedDriverName: 'Maria Rodriguez', currentCity: 'Atlanta', currentState: 'GA', mileage: 43600, fuelType: 'Diesel', lastServiceDate: '2026-04-05', nextServiceDue: '2026-06-05', nextServiceMiles: 55000, insuranceExpiry: '2027-03-31', registrationExpiry: '2027-06-01', inspectionExpiry: '2027-04-01', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1061', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1061', expiryDate: '2026-12-31' }], eldProvider: 'samsara', eldConnected: true, eldLastPing: '2026-04-13T12:25:00Z', gpsSpeed: 0, gpsHeading: 'S', engineStatus: 'OFF', fuelLevelPct: 91, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'E-ZPass NY', tagId: 'EZ-NY-88205', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'New unit' },
  { id: 't8', type: 'TRUCK', unitNumber: 'T-1070', status: 'ACTIVE', make: 'Freightliner', model: 'Cascadia', year: 2023, vin: '3AKJGLDR3NSLA1070', licensePlate: 'TN-T6641', licenseState: 'TN', assignedDriverId: 'd7', assignedDriverName: 'Robert Brown', currentCity: 'Nashville', currentState: 'TN', mileage: 189700, fuelType: 'Diesel', ownershipType: 'OWN', ownershipCompany: '', leaseStartDate: '', leaseEndDate: '', monthlyPayment: 0, insuranceCards: [{ id: 'ic6', state: 'FL', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'FL_Insurance_T1070.pdf' }], registrationCards: [{ id: 'rc6', state: 'FL', plateNumber: 'FL-T7001', vin: '3AKJHLDV0JSJW9713', year: 2018, make: 'Freightliner', expiry: '2026-11-15', vinMatched: true, fileName: 'Reg_FL_T1070.pdf' }],  lastServiceDate: '2026-03-18', nextServiceDue: '2026-05-18', nextServiceMiles: 200000, insuranceExpiry: '2027-01-15', registrationExpiry: '2026-09-01', inspectionExpiry: '2026-11-01', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1070', expiryDate: '2026-12-31' }, { state: 'OR', permitNumber: 'OR-WMT-2026-1070', expiryDate: '2026-12-31' }, { state: 'KY', permitNumber: 'KY-KIT-2026-1070', expiryDate: '2026-12-31' }], eldProvider: 'motive', eldConnected: true, eldLastPing: '2026-04-13T12:32:00Z', gpsSpeed: 65, gpsHeading: 'N', engineStatus: 'ON', fuelLevelPct: 52, odometerToday: 312, dtcCodes: [], tollTags: [{ provider: 'I-PASS', tagId: 'IP-44211', accountNumber: 'IPASS-GX-001', status: 'ACTIVE' }, { provider: 'E-ZPass NY', tagId: 'EZ-NY-88206', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: '' },
  { id: 't9', type: 'TRUCK', unitNumber: 'T-1075', status: 'IN_SHOP', make: 'Peterbilt', model: '389', year: 2020, vin: '1XPBDP9X2LD751075', licensePlate: 'OH-T1190', licenseState: 'OH', assignedDriverId: null, assignedDriverName: null, currentCity: 'Columbus', currentState: 'OH', mileage: 385200, fuelType: 'Diesel', lastServiceDate: '2026-04-10', nextServiceDue: '2026-04-25', nextServiceMiles: 385200, insuranceExpiry: '2026-08-31', registrationExpiry: '2026-06-01', inspectionExpiry: '2026-05-15', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1075', expiryDate: '2026-12-31' }], eldProvider: 'motive', eldConnected: false, eldLastPing: '2026-04-08T14:00:00Z', gpsSpeed: 0, gpsHeading: 'N', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'I-PASS', tagId: 'IP-44214', accountNumber: 'IPASS-GX-001', status: 'INACTIVE' }], notes: 'Transmission rebuild in progress' },
  { id: 't10', type: 'TRUCK', unitNumber: 'T-1082', status: 'OUT_OF_SERVICE', make: 'Mack', model: 'Anthem', year: 2019, vin: '1M1AN07Y5KM821082', licensePlate: 'PA-T4402', licenseState: 'PA', assignedDriverId: null, assignedDriverName: null, currentCity: 'Pittsburgh', currentState: 'PA', mileage: 421800, fuelType: 'Diesel', ownershipType: 'RENTAL', ownershipCompany: 'Ryder System Inc.', leaseStartDate: '2026-01-01', leaseEndDate: '2026-12-31', monthlyPayment: 3800, insuranceCards: [{ id: 'ic7', state: 'GA', policyNumber: '73TRB006637', carrier: 'National Indemnity Company of the South', effectiveDate: '2026-03-12', expirationDate: '2027-03-12', vinMatched: true, fileName: 'GA_Insurance_T1082.pdf' }], registrationCards: [{ id: 'rc7', state: 'GA', plateNumber: 'GA-T8201', vin: '3AKJHLDV3JSKC8507', year: 2018, make: 'Freightliner Cascadia', expiry: '2026-10-01', vinMatched: true, fileName: 'Reg_GA_T1082.pdf' }],  lastServiceDate: '2026-02-05', nextServiceDue: '2026-04-05', nextServiceMiles: 421800, insuranceExpiry: '2026-06-30', registrationExpiry: '2026-05-01', inspectionExpiry: '2026-04-01', iftaNumber: 'IFTA-TN-62441', hutPermits: [], eldProvider: 'motive', eldConnected: false, eldLastPing: '2026-04-06T09:00:00Z', gpsSpeed: 0, gpsHeading: 'N', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], tollTags: [], notes: 'Frame damage  pending insurance review for total loss' },
  { id: 't11', type: 'TRUCK', unitNumber: 'T-1088', status: 'AVAILABLE', make: 'Volvo', model: 'VNL 760', year: 2022, vin: '4V4NC9EH3NN881088', licensePlate: 'FL-T7753', licenseState: 'FL', assignedDriverId: null, assignedDriverName: null, currentCity: 'Jacksonville', currentState: 'FL', mileage: 203400, fuelType: 'Diesel', lastServiceDate: '2026-04-08', nextServiceDue: '2026-06-08', nextServiceMiles: 215000, insuranceExpiry: '2027-02-28', registrationExpiry: '2027-04-01', inspectionExpiry: '2026-12-15', iftaNumber: 'IFTA-TN-62441', hutPermits: [{ state: 'NY', permitNumber: 'NY-HUT-2026-1088', expiryDate: '2026-12-31' }], eldProvider: 'samsara', eldConnected: true, eldLastPing: '2026-04-13T11:00:00Z', gpsSpeed: 0, gpsHeading: 'E', engineStatus: 'OFF', fuelLevelPct: 78, odometerToday: 0, dtcCodes: [], tollTags: [{ provider: 'E-ZPass NY', tagId: 'EZ-NY-88207', accountNumber: 'EZNY-GX-001', status: 'ACTIVE' }], notes: 'Ready to assign' },
];

const MOCK_TRAILERS: Asset[] = [
  { id: 'tr1', type: 'TRAILER', unitNumber: 'TR-2190', status: 'ACTIVE', make: 'Great Dane', model: 'Champion SE', year: 2022, vin: '1GRAA0622NB192190', licensePlate: 'IL-R2201', licenseState: 'IL', assignedDriverId: 'd5', assignedDriverName: 'David Kim', currentCity: 'Chicago', currentState: 'IL', mileage: 98000, capacity: "53' Dry Van", lastServiceDate: '2026-03-20', nextServiceDue: '2026-06-20', nextServiceMiles: 110000, insuranceExpiry: '2026-12-31', registrationExpiry: '2027-03-01', inspectionExpiry: '2026-10-01', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: '' },
  { id: 'tr2', type: 'TRAILER', unitNumber: 'TR-2199', status: 'ACTIVE', make: 'Wabash', model: 'DuraPlate', year: 2023, vin: '1JJV532D3NL992199', licensePlate: 'CO-R5510', licenseState: 'CO', assignedDriverId: 'd8', assignedDriverName: 'Lisa Nguyen', currentCity: 'Denver', currentState: 'CO', mileage: 72000, capacity: "53' Dry Van", lastServiceDate: '2026-04-01', nextServiceDue: '2026-07-01', nextServiceMiles: 85000, insuranceExpiry: '2027-01-31', registrationExpiry: '2027-05-01', inspectionExpiry: '2027-01-15', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: '' },
  { id: 'tr3', type: 'TRAILER', unitNumber: 'TR-2201', status: 'ACTIVE', make: 'Utility', model: '3000R', year: 2022, vin: '1UYVS253XNU012201', licensePlate: 'TN-R3340', licenseState: 'TN', assignedDriverId: 'd1', assignedDriverName: 'Marcus Johnson', currentCity: 'Memphis', currentState: 'TN', mileage: 115000, capacity: "53' Reefer", lastServiceDate: '2026-03-12', nextServiceDue: '2026-05-12', nextServiceMiles: 125000, insuranceExpiry: '2026-10-31', registrationExpiry: '2026-07-01', inspectionExpiry: '2026-08-20', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'Reefer unit serviced 3/12' },
  { id: 'tr4', type: 'TRAILER', unitNumber: 'TR-2204', status: 'ACTIVE', make: 'Great Dane', model: 'Everest', year: 2024, vin: '1GRAA0624PB042204', licensePlate: 'TX-R8812', licenseState: 'TX', assignedDriverId: 'd2', assignedDriverName: 'Sarah Chen', currentCity: 'Dallas', currentState: 'TX', mileage: 31000, capacity: "53' Reefer", lastServiceDate: '2026-04-03', nextServiceDue: '2026-07-03', nextServiceMiles: 45000, insuranceExpiry: '2027-02-28', registrationExpiry: '2027-06-01', inspectionExpiry: '2027-03-01', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'New unit' },
  { id: 'tr5', type: 'TRAILER', unitNumber: 'TR-2208', status: 'ACTIVE', make: 'Fontaine', model: 'Infinity', year: 2021, vin: '13N148208M1552208', licensePlate: 'IN-R1107', licenseState: 'IN', assignedDriverId: 'd3', assignedDriverName: 'James Williams', currentCity: 'Indianapolis', currentState: 'IN', mileage: 145000, capacity: "48' Flatbed", lastServiceDate: '2026-03-25', nextServiceDue: '2026-05-25', nextServiceMiles: 155000, insuranceExpiry: '2026-11-30', registrationExpiry: '2027-02-01', inspectionExpiry: '2026-09-01', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'Deck boards replaced 2/26' },
  { id: 'tr6', type: 'TRAILER', unitNumber: 'TR-2215', status: 'ACTIVE', make: 'Wabash', model: 'DuraPlate', year: 2023, vin: '1JJV532D5NL152215', licensePlate: 'GA-R6690', licenseState: 'GA', assignedDriverId: 'd4', assignedDriverName: 'Maria Rodriguez', currentCity: 'Atlanta', currentState: 'GA', mileage: 58000, capacity: "53' Dry Van", lastServiceDate: '2026-04-06', nextServiceDue: '2026-07-06', nextServiceMiles: 70000, insuranceExpiry: '2027-03-31', registrationExpiry: '2027-06-01', inspectionExpiry: '2027-04-01', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: '' },
  { id: 'tr7', type: 'TRAILER', unitNumber: 'TR-2222', status: 'ACTIVE', make: 'Utility', model: '4000D-X', year: 2023, vin: '1UYVS2530NU222222', licensePlate: 'AZ-R4430', licenseState: 'AZ', assignedDriverId: 'd6', assignedDriverName: 'Emily Taylor', currentCity: 'Phoenix', currentState: 'AZ', mileage: 82000, capacity: "53' Dry Van", lastServiceDate: '2026-02-22', nextServiceDue: '2026-04-22', nextServiceMiles: 95000, insuranceExpiry: '2026-09-30', registrationExpiry: '2026-12-01', inspectionExpiry: '2026-07-10', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: '' },
  { id: 'tr8', type: 'TRAILER', unitNumber: 'TR-2231', status: 'ACTIVE', make: 'Great Dane', model: 'Champion CL', year: 2024, vin: '1GRAA0626PB312231', licensePlate: 'TN-R9921', licenseState: 'TN', assignedDriverId: 'd7', assignedDriverName: 'Robert Brown', currentCity: 'Nashville', currentState: 'TN', mileage: 27000, capacity: "53' Dry Van", lastServiceDate: '2026-03-30', nextServiceDue: '2026-06-30', nextServiceMiles: 40000, insuranceExpiry: '2027-01-15', registrationExpiry: '2026-09-01', inspectionExpiry: '2026-11-01', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'New unit' },
  { id: 'tr9', type: 'TRAILER', unitNumber: 'TR-2240', status: 'IN_SHOP', make: 'Vanguard', model: 'VXP', year: 2020, vin: '5V8VS5320LB402240', licensePlate: 'MO-R3315', licenseState: 'MO', assignedDriverId: null, assignedDriverName: null, currentCity: 'Kansas City', currentState: 'MO', mileage: 198000, capacity: "53' Dry Van", lastServiceDate: '2026-04-11', nextServiceDue: '2026-04-25', nextServiceMiles: 198000, insuranceExpiry: '2026-08-31', registrationExpiry: '2026-06-01', inspectionExpiry: '2026-05-15', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'Brake drum replacement  left axle' },
  { id: 'tr10', type: 'TRAILER', unitNumber: 'TR-2245', status: 'AVAILABLE', make: 'Hyundai Translead', model: 'Dry Van', year: 2021, vin: '3H3V532D1ML552245', licensePlate: 'NC-R7702', licenseState: 'NC', assignedDriverId: null, assignedDriverName: null, currentCity: 'Charlotte', currentState: 'NC', mileage: 162000, capacity: "53' Dry Van", lastServiceDate: '2026-04-09', nextServiceDue: '2026-06-09', nextServiceMiles: 175000, insuranceExpiry: '2027-02-28', registrationExpiry: '2027-04-01', inspectionExpiry: '2026-12-15', iftaNumber: '', hutPermits: [], tollTags: [], eldProvider: null, eldConnected: false, eldLastPing: null, gpsSpeed: 0, gpsHeading: '', engineStatus: null, fuelLevelPct: null, odometerToday: 0, dtcCodes: [], notes: 'Ready to assign' },
];

// ─ Helpers ─
const STATUS_BADGES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  IN_SHOP: 'bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
  AVAILABLE: 'bg-blue-100 text-blue-800',
};

const ELD_PROVIDER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  motive: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Motive' },
  samsara: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Samsara' },
};

const ENGINE_COLORS: Record<string, string> = { ON: 'text-green-600', OFF: 'text-gray-400', IDLE: 'text-yellow-600' };
const ENGINE_LABELS: Record<string, string> = { ON: 'Running', OFF: 'Off', IDLE: 'Idle' };

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  IN_SHOP: 'In Shop',
  OUT_OF_SERVICE: 'Out of Service',
  AVAILABLE: 'Available',
};

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-yellow-600 font-medium';
  return 'text-gray-700';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─ Component ─
export function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'TRUCK' | 'TRAILER'>('TRUCK');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPMSchedule, setShowPMSchedule] = useState(false);
  const [showCOI, setShowCOI] = useState(false);
  const [showInsCards, setShowInsCards] = useState(false);
  const [showRegCards, setShowRegCards] = useState(false);
  const [insCardParsing, setInsCardParsing] = useState(false);
  const [parsedInsCards, setParsedInsCards] = useState<any[]>([]);
  const [regCardParsing, setRegCardParsing] = useState(false);
  const [parsedRegCards, setParsedRegCards] = useState<any[]>([]);
  const [showSendToDriver, setShowSendToDriver] = useState(false);
  const [sendDocType, setSendDocType] = useState('');
  const [sortField, setSortField] = useState<'unitNumber' | 'mileage' | 'year' | 'nextServiceDue'>('unitNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const allAssets = activeTab === 'TRUCK' ? MOCK_TRUCKS : MOCK_TRAILERS;

  // Filter & sort
  const filteredAssets = useMemo(() => {
    let result = allAssets.filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.unitNumber.toLowerCase().includes(q) ||
          a.make.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.vin.toLowerCase().includes(q) ||
          a.assignedDriverName?.toLowerCase().includes(q) ||
          a.currentCity.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'unitNumber': cmp = a.unitNumber.localeCompare(b.unitNumber); break;
        case 'mileage': cmp = a.mileage - b.mileage; break;
        case 'year': cmp = a.year - b.year; break;
        case 'nextServiceDue': cmp = new Date(a.nextServiceDue).getTime() - new Date(b.nextServiceDue).getTime(); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allAssets, statusFilter, searchQuery, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: typeof sortField) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  // Stats
  const allTrucks = MOCK_TRUCKS;
  const allTrailers = MOCK_TRAILERS;

  const stats = useMemo(() => {
    const items = activeTab === 'TRUCK' ? allTrucks : allTrailers;
    const expiringInsurance = items.filter(a => daysUntil(a.insuranceExpiry) <= 30).length;
    const expiringRegistration = items.filter(a => daysUntil(a.registrationExpiry) <= 30).length;
    const expiringInspection = items.filter(a => daysUntil(a.inspectionExpiry) <= 30).length;
    const serviceDue = items.filter(a => daysUntil(a.nextServiceDue) <= 14).length;

    return {
      total: items.length,
      active: items.filter(a => a.status === 'ACTIVE').length,
      inShop: items.filter(a => a.status === 'IN_SHOP').length,
      oos: items.filter(a => a.status === 'OUT_OF_SERVICE').length,
      available: items.filter(a => a.status === 'AVAILABLE').length,
      expiringInsurance,
      expiringRegistration,
      expiringInspection,
      serviceDue,
      avgMileage: Math.round(items.reduce((s, a) => s + a.mileage, 0) / items.length),
      eldConnected: items.filter(a => a.eldConnected).length,
      eldDisconnected: items.filter(a => a.eldProvider && !a.eldConnected).length,
      dtcAlerts: items.filter(a => a.dtcCodes.length > 0).length,
      movingNow: items.filter(a => a.gpsSpeed > 0).length,
      lowFuel: items.filter(a => a.fuelLevelPct !== null && a.fuelLevelPct < 25).length,
    };
  }, [activeTab, allTrucks, allTrailers]);

  return (
    <div>
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
          <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
            {(['TRUCK', 'TRAILER'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setStatusFilter('All'); setSearchQuery(''); }}
                className={`px-4 py-1.5 font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {tab === 'TRUCK' ? `Trucks (${allTrucks.length})` : `Trailers (${allTrailers.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search unit, make, VIN, driver..."
              className="w-64 border border-gray-300 rounded-lg px-3 py-1.5 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ðŸ</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add {activeTab === 'TRUCK' ? 'Truck' : 'Trailer'}
          </button>
        </div>
      </div>

      {/* ─ Document Upload / Dropbox Zones ─ */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Company COI */}
        <div
          onClick={() => setShowCOI(true)}
          className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50'); }}
          onDragLeave={e => { e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); setShowCOI(true); }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg group-hover:bg-blue-200 transition-colors">ðŸ</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Company COI</p>
              <p className="text-xs text-gray-400">ACORD 25 Certificate</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">Active</span></div>
            <span className="text-xs text-gray-400 group-hover:text-blue-500">Drop PDF or click to manage →</span>
          </div>
        </div>

        {/* Insurance Cards */}
        <div
          onClick={() => setShowInsCards(true)}
          className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-green-400', 'bg-green-50'); }}
          onDragLeave={e => { e.currentTarget.classList.remove('border-green-400', 'bg-green-50'); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-green-400', 'bg-green-50'); setShowInsCards(true); }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg group-hover:bg-green-200 transition-colors">ðŸªª</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Insurance Cards</p>
              <p className="text-xs text-gray-400">VIN auto-match</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">{MOCK_TRUCKS.reduce((s, t) => s + (t.insuranceCards || []).length, 0)} cards on file</span>
            <span className="text-xs text-gray-400 group-hover:text-green-500">Drop cards or click →</span>
          </div>
        </div>

        {/* Registration Cards */}
        <div
          onClick={() => setShowRegCards(true)}
          className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-amber-400', 'bg-amber-50'); }}
          onDragLeave={e => { e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50'); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50'); setShowRegCards(true); }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg group-hover:bg-amber-200 transition-colors">ðŸ</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Registration Cards</p>
              <p className="text-xs text-gray-400">VIN auto-match</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">{MOCK_TRUCKS.reduce((s, t) => s + (t.registrationCards || []).length, 0)} cards on file</span>
            <span className="text-xs text-gray-400 group-hover:text-amber-500">Drop cards or click →</span>
          </div>
        </div>

        {/* PM Schedule */}
        <div
          onClick={() => setShowPMSchedule(true)}
          className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-lg group-hover:bg-violet-200 transition-colors">ðŸ§</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">PM Schedule</p>
              <p className="text-xs text-gray-400">Maintenance & inspections</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">{MOCK_TRUCKS.filter(t => { const d = Math.ceil((new Date(t.nextServiceDue).getTime() - new Date('2026-04-14').getTime()) / 86400000); return d <= 30 && d > 0; }).length > 0 ? <><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-xs text-yellow-600 font-medium">{MOCK_TRUCKS.filter(t => { const d = Math.ceil((new Date(t.nextServiceDue).getTime() - new Date('2026-04-14').getTime()) / 86400000); return d <= 30 && d > 0; }).length} due soon</span></> : <><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">All on schedule</span></>}</div>
            <span className="text-xs text-gray-400 group-hover:text-violet-500">Click to view →</span>
          </div>
        </div>
      </div>

      {/* ─ Summary Cards ─ */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total {activeTab === 'TRUCK' ? 'Trucks' : 'Trailers'}</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            <span className="text-green-600">{stats.active} active</span>
            <span className="text-gray-300">·</span>
            <span className="text-blue-600">{stats.available} avail</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">In Shop</p>
          <p className={`text-xl font-bold ${stats.inShop > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{stats.inShop}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            {stats.oos > 0 ? <span className="text-red-500">{stats.oos} out of service</span> : 'None out of service'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Service Due</p>
          <p className={`text-xl font-bold ${stats.serviceDue > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{stats.serviceDue}</p>
          <p className="text-xs text-gray-400 mt-1.5">Within 14 days</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Expiring Documents</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-xl font-bold ${(stats.expiringInsurance + stats.expiringRegistration + stats.expiringInspection) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stats.expiringInsurance + stats.expiringRegistration + stats.expiringInspection}
            </p>
          </div>
          <div className="flex gap-2 mt-1.5 text-xs text-gray-400">
            <span>{stats.expiringInspection} insp</span>
            <span>{stats.expiringRegistration} reg</span>
            <span>{stats.expiringInsurance} ins</span>
          </div>
        </div>

          {activeTab === 'TRUCK' ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">ELD Status</p>
              <p className="text-xl font-bold text-gray-900">{stats.eldConnected}<span className="text-sm font-normal text-gray-400">/{stats.total}</span></p>
              <div className="flex gap-2 mt-1.5 text-xs">
                <span className="text-green-600">{stats.movingNow} moving</span>
                {stats.dtcAlerts > 0 && <><span className="text-gray-300">·</span><span className="text-red-500">{stats.dtcAlerts} DTC</span></>}
                {stats.lowFuel > 0 && <><span className="text-gray-300">·</span><span className="text-yellow-600">{stats.lowFuel} low fuel</span></>}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Avg Mileage</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgMileage.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1.5">mi per unit</p>
            </div>
          )}
      </div>

      {/* ─ Status Filters ─ */}
      <div className="flex gap-1 mb-3">
        {['All', 'ACTIVE', 'AVAILABLE', 'IN_SHOP', 'OUT_OF_SERVICE'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s] || 'All'}
          </button>
        ))}
      </div>

      {/* ─ Table ─ */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('unitNumber')}>
                  Unit # {sortIcon('unitNumber')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Make / Model</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('year')}>
                  Year {sortIcon('year')}
                </th>
                {activeTab === 'TRAILER' && (
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Type</th>
                )}
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">License</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Ownership</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Assigned Driver</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Location</th>
                {activeTab === 'TRUCK' && (
                  <>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">ELD</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Engine</th>
                    <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Fuel</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">DTC</th>
                  </>
                )}
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('mileage')}>
                  Mileage {sortIcon('mileage')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => toggleSort('nextServiceDue')}>
                  Next Service {sortIcon('nextServiceDue')}
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'TRAILER' ? 12 : 11} className="px-3 py-8 text-center text-gray-400">
                    No {activeTab.toLowerCase()}s found matching your filters.
                  </td>
                </tr>
              )}
              {filteredAssets.map(asset => {
                const serviceWarning = daysUntil(asset.nextServiceDue) <= 14;
                const inspectionExpired = daysUntil(asset.inspectionExpiry) < 0;
                const inspectionSoon = daysUntil(asset.inspectionExpiry) <= 30 && !inspectionExpired;

                const rowHighlight = asset.status === 'OUT_OF_SERVICE'
                  ? 'bg-red-50 border-l-4 border-l-red-400'
                  : asset.status === 'IN_SHOP'
                  ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                  : serviceWarning || inspectionExpired
                  ? 'bg-orange-50 border-l-4 border-l-orange-300'
                  : '';

                return (
                  <tr
                    key={asset.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowHighlight}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-blue-600 font-semibold hover:underline">{asset.unitNumber}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[asset.status]}`}>
                        {STATUS_LABELS[asset.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{asset.make} {asset.model}</td>
                    <td className="px-3 py-2.5 text-gray-700">{asset.year}</td>
                    {activeTab === 'TRAILER' && (
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{asset.capacity}</td>
                    )}
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{asset.licensePlate}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${(asset.ownershipType || 'OWN') === 'OWN' ? 'bg-green-100 text-green-800' : (asset.ownershipType || 'OWN') === 'LEASE' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{(asset.ownershipType || 'OWN') === 'OWN' ? 'Owned' : (asset.ownershipType || 'OWN') === 'LEASE' ? 'Lease' : 'Rental'}</span>{(asset.ownershipCompany) && <span className="text-xs text-gray-400 ml-1">{(asset.ownershipCompany || "")}</span>}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {asset.assignedDriverName ? (
                        <span className="text-gray-700">{asset.assignedDriverName}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{asset.currentCity}, {asset.currentState}</td>
                    {asset.type === 'TRUCK' && (
                      <>
                        <td className="px-3 py-2.5">{asset.eldProvider ? (
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${asset.eldConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ELD_PROVIDER_BADGES[asset.eldProvider].bg} ${ELD_PROVIDER_BADGES[asset.eldProvider].text}`}>{ELD_PROVIDER_BADGES[asset.eldProvider].label}</span>
                          </div>
                        ) : <span className="text-gray-300"></span>}</td>
                        <td className={`px-3 py-2.5 font-medium whitespace-nowrap ${asset.engineStatus ? ENGINE_COLORS[asset.engineStatus] : 'text-gray-300'}`}>
                          {asset.engineStatus ? ENGINE_LABELS[asset.engineStatus] : ''}
                          {asset.gpsSpeed > 0 && <span className="text-gray-400 font-normal ml-1">{asset.gpsSpeed}mph</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {asset.fuelLevelPct !== null ? (
                            <span className={`font-medium ${asset.fuelLevelPct < 25 ? 'text-red-600' : asset.fuelLevelPct < 50 ? 'text-yellow-600' : 'text-gray-700'}`}>{asset.fuelLevelPct}%</span>
                          ) : <span className="text-gray-300"></span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {asset.dtcCodes.length > 0 ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">{asset.dtcCodes.length}</span>
                          ) : asset.eldConnected ? <span className="text-green-600 text-xs">Clear</span> : <span className="text-gray-300"></span>}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2.5 text-right text-gray-700">{asset.mileage.toLocaleString()} mi</td>
                    <td className={`px-3 py-2.5 whitespace-nowrap ${serviceWarning ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(asset.nextServiceDue)}
                      {serviceWarning && <span className="ml-1 text-orange-500">⚠</span>}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap ${inspectionExpired ? 'text-red-600 font-semibold' : inspectionSoon ? 'text-yellow-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(asset.inspectionExpiry)}
                      {inspectionExpired && <span className="ml-1">✕</span>}
                      {inspectionSoon && <span className="ml-1">⚠</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Showing:</strong> {filteredAssets.length} of {allAssets.length}</span>
          <span><strong className="text-gray-800">Total Mileage:</strong> {filteredAssets.reduce((s, a) => s + a.mileage, 0).toLocaleString()} mi</span>
          <span><strong className="text-gray-800">Avg Age:</strong> {(new Date().getFullYear() - Math.round(filteredAssets.reduce((s, a) => s + a.year, 0) / (filteredAssets.length || 1)))} yrs</span>
        </div>
      </div>

      {/* ─ Asset Detail Flyout ─ */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedAsset(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[420px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selectedAsset.unitNumber}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedAsset.make} {selectedAsset.model} · {selectedAsset.year}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[selectedAsset.status]}`}>
                  {STATUS_LABELS[selectedAsset.status]}
                </span>
                <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Vehicle Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Vehicle Information</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block">VIN</span>
                    <span className="text-xs font-mono text-gray-800">{selectedAsset.vin}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">License Plate</span>
                    <span className="text-xs text-gray-800">{selectedAsset.licensePlate} ({selectedAsset.licenseState})</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Mileage</span>
                    <span className="text-xs font-medium text-gray-800">{selectedAsset.mileage.toLocaleString()} mi</span>
                  </div>
                  {selectedAsset.fuelType && (
                    <div>
                      <span className="text-xs text-gray-400 block">Fuel Type</span>
                      <span className="text-xs text-gray-800">{selectedAsset.fuelType}</span>
                    </div>
                  )}
                  {selectedAsset.capacity && (
                    <div>
                      <span className="text-xs text-gray-400 block">Type / Capacity</span>
                      <span className="text-xs text-gray-800">{selectedAsset.capacity}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-400 block">Location</span>
                    <span className="text-xs text-gray-800">{selectedAsset.currentCity}, {selectedAsset.currentState}</span>
                  </div>
                </div>
              </div>

              {/* ELD Live Data (trucks only) */}
              {selectedAsset.type === 'TRUCK' && selectedAsset.eldProvider && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    ELD Live Data
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ELD_PROVIDER_BADGES[selectedAsset.eldProvider].bg} ${ELD_PROVIDER_BADGES[selectedAsset.eldProvider].text}`}>{ELD_PROVIDER_BADGES[selectedAsset.eldProvider].label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedAsset.eldConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs ${selectedAsset.eldConnected ? 'text-green-600' : 'text-red-500'}`}>{selectedAsset.eldConnected ? 'Connected' : 'Disconnected'}</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${selectedAsset.engineStatus ? ENGINE_COLORS[selectedAsset.engineStatus] : 'text-gray-300'}`}>
                          {selectedAsset.engineStatus ? ENGINE_LABELS[selectedAsset.engineStatus] : ''}
                        </p>
                        <p className="text-xs text-gray-400">Engine</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${selectedAsset.fuelLevelPct !== null && selectedAsset.fuelLevelPct < 25 ? 'text-red-600' : selectedAsset.fuelLevelPct !== null && selectedAsset.fuelLevelPct < 50 ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {selectedAsset.fuelLevelPct !== null ? `${selectedAsset.fuelLevelPct}%` : ''}
                        </p>
                        <p className="text-xs text-gray-400">Fuel level</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{selectedAsset.gpsSpeed > 0 ? `${selectedAsset.gpsSpeed}` : '0'}</p>
                        <p className="text-xs text-gray-400">mph {selectedAsset.gpsHeading && selectedAsset.gpsSpeed > 0 ? `(${selectedAsset.gpsHeading})` : ''}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                      <div>
                        <span className="text-xs text-gray-400 block">Miles today</span>
                        <span className="text-xs font-medium text-gray-800">{selectedAsset.odometerToday > 0 ? `${selectedAsset.odometerToday} mi` : 'Parked'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Last ELD ping</span>
                        <span className="text-xs text-gray-800">{selectedAsset.eldLastPing ? new Date(selectedAsset.eldLastPing).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</span>
                      </div>
                    </div>
                    {selectedAsset.dtcCodes.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-red-700 mb-1">Diagnostic Trouble Codes ({selectedAsset.dtcCodes.length})</p>
                        {selectedAsset.dtcCodes.map((dtc, i) => (
                          <div key={i} className="flex items-center gap-2 py-1 px-2 bg-red-50 rounded mt-1">
                            <span className="text-xs font-mono font-semibold text-red-800">{dtc.code}</span>
                            <span className="text-xs text-red-700">{dtc.description}</span>
                            <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-medium ${dtc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : dtc.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{dtc.severity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Driver Assignment */}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Assigned Driver</span>
                {selectedAsset.assignedDriverName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                      {selectedAsset.assignedDriverName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium text-gray-900">{selectedAsset.assignedDriverName}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No driver assigned</span>
                )}
              </div>

              {/* Service & Maintenance */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Service & Maintenance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Last Service</span>
                    <span className="text-xs text-gray-800">{formatDate(selectedAsset.lastServiceDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Next Service Due</span>
                    <span className={`text-xs ${expiryColor(selectedAsset.nextServiceDue)}`}>
                      {formatDate(selectedAsset.nextServiceDue)}
                      {daysUntil(selectedAsset.nextServiceDue) <= 14 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                          {daysUntil(selectedAsset.nextServiceDue) < 0
                            ? `${Math.abs(daysUntil(selectedAsset.nextServiceDue))}d overdue`
                            : `${daysUntil(selectedAsset.nextServiceDue)}d`
                          }
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-gray-500">Next Service Miles</span>
                    <span className="text-xs text-gray-800">
                      {selectedAsset.nextServiceMiles.toLocaleString()} mi
                      <span className="text-gray-400 ml-1">({(selectedAsset.nextServiceMiles - selectedAsset.mileage).toLocaleString()} remaining)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Toll Tags (trucks only) */}
              {selectedAsset.type === 'TRUCK' && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Toll Tags</h4>
                  {selectedAsset.tollTags.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-1 px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-500">
                        <span>Provider</span><span>Tag ID</span><span>Account</span><span className="text-right">Status</span>
                      </div>
                      {selectedAsset.tollTags.map((t, i) => (
                        <div key={i} className="grid grid-cols-4 gap-1 px-3 py-1.5 border-t border-gray-100 text-xs">
                          <span className={`font-medium ${t.provider.includes('PASS') && !t.provider.includes('E-Z') ? 'text-purple-700' : 'text-indigo-700'}`}>{t.provider}</span>
                          <span className="font-mono text-gray-800">{t.tagId}</span>
                          <span className="text-gray-500">{t.accountNumber}</span>
                          <span className="text-right"><span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{t.status}</span></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic px-3">No toll tags assigned</p>
                  )}
                </div>
              )}

              {/* IFTA & HUT Permits (trucks only) */}
              {selectedAsset.type === 'TRUCK' && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">IFTA & HUT Permits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-blue-50">
                      <span className="text-xs text-blue-700 font-medium">IFTA Account #</span>
                      <span className="text-xs font-mono font-semibold text-blue-900">{selectedAsset.iftaNumber || <span className="text-gray-400 italic">Not assigned</span>}</span>
                    </div>
                    {selectedAsset.hutPermits.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-3 gap-1 px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-500">
                          <span>State</span><span>HUT Permit #</span><span className="text-right">Expiry</span>
                        </div>
                        {selectedAsset.hutPermits.map((h, i) => (
                          <div key={i} className="grid grid-cols-3 gap-1 px-3 py-1.5 border-t border-gray-100 text-xs">
                            <span className="text-gray-700 font-medium">{h.state}</span>
                            <span className="font-mono text-gray-800">{h.permitNumber}</span>
                            <span className={`text-right ${expiryColor(h.expiryDate)}`}>{formatDate(h.expiryDate)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic px-3">No HUT permits on file</p>
                    )}
                  </div>
                </div>
              )}

              {/* Documents / Compliance */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Compliance Documents</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Insurance', date: selectedAsset.insuranceExpiry },
                    { label: 'Registration', date: selectedAsset.registrationExpiry },
                    { label: 'Inspection', date: selectedAsset.inspectionExpiry },
                  ].map(doc => {
                    const days = daysUntil(doc.date);
                    const expired = days < 0;
                    const soon = days >= 0 && days <= 30;
                    return (
                      <div key={doc.label} className={`flex justify-between items-center py-2 px-3 rounded-lg ${expired ? 'bg-red-50' : soon ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-600">{doc.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${expiryColor(doc.date)}`}>{formatDate(doc.date)}</span>
                          {expired && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">Expired</span>}
                          {soon && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">{days}d left</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ownership */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Ownership</h4>
                <div className={`rounded-lg p-3 ${(selectedAsset.ownershipType || 'OWN') === 'OWN' ? 'bg-green-50' : (selectedAsset.ownershipType || 'OWN') === 'LEASE' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <div className="flex items-center gap-2 mb-1"><span className={`px-2 py-0.5 rounded text-xs font-bold ${(selectedAsset.ownershipType || 'OWN') === 'OWN' ? 'bg-green-200 text-green-800' : (selectedAsset.ownershipType || 'OWN') === 'LEASE' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'}`}>{(selectedAsset.ownershipType || 'OWN') === 'OWN' ? 'Company Owned' : (selectedAsset.ownershipType || 'OWN') === 'LEASE' ? 'Leased' : 'Rental'}</span></div>
                  {(selectedAsset.ownershipCompany) && <div className="text-xs space-y-1 mt-2"><div className="flex justify-between"><span className="text-gray-500">Company</span><span className="text-gray-800 font-medium">{(selectedAsset.ownershipCompany || "")}</span></div>{(selectedAsset.leaseStartDate) && <div className="flex justify-between"><span className="text-gray-500">Term</span><span className="text-gray-800">{formatDate(selectedAsset.leaseStartDate || '')} → {formatDate(selectedAsset.leaseEndDate || '')}</span></div>}{(selectedAsset.monthlyPayment || 0) > 0 && <div className="flex justify-between"><span className="text-gray-500">Monthly</span><span className="text-gray-800 font-bold">${(selectedAsset.monthlyPayment || 0).toLocaleString()}</span></div>}</div>}
                </div>
              </div>

              {/* Insurance Cards */}
              {(selectedAsset.insuranceCards || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Insurance Cards ({(selectedAsset.insuranceCards || []).length})</h4>
                  <div className="space-y-1.5">{(selectedAsset.insuranceCards || []).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div><p className="text-xs font-medium text-gray-800">{c.state}  {c.carrier}</p><p className="text-xs text-gray-400">Policy: {c.policyNumber} · {c.effectiveDate} → {c.expirationDate}</p></div>
                      <div className="flex items-center gap-2">{c.vinMatched && <span className="text-xs text-green-600 font-medium">✓ VIN</span>}<button className="text-xs text-blue-600">View</button><button onClick={(e) => { e.stopPropagation(); setSendDocType(`Insurance Card (${c.state})`); setShowSendToDriver(true); }} className="text-xs text-violet-600">ðŸ± Send</button></div>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Registration Cards */}
              {(selectedAsset.registrationCards || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Registration Cards ({(selectedAsset.registrationCards || []).length})</h4>
                  <div className="space-y-1.5">{(selectedAsset.registrationCards || []).map(c => (
                    <div key={c.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${new Date(c.expiry) < new Date('2026-04-14') ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div><p className="text-xs font-medium text-gray-800">{c.state}  {c.plateNumber}</p><p className="text-xs text-gray-400">VIN: {c.vin} · {c.year} {c.make}</p><p className="text-xs text-gray-400">Expires: <span className={new Date(c.expiry) < new Date('2026-04-14') ? 'text-red-600 font-bold' : ''}>{new Date(c.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p></div>
                      <div className="flex items-center gap-2">{c.vinMatched && <span className="text-xs text-green-600 font-medium">✓ VIN</span>}<button className="text-xs text-blue-600">View</button><button onClick={(e) => { e.stopPropagation(); setSendDocType(`Registration (${c.state})`); setShowSendToDriver(true); }} className="text-xs text-violet-600">ðŸ± Send</button></div>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Notes */}
              {selectedAsset.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedAsset.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Edit Asset</button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">Service History</button>
            </div>
          </div>
        </div>
      )}

      {/* ─ Add Asset Modal ─ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Add New {activeTab === 'TRUCK' ? 'Truck' : 'Trailer'}</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Number *</label>
                  <input type="text" placeholder={activeTab === 'TRUCK' ? 'T-XXXX' : 'TR-XXXX'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Make *</label>
                  <input type="text" placeholder="Freightliner" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Model *</label>
                  <input type="text" placeholder="Cascadia" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year *</label>
                  <input type="number" placeholder="2024" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">VIN *</label>
                  <input type="text" placeholder="17 characters" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mileage</label>
                  <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">License Plate</label>
                  <input type="text" placeholder="XX-X0000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <input type="text" placeholder="TX" maxLength={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {activeTab === 'TRUCK' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Diesel</option>
                      <option>CNG</option>
                      <option>Electric</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Trailer Type</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>53' Dry Van</option>
                      <option>53' Reefer</option>
                      <option>48' Flatbed</option>
                      <option>53' Step Deck</option>
                      <option>20' Container</option>
                      <option>40' Container</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Expiry</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Expiry</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Inspection Expiry</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              {/* Ownership */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-blue-800">Ownership</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ownership Type *</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="OWN">Owned</option>
                      <option value="LEASE">Leased</option>
                      <option value="RENTAL">Rental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lease / Rental Company</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">N/A (Owned)</option>
                      <option>Penske Truck Leasing</option>
                      <option>Ryder System Inc.</option>
                      <option>Daimler Truck Financial</option>
                      <option>PACCAR Leasing</option>
                      <option>Enterprise Fleet Management</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Monthly Payment</label>
                    <input type="number" placeholder="$0" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lease Start Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lease End Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Insurance Card */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-green-800">Insurance Card</h4>
                <p className="text-xs text-green-600">Upload the state insurance ID card  VIN will be auto-verified</p>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-100">
                  <p className="text-lg mb-1">ðŸªª</p>
                  <p className="text-xs font-medium text-gray-700">Drop insurance card or click to browse</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG  will auto-scan VIN and link to this asset</p>
                </div>
              </div>

              {/* Registration Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-amber-800">Registration Card</h4>
                <p className="text-xs text-amber-600">Upload the state vehicle registration  VIN will be auto-verified and matched</p>
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-100">
                  <p className="text-lg mb-1">ðŸ</p>
                  <p className="text-xs font-medium text-gray-700">Drop registration card or click to browse</p>
                  <p className="text-xs text-gray-400">Plate #, VIN, expiry, and weight will be auto-extracted</p>
                </div>
              </div>

              {activeTab === 'TRUCK' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-purple-800">Toll Tags</h4>
                  <p className="text-xs text-purple-600">Link toll transponders to this vehicle for automatic toll transaction tracking</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">I-PASS Tag ID</label>
                      <input type="text" placeholder="IP-XXXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">I-PASS Account #</label>
                      <input type="text" placeholder="IPASS-GX-XXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs text-gray-600 pb-1.5"><input type="checkbox" defaultChecked className="rounded text-purple-600" /> Active</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">E-ZPass NY Tag ID</label>
                      <input type="text" placeholder="EZ-NY-XXXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">E-ZPass Account #</label>
                      <input type="text" placeholder="EZNY-GX-XXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs text-gray-600 pb-1.5"><input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Active</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TRUCK' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-blue-800">IFTA & HUT Permits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">IFTA Account #</label>
                      <input type="text" placeholder="IFTA-XX-00000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600">HUT Permits (add permits for states that require highway use tax)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">NY HUT #</label>
                      <input type="text" placeholder="NY-HUT-YYYY-XXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">OR WMT #</label>
                      <input type="text" placeholder="OR-WMT-YYYY-XXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">KY KIT #</label>
                      <input type="text" placeholder="KY-KIT-YYYY-XXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">NM WDT #</label>
                      <input type="text" placeholder="NM-WDT-YYYY-XXXX" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">HUT Permit Expiry</label>
                      <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} placeholder="Any notes about this unit..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                Add {activeTab === 'TRUCK' ? 'Truck' : 'Trailer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─ PM Schedule Modal ─ */}
      {showPMSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPMSchedule(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Preventive Maintenance Schedule</h2><p className="text-xs text-gray-400 mt-0.5">Upcoming service, inspections, and compliance deadlines</p></div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Overdue</p><p className="text-xl font-bold text-red-600">{MOCK_TRUCKS.filter(t => new Date(t.inspectionExpiry) < new Date('2026-04-14')).length}</p></div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Due in 30 Days</p><p className="text-xl font-bold text-yellow-600">{MOCK_TRUCKS.filter(t => { const d = Math.ceil((new Date(t.nextServiceDue).getTime() - new Date('2026-04-14').getTime()) / 86400000); return d > 0 && d <= 30; }).length}</p></div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">On Schedule</p><p className="text-xl font-bold text-green-600">{MOCK_TRUCKS.filter(t => { const d = Math.ceil((new Date(t.nextServiceDue).getTime() - new Date('2026-04-14').getTime()) / 86400000); return d > 30; }).length}</p></div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Fleet</p><p className="text-xl font-bold text-blue-600">{MOCK_TRUCKS.length + MOCK_TRAILERS.length}</p></div>
              </div>
              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Make / Model</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Current Miles</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500">Service Due (Miles)</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Next Service Date</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">DOT Inspection</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              </tr></thead><tbody>
                {[...MOCK_TRUCKS, ...MOCK_TRAILERS].sort((a, b) => new Date(a.nextServiceDue).getTime() - new Date(b.nextServiceDue).getTime()).map(t => {
                  const daysUntil = Math.ceil((new Date(t.nextServiceDue).getTime() - new Date('2026-04-14').getTime()) / 86400000);
                  const milesLeft = t.nextServiceMiles - t.mileage;
                  const inspDays = Math.ceil((new Date(t.inspectionExpiry).getTime() - new Date('2026-04-14').getTime()) / 86400000);
                  return (
                    <tr key={t.id} className={`border-b border-gray-100 ${daysUntil <= 0 ? 'bg-red-50 border-l-4 border-l-red-400' : daysUntil <= 30 ? 'bg-yellow-50' : ''}`}>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">{t.unitNumber}</td>
                      <td className="px-3 py-2.5 text-gray-600">{t.make} {t.model} ({t.year})</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{t.mileage.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right"><span className={milesLeft < 5000 ? 'text-red-600 font-bold' : 'text-gray-700'}>{t.nextServiceMiles.toLocaleString()}</span><br/><span className="text-gray-400">{milesLeft.toLocaleString()} mi left</span></td>
                      <td className="px-3 py-2.5"><span className={`font-medium ${daysUntil <= 0 ? 'text-red-600' : daysUntil <= 30 ? 'text-yellow-600' : 'text-gray-700'}`}>{new Date(t.nextServiceDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><br/><span className="text-gray-400">{daysUntil <= 0 ? `${Math.abs(daysUntil)}d overdue` : `in ${daysUntil}d`}</span></td>
                      <td className="px-3 py-2.5"><span className={`font-medium ${inspDays <= 0 ? 'text-red-600' : inspDays <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>{new Date(t.inspectionExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></td>
                      <td className="px-3 py-2.5">{daysUntil <= 0 ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span> : daysUntil <= 14 ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Due Soon</span> : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">On Schedule</span>}</td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowPMSchedule(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}

      {/* ─ Company COI Modal ─ */}
      {showCOI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCOI(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Company Certificate of Insurance (COI)</h2><p className="text-xs text-gray-400 mt-0.5">ACORD 25  Certificate of Liability Insurance</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3"><span className="text-xl">✅</span><div><p className="text-sm font-bold text-green-800">COI Active  All Policies Current</p><p className="text-xs text-green-600">ACORD Certificate #CL2631361416 · Issued 03/13/2026</p></div></div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 mb-3"><div><p className="text-xs text-gray-400">Insured</p><p className="text-sm font-bold">AXON TMS Transport Corporation</p><p className="text-xs text-gray-500">184-54 149th Avenue, 1st Floor</p><p className="text-xs text-gray-500">Springfield Gardens, NY 11413</p></div><div><p className="text-xs text-gray-400">Producer</p><p className="text-sm font-semibold">AssuredPartners Northeast, LLC</p><p className="text-xs text-gray-500">800 Westchester Ave, Suite S-714, Rye Brook NY 10573</p><p className="text-xs text-gray-500">Contact: Shaunna Marquis · (914) 761-9000</p></div></div>
              </div>

              <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2 font-medium text-gray-500">Coverage</th><th className="text-left px-3 py-2 font-medium text-gray-500">Insurer</th><th className="text-left px-3 py-2 font-medium text-gray-500">Policy #</th><th className="text-left px-3 py-2 font-medium text-gray-500">Effective</th><th className="text-left px-3 py-2 font-medium text-gray-500">Expiry</th><th className="text-right px-3 py-2 font-medium text-gray-500">Limit</th></tr></thead><tbody>
                <tr className="border-b border-gray-100"><td className="px-3 py-2 font-medium">A  Commercial General Liability</td><td className="px-3 py-2 text-gray-600">Cincinnati Specialty Underwriters</td><td className="px-3 py-2 font-mono">CSU0206317</td><td className="px-3 py-2">03/31/2025</td><td className="px-3 py-2">03/31/2026</td><td className="px-3 py-2 text-right">$1,000,000 / $2,000,000</td></tr>
                <tr className="border-b border-gray-100"><td className="px-3 py-2 font-medium">B  Automobile Liability</td><td className="px-3 py-2 text-gray-600">National Liability & Fire Insurance</td><td className="px-3 py-2 font-mono">73TRB006636</td><td className="px-3 py-2">03/13/2026</td><td className="px-3 py-2">03/13/2027</td><td className="px-3 py-2 text-right">$100,000 CSL</td></tr>
                <tr className="border-b border-gray-100"><td className="px-3 py-2 font-medium">C  Umbrella / Excess Liability</td><td className="px-3 py-2 text-gray-600">National Fire and Marine Insurance</td><td className="px-3 py-2 font-mono">72XAB012295</td><td className="px-3 py-2">03/13/2026</td><td className="px-3 py-2">03/13/2027</td><td className="px-3 py-2 text-right">$900,000</td></tr>
                <tr className="border-b border-gray-100"><td className="px-3 py-2 font-medium">D  Motor Truck Cargo</td><td className="px-3 py-2 text-gray-600">Travelers Property Casualty</td><td className="px-3 py-2 font-mono">QT-660-7X683454-TIL-26</td><td className="px-3 py-2">03/12/2026</td><td className="px-3 py-2">03/12/2027</td><td className="px-3 py-2 text-right">$250,000</td></tr>
              </tbody></table>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50" onClick={() => {}}>
                <p className="text-2xl mb-2">ðŸ</p>
                <p className="text-sm font-semibold text-gray-700">Upload Updated COI</p>
                <p className="text-xs text-gray-400 mt-1">Drop ACORD 25 PDF here or click to browse</p>
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200"><button onClick={() => setShowCOI(false)} className="px-4 py-2 text-sm text-gray-600">Close</button></div>
          </div>
        </div>
      )}

      {/* ─ Insurance Cards Modal ─ */}
      {showInsCards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInsCards(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Vehicle Insurance Cards</h2><p className="text-xs text-gray-400 mt-0.5">Upload insurance ID cards  VIN# will be auto-scanned and matched to fleet assets</p></div>
            <div className="px-6 py-4 space-y-4">
              {/* Upload zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50" onClick={() => { setInsCardParsing(true); setTimeout(() => { setParsedInsCards([
                { state: 'NY', policyNumber: '73TRB006636', carrier: 'National Liability Fire', effectiveDate: '03/12/2026', expirationDate: '03/12/2027', year: 2020, make: 'HINO', vin: '5PVNJ8JVXL4S76467', matchedUnit: 'T-1055', matchConfidence: 'VIN Match ✓' },
                { state: 'FL', policyNumber: '73TRB006637', carrier: 'National Indemnity Co. of the South', effectiveDate: '03/12/2026', expirationDate: '03/12/2027', year: 2018, make: 'Freightliner', vin: '3AKJHLDV0JSJW9713', matchedUnit: 'T-1070', matchConfidence: 'VIN Match ✓' },
                { state: 'IL', policyNumber: '73TRB006637', carrier: 'National Indemnity Co. of the South', effectiveDate: '03/12/2026', expirationDate: '03/12/2027', year: 2018, make: 'Freightliner Cascadia', vin: '3AKJHLDV3JSKC8507', matchedUnit: 'T-1042', matchConfidence: 'VIN Match ✓' },
              ]); setInsCardParsing(false); }, 1500); }}>
                {insCardParsing ? (
                  <div><div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" /><p className="text-sm font-semibold text-gray-700">Scanning insurance cards...</p><p className="text-xs text-gray-400">Extracting VIN#, policy, dates, and matching to fleet</p></div>
                ) : (
                  <div><p className="text-2xl mb-2">ðŸªª</p><p className="text-sm font-semibold text-gray-700">Upload Insurance Cards</p><p className="text-xs text-gray-400 mt-1">Drop PDF, JPG, or PNG  supports batch upload of multiple cards</p><p className="text-xs text-gray-400">VIN# on each card will be auto-matched to your fleet assets</p></div>
                )}
              </div>

              {/* Parsed results */}
              {parsedInsCards.length > 0 && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2"><span className="text-lg">✅</span><span className="text-sm font-bold text-green-800">{parsedInsCards.length} cards scanned  all VINs matched to fleet</span></div>
                  <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2 font-medium text-gray-500">State</th><th className="text-left px-3 py-2 font-medium text-gray-500">Policy #</th><th className="text-left px-3 py-2 font-medium text-gray-500">Carrier</th><th className="text-left px-3 py-2 font-medium text-gray-500">Vehicle</th><th className="text-left px-3 py-2 font-medium text-gray-500">VIN (Scanned)</th><th className="text-left px-3 py-2 font-medium text-gray-500">Dates</th><th className="text-left px-3 py-2 font-medium text-gray-500">Matched Unit</th></tr></thead><tbody>
                    {parsedInsCards.map((c, i) => (
                      <tr key={i} className="border-b border-gray-100 bg-green-50">
                        <td className="px-3 py-2 font-bold text-gray-800">{c.state}</td>
                        <td className="px-3 py-2 font-mono text-gray-700">{c.policyNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{c.carrier}</td>
                        <td className="px-3 py-2 text-gray-700">{c.year} {c.make}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">{c.vin}</td>
                        <td className="px-3 py-2 text-gray-600">{c.effectiveDate} → {c.expirationDate}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">{c.matchedUnit}</span><span className="text-xs text-green-600 ml-1">{c.matchConfidence}</span></td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}

              {/* Existing cards on file */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Insurance Cards on File ({MOCK_TRUCKS.reduce((s, t) => s + (t.insuranceCards || []).length, 0)})</h4>
                <div className="space-y-1.5">
                  {MOCK_TRUCKS.filter(t => (t.insuranceCards || []).length > 0).map(t => t.insuranceCards.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">{t.unitNumber}</span>
                        <div><p className="text-xs font-medium text-gray-800">{c.state}  {c.carrier}</p><p className="text-xs text-gray-400">Policy: {c.policyNumber} · {c.effectiveDate} → {c.expirationDate}</p></div>
                      </div>
                      <div className="flex items-center gap-2">{c.vinMatched && <span className="text-xs text-green-600 font-medium">✓ VIN Matched</span>}<button className="text-xs text-blue-600 hover:underline">View</button></div>
                    </div>
                  )))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowInsCards(false)} className="px-4 py-2 text-sm text-gray-600">Close</button>
              {parsedInsCards.length > 0 && <button onClick={() => { setParsedInsCards([]); setShowInsCards(false); }} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Link {parsedInsCards.length} Cards to Fleet</button>}
            </div>
          </div>
        </div>
      )}

      {/* ─ Registration Cards Modal ─ */}
      {showRegCards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRegCards(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Vehicle Registration Cards</h2><p className="text-xs text-gray-400 mt-0.5">Upload registration documents  VIN# will be auto-scanned and matched to fleet assets</p></div>
            <div className="px-6 py-4 space-y-4">
              {/* Upload zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50" onClick={() => { setRegCardParsing(true); setTimeout(() => { setParsedRegCards([
                { state: 'NY', plateNumber: '14087NF', vin: '3ALACWFC9KDKB9162', year: 2019, make: 'Freightliner', type: 'COM / DELV WH', weight: '026000', expiry: '06/30/2025', regNumber: 'JE163778', matchedUnit: 'T-1042', matchConfidence: 'VIN Match ✓', owner: 'AXON TMS TRANSPORT CORP', address: '147-09 182ND ST, SPRINGFIELD GA NY 11413' },
              ]); setRegCardParsing(false); }, 1500); }}>
                {regCardParsing ? (
                  <div><div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" /><p className="text-sm font-semibold text-gray-700">Scanning registration cards...</p><p className="text-xs text-gray-400">Extracting VIN#, plate, expiry, and matching to fleet</p></div>
                ) : (
                  <div><p className="text-2xl mb-2">ðŸ</p><p className="text-sm font-semibold text-gray-700">Upload Registration Cards</p><p className="text-xs text-gray-400 mt-1">Drop PDF, JPG, or PNG  supports batch upload</p><p className="text-xs text-gray-400">VIN# on each card will be auto-matched to your fleet assets</p></div>
                )}
              </div>

              {/* Parsed results */}
              {parsedRegCards.length > 0 && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2"><span className="text-lg">✅</span><span className="text-sm font-bold text-green-800">{parsedRegCards.length} registration(s) scanned  VIN matched to fleet</span></div>
                  {parsedRegCards.map((c, i) => (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-900">NY State Registration Document</span><span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-bold">{c.matchedUnit}  {c.matchConfidence}</span></div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div><span className="text-gray-400">Type</span><br/><strong>{c.type}</strong></div>
                        <div><span className="text-gray-400">Plate</span><br/><strong>{c.plateNumber}</strong></div>
                        <div><span className="text-gray-400">Year / Make</span><br/><strong>{c.year} {c.make}</strong></div>
                        <div><span className="text-gray-400">VIN (Scanned)</span><br/><strong className="font-mono">{c.vin}</strong></div>
                        <div><span className="text-gray-400">Weight</span><br/><strong>{c.weight} lbs</strong></div>
                        <div><span className="text-gray-400">Expires</span><br/><strong className={new Date(c.expiry.replace(/\//g,'-')) < new Date('2026-04-14') ? 'text-red-600' : ''}>{c.expiry}</strong></div>
                        <div><span className="text-gray-400">Reg #</span><br/><strong className="font-mono">{c.regNumber}</strong></div>
                        <div className="col-span-2"><span className="text-gray-400">Owner</span><br/><strong>{c.owner}</strong><br/><span className="text-gray-400">{c.address}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing registration cards on file */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Registration Cards on File ({MOCK_TRUCKS.reduce((s, t) => s + (t.registrationCards || []).length, 0)})</h4>
                <div className="space-y-1.5">
                  {MOCK_TRUCKS.filter(t => (t.registrationCards || []).length > 0).map(t => t.registrationCards.map(c => (
                    <div key={c.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${new Date(c.expiry) < new Date('2026-04-14') ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">{t.unitNumber}</span>
                        <div><p className="text-xs font-medium text-gray-800">{c.state}  Plate: {c.plateNumber}</p><p className="text-xs text-gray-400">VIN: {c.vin} · {c.year} {c.make} · Exp: {new Date(c.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.vinMatched && <span className="text-xs text-green-600 font-medium">✓ VIN</span>}
                        {new Date(c.expiry) < new Date('2026-04-14') && <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">EXPIRED</span>}
                        <button className="text-xs text-blue-600">View</button>
                        <button onClick={() => { setSendDocType(`Registration (${c.state}  ${t.unitNumber})`); setShowSendToDriver(true); }} className="text-xs text-violet-600">ðŸ± Send</button>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowRegCards(false)} className="px-4 py-2 text-sm text-gray-600">Close</button>
              {parsedRegCards.length > 0 && <button onClick={() => { setParsedRegCards([]); setShowRegCards(false); }} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Link {parsedRegCards.length} Registration(s) to Fleet</button>}
            </div>
          </div>
        </div>
      )}

      {/* ─ Send to Driver Modal ─ */}
      {showSendToDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSendToDriver(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Send Document to Driver</h2><p className="text-xs text-gray-400 mt-0.5">{sendDocType}</p></div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{selectedAsset?.assignedDriverName ? <option>{selectedAsset.assignedDriverName} (assigned)</option> : <option>Select driver...</option>}<option>Marcus Johnson</option><option>Sarah Chen</option><option>Robert Brown</option><option>James Williams</option><option>David Kim</option><option>Emily Taylor</option><option>Lisa Nguyen</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-violet-200 bg-violet-50 rounded-lg cursor-pointer"><input type="radio" name="sendMethod" defaultChecked className="text-violet-600" /><div><span className="text-sm font-medium text-gray-800">ðŸ± Push to Driver Mobile App</span><p className="text-xs text-gray-400">Document will appear in driver's Documents tab</p></div></label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 bg-white rounded-lg cursor-pointer"><input type="radio" name="sendMethod" className="text-violet-600" /><div><span className="text-sm font-medium text-gray-800">ðŸ§ Email</span><p className="text-xs text-gray-400">Send as PDF attachment to driver's email</p></div></label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 bg-white rounded-lg cursor-pointer"><input type="radio" name="sendMethod" className="text-violet-600" /><div><span className="text-sm font-medium text-gray-800">ðŸ¬ SMS / Text</span><p className="text-xs text-gray-400">Send download link via text message</p></div></label>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Keep this in your truck at all times..." /></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200"><button onClick={() => setShowSendToDriver(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={() => setShowSendToDriver(false)} className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">ðŸ± Send to Driver</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
