import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ─ Types ─
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: 'OPERATIONS' | 'FINANCIAL' | 'SAFETY' | 'FLEET' | 'DRIVER';
  icon: string;
  columns: { key: string; header: string; width?: number }[];
  getData: (startDate: string, endDate: string) => Record<string, any>[];
}

// ─ Mock Data Generators ─
function getLoadReport() {
  return [
    { loadNumber: 'LD-4521', status: 'In Transit', customer: 'Acme Corp - LAX', origin: 'Memphis, TN', destination: 'Nashville, TN', pickupDate: '2026-04-10', deliveryDate: '2026-04-10', driver: 'Marcus Johnson', equipment: "Van - 53'", miles: 450, lineHaul: 2800, fuelSurcharge: 280, accessorials: 120, totalRate: 3200, ratePerMile: 7.11 },
    { loadNumber: 'LD-4522', status: 'Assigned', customer: 'Acme Corp - ORD', origin: 'Dallas, TX', destination: 'Houston, TX', pickupDate: '2026-04-10', deliveryDate: '2026-04-10', driver: 'Sarah Chen', equipment: "Reefer - 53'", miles: 720, lineHaul: 4200, fuelSurcharge: 420, accessorials: 180, totalRate: 4800, ratePerMile: 6.67 },
    { loadNumber: 'LD-4523', status: 'In Transit', customer: 'Acme Corp - EWR', origin: 'Gary, IN', destination: 'Columbus, OH', pickupDate: '2026-04-10', deliveryDate: '2026-04-10', driver: 'James Williams', equipment: "Flatbed - 48'", miles: 890, lineHaul: 4900, fuelSurcharge: 490, accessorials: 210, totalRate: 5600, ratePerMile: 6.29 },
    { loadNumber: 'LD-4524', status: 'In Transit', customer: 'Acme Corp - DFW', origin: 'Nashville, TN', destination: 'Louisville, KY', pickupDate: '2026-04-13', deliveryDate: '2026-04-13', driver: 'Robert Brown', equipment: "Van - 53'", miles: 380, lineHaul: 2500, fuelSurcharge: 250, accessorials: 150, totalRate: 2900, ratePerMile: 7.63 },
    { loadNumber: 'LD-4525', status: 'Assigned', customer: 'Acme Corp - ATL', origin: 'Atlanta, GA', destination: 'Jacksonville, FL', pickupDate: '2026-04-13', deliveryDate: '2026-04-13', driver: 'Maria Rodriguez', equipment: "Van - 53'", miles: 410, lineHaul: 2700, fuelSurcharge: 270, accessorials: 130, totalRate: 3100, ratePerMile: 7.56 },
    { loadNumber: 'LD-4526', status: 'Assigned', customer: 'Acme Corp - LAX', origin: 'Denver, CO', destination: 'Salt Lake City, UT', pickupDate: '2026-04-13', deliveryDate: '2026-04-14', driver: 'Lisa Nguyen', equipment: "Reefer - 53'", miles: 980, lineHaul: 5400, fuelSurcharge: 540, accessorials: 260, totalRate: 6200, ratePerMile: 6.33 },
    { loadNumber: 'LD-4518', status: 'Delivered', customer: 'Acme Corp - DFW', origin: 'Nashville, TN', destination: 'Louisville, KY', pickupDate: '2026-04-08', deliveryDate: '2026-04-08', driver: 'Robert Brown', equipment: "Van - 53'", miles: 380, lineHaul: 2500, fuelSurcharge: 250, accessorials: 150, totalRate: 2900, ratePerMile: 7.63 },
    { loadNumber: 'LD-4510', status: 'Delivered', customer: 'Acme Corp - ATL', origin: 'Atlanta, GA', destination: 'Jacksonville, FL', pickupDate: '2026-04-05', deliveryDate: '2026-04-05', driver: 'Maria Rodriguez', equipment: "Van - 53'", miles: 410, lineHaul: 2700, fuelSurcharge: 270, accessorials: 130, totalRate: 3100, ratePerMile: 7.56 },
    { loadNumber: 'LD-4502', status: 'Delivered', customer: 'XPO Logistics', origin: 'Omaha, NE', destination: 'Kansas City, MO', pickupDate: '2026-04-01', deliveryDate: '2026-04-02', driver: 'Sarah Chen', equipment: "Reefer - 53'", miles: 490, lineHaul: 2900, fuelSurcharge: 290, accessorials: 210, totalRate: 3400, ratePerMile: 6.94 },
    { loadNumber: 'LD-4508', status: 'Delivered', customer: 'Acme Corp - LAX', origin: 'Atlanta, GA', destination: 'Charlotte, NC', pickupDate: '2026-04-03', deliveryDate: '2026-04-04', driver: 'Emily Taylor', equipment: "Van - 53'", miles: 620, lineHaul: 3700, fuelSurcharge: 370, accessorials: 130, totalRate: 4200, ratePerMile: 6.77 },
  ];
}

function getRevenueReport() {
  return [
    { customer: 'Acme Corp - LAX', loads: 142, totalRevenue: 1533265, avgRatePerLoad: 10797, avgRatePerMile: 6.85, fuelSurcharge: 153326, accessorials: 76663, lastLoad: '2026-04-11', paymentTerms: 'Net 30', avgDaysToPay: 27 },
    { customer: 'Acme Corp - ORD', loads: 98, totalRevenue: 1090560, avgRatePerLoad: 11128, avgRatePerMile: 7.12, fuelSurcharge: 109056, accessorials: 54528, lastLoad: '2026-04-10', paymentTerms: 'Net 30', avgDaysToPay: 24 },
    { customer: 'Acme Corp - EWR', loads: 76, totalRevenue: 957335, avgRatePerLoad: 12596, avgRatePerMile: 6.45, fuelSurcharge: 95734, accessorials: 47867, lastLoad: '2026-04-09', paymentTerms: 'Net 45', avgDaysToPay: 38 },
    { customer: 'Acme Corp - DFW', loads: 34, totalRevenue: 317005, avgRatePerLoad: 9324, avgRatePerMile: 7.21, fuelSurcharge: 31701, accessorials: 15850, lastLoad: '2026-04-12', paymentTerms: 'Net 30', avgDaysToPay: 22 },
    { customer: 'Acme Corp - ATL', loads: 22, totalRevenue: 181703, avgRatePerLoad: 8259, avgRatePerMile: 6.98, fuelSurcharge: 18170, accessorials: 9085, lastLoad: '2026-04-08', paymentTerms: 'Net 30', avgDaysToPay: 19 },
    { customer: 'XPO Logistics', loads: 41, totalRevenue: 289400, avgRatePerLoad: 7059, avgRatePerMile: 5.92, fuelSurcharge: 28940, accessorials: 14470, lastLoad: '2026-04-11', paymentTerms: 'Net 30', avgDaysToPay: 26 },
    { customer: 'Echo Global Logistics', loads: 28, totalRevenue: 196700, avgRatePerLoad: 7025, avgRatePerMile: 5.88, fuelSurcharge: 19670, accessorials: 9835, lastLoad: '2026-04-10', paymentTerms: 'Net 21', avgDaysToPay: 18 },
  ];
}

function getDriverReport() {
  return [
    { driver: 'Marcus Johnson', truckNumber: 'T-1042', status: 'Driving', loads: 24, miles: 12400, revenue: 78500, revenuePerMile: 6.33, hosAvailable: 6.5, hosViolations: 1, accidents: 0, inspections: 1, inspectionClean: 1, onTimePickup: '96%', onTimeDelivery: '94%' },
    { driver: 'Sarah Chen', truckNumber: 'T-1038', status: 'Available', loads: 22, miles: 15800, revenue: 94200, revenuePerMile: 5.96, hosAvailable: 11.0, hosViolations: 0, accidents: 0, inspections: 0, inspectionClean: 0, onTimePickup: '98%', onTimeDelivery: '97%' },
    { driver: 'James Williams', truckNumber: 'T-1055', status: 'Driving', loads: 18, miles: 14200, revenue: 82400, revenuePerMile: 5.80, hosAvailable: 3.2, hosViolations: 0, accidents: 1, inspections: 0, inspectionClean: 0, onTimePickup: '92%', onTimeDelivery: '90%' },
    { driver: 'Maria Rodriguez', truckNumber: 'T-1061', status: 'Available', loads: 15, miles: 8900, revenue: 52100, revenuePerMile: 5.85, hosAvailable: 10.5, hosViolations: 0, accidents: 0, inspections: 0, inspectionClean: 0, onTimePickup: '100%', onTimeDelivery: '98%' },
    { driver: 'David Kim', truckNumber: 'T-1029', status: 'Off Duty', loads: 20, miles: 11600, revenue: 68300, revenuePerMile: 5.89, hosAvailable: 0, hosViolations: 0, accidents: 0, inspections: 1, inspectionClean: 0, onTimePickup: '94%', onTimeDelivery: '92%' },
    { driver: 'Emily Taylor', truckNumber: 'T-1044', status: 'Sleeper', loads: 19, miles: 13400, revenue: 79800, revenuePerMile: 5.96, hosAvailable: 0, hosViolations: 0, accidents: 0, inspections: 0, inspectionClean: 0, onTimePickup: '97%', onTimeDelivery: '95%' },
    { driver: 'Robert Brown', truckNumber: 'T-1070', status: 'Driving', loads: 21, miles: 10200, revenue: 63700, revenuePerMile: 6.25, hosAvailable: 8.0, hosViolations: 0, accidents: 0, inspections: 1, inspectionClean: 1, onTimePickup: '95%', onTimeDelivery: '93%' },
    { driver: 'Lisa Nguyen', truckNumber: 'T-1033', status: 'Available', loads: 17, miles: 12100, revenue: 71400, revenuePerMile: 5.90, hosAvailable: 9.5, hosViolations: 0, accidents: 0, inspections: 0, inspectionClean: 0, onTimePickup: '96%', onTimeDelivery: '96%' },
  ];
}

function getFleetReport() {
  return [
    { unitNumber: 'T-1029', type: 'Truck', make: 'Freightliner', model: 'Cascadia', year: 2023, mileage: 142800, status: 'Active', driver: 'David Kim', lastService: '2026-03-15', nextService: '2026-05-15', insuranceExpiry: '2026-12-31', inspectionExpiry: '2026-09-15', monthlyFuel: 4200, monthlyMaintenance: 850 },
    { unitNumber: 'T-1033', type: 'Truck', make: 'Kenworth', model: 'T680', year: 2022, mileage: 198400, status: 'Active', driver: 'Lisa Nguyen', lastService: '2026-03-28', nextService: '2026-05-28', insuranceExpiry: '2026-11-15', inspectionExpiry: '2026-10-01', monthlyFuel: 4800, monthlyMaintenance: 1100 },
    { unitNumber: 'T-1038', type: 'Truck', make: 'Peterbilt', model: '579', year: 2024, mileage: 67200, status: 'Active', driver: 'Sarah Chen', lastService: '2026-04-01', nextService: '2026-06-01', insuranceExpiry: '2027-01-31', inspectionExpiry: '2027-01-15', monthlyFuel: 3600, monthlyMaintenance: 420 },
    { unitNumber: 'T-1042', type: 'Truck', make: 'Freightliner', model: 'Cascadia', year: 2022, mileage: 224100, status: 'Active', driver: 'Marcus Johnson', lastService: '2026-03-10', nextService: '2026-05-10', insuranceExpiry: '2026-10-31', inspectionExpiry: '2026-08-20', monthlyFuel: 5100, monthlyMaintenance: 1350 },
    { unitNumber: 'T-1055', type: 'Truck', make: 'International', model: 'LT', year: 2021, mileage: 312500, status: 'Active', driver: 'James Williams', lastService: '2026-03-22', nextService: '2026-05-22', insuranceExpiry: '2026-11-30', inspectionExpiry: '2026-09-01', monthlyFuel: 5400, monthlyMaintenance: 1800 },
    { unitNumber: 'T-1061', type: 'Truck', make: 'Kenworth', model: 'W990', year: 2024, mileage: 43600, status: 'Active', driver: 'Maria Rodriguez', lastService: '2026-04-05', nextService: '2026-06-05', insuranceExpiry: '2027-03-31', inspectionExpiry: '2027-04-01', monthlyFuel: 3200, monthlyMaintenance: 280 },
    { unitNumber: 'T-1075', type: 'Truck', make: 'Peterbilt', model: '389', year: 2020, mileage: 385200, status: 'In Shop', driver: 'Unassigned', lastService: '2026-04-10', nextService: '2026-04-25', insuranceExpiry: '2026-08-31', inspectionExpiry: '2026-05-15', monthlyFuel: 0, monthlyMaintenance: 8500 },
    { unitNumber: 'T-1082', type: 'Truck', make: 'Mack', model: 'Anthem', year: 2019, mileage: 421800, status: 'Out of Service', driver: 'Unassigned', lastService: '2026-02-05', nextService: '2026-04-05', insuranceExpiry: '2026-06-30', inspectionExpiry: '2026-04-01', monthlyFuel: 0, monthlyMaintenance: 0 },
  ];
}

function getARAgingReport() {
  return [
    { customer: 'Acme Corp - LAX', current: 3200, days1to30: 4200, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 7400, creditLimit: 500000, lastPayment: '2026-04-08' },
    { customer: 'Acme Corp - ORD', current: 4800, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 4800, creditLimit: 400000, lastPayment: '2026-04-10' },
    { customer: 'Acme Corp - EWR', current: 5600, days1to30: 6200, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 11800, creditLimit: 350000, lastPayment: '2026-03-28' },
    { customer: 'Acme Corp - DFW', current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 0, creditLimit: 250000, lastPayment: '2026-04-12' },
    { customer: 'Acme Corp - ATL', current: 1600, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 1600, creditLimit: 200000, lastPayment: '2026-04-12' },
    { customer: 'XPO Logistics', current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 0, creditLimit: 300000, lastPayment: '2026-04-09' },
    { customer: 'Echo Global Logistics', current: 2800, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 2800, creditLimit: 200000, lastPayment: '2026-04-05' },
  ];
}

function getMaintenanceReport() {
  return [
    { woNumber: 'WO-2026-0412', unit: 'T-1075', type: 'Repair', priority: 'Emergency', status: 'In Progress', vendor: 'Rush Truck Centers', description: 'Transmission rebuild', scheduledDate: '2026-04-10', estimatedCost: 8500, actualCost: 6200, laborHours: 14 },
    { woNumber: 'WO-2026-0415', unit: 'T-1082', type: 'Repair', priority: 'High', status: 'Open', vendor: 'Rush Truck Centers', description: 'Frame rail damage assessment', scheduledDate: '2026-04-15', estimatedCost: 15000, actualCost: 0, laborHours: 0 },
    { woNumber: 'WO-2026-0408', unit: 'TR-2240', type: 'Repair', priority: 'Medium', status: 'Waiting Parts', vendor: 'TA Petro - Nashville', description: 'Brake drum replacement', scheduledDate: '2026-04-11', estimatedCost: 1800, actualCost: 950, laborHours: 3 },
    { woNumber: 'WO-2026-0401', unit: 'T-1038', type: 'Preventive', priority: 'Medium', status: 'Completed', vendor: 'Rush Truck Centers', description: 'PM-A Service', scheduledDate: '2026-04-01', estimatedCost: 650, actualCost: 720, laborHours: 2.5 },
    { woNumber: 'WO-2026-0330', unit: 'T-1070', type: 'Tire', priority: 'Low', status: 'Completed', vendor: 'TA Petro - Nashville', description: 'Steer tire replacement', scheduledDate: '2026-03-30', estimatedCost: 1100, actualCost: 1050, laborHours: 1.5 },
    { woNumber: 'WO-2026-0325', unit: 'T-1042', type: 'DOT Inspection', priority: 'Medium', status: 'Completed', vendor: 'Rush Truck Centers', description: 'Annual DOT inspection', scheduledDate: '2026-03-25', estimatedCost: 350, actualCost: 380, laborHours: 3 },
  ];
}

function getIncidentReport() {
  return [
    { incidentNumber: 'INC-2026-042', type: 'Roadside Inspection', severity: 'Minor', date: '2026-04-10', driver: 'Robert Brown', unit: 'T-1070', location: 'I-65 SB, Mile 42, KY', status: 'Closed', preventable: 'N/A', cost: 0 },
    { incidentNumber: 'INC-2026-038', type: 'Accident', severity: 'Major', date: '2026-04-06', driver: 'James Williams', unit: 'T-1082', location: 'I-76 WB, Exit 28, PA', status: 'Under Review', preventable: 'No', cost: 15000 },
    { incidentNumber: 'INC-2026-035', type: 'HOS Violation', severity: 'Minor', date: '2026-04-02', driver: 'Marcus Johnson', unit: 'T-1042', location: 'Memphis, TN', status: 'Resolved', preventable: 'Yes', cost: 0 },
    { incidentNumber: 'INC-2026-029', type: 'Cargo Claim', severity: 'Minor', date: '2026-03-25', driver: 'Sarah Chen', unit: 'TR-2204', location: 'Dallas, TX', status: 'Resolved', preventable: 'Yes', cost: 3200 },
    { incidentNumber: 'INC-2026-022', type: 'Roadside Inspection', severity: 'Major', date: '2026-03-18', driver: 'David Kim', unit: 'T-1029', location: 'I-55 NB, Sikeston, MO', status: 'Closed', preventable: 'Yes', cost: 450 },
    { incidentNumber: 'INC-2026-018', type: 'Near Miss', severity: 'Info', date: '2026-03-12', driver: 'Maria Rodriguez', unit: 'T-1061', location: 'I-85 NB, Greenville, SC', status: 'Closed', preventable: 'No', cost: 0 },
  ];
}

function getProfitLossReport() {
  return [
    { category: 'Revenue', lineItem: 'Line Haul Revenue', month1: 385400, month2: 412800, month3: 398200, total: 1196400, pctOfRevenue: '82.4%' },
    { category: 'Revenue', lineItem: 'Fuel Surcharge Revenue', month1: 38540, month2: 41280, month3: 39820, total: 119640, pctOfRevenue: '8.2%' },
    { category: 'Revenue', lineItem: 'Accessorial Revenue', month1: 18200, month2: 21400, month3: 19800, total: 59400, pctOfRevenue: '4.1%' },
    { category: 'Revenue', lineItem: 'Detention / Layover', month1: 8400, month2: 6200, month3: 9100, total: 23700, pctOfRevenue: '1.6%' },
    { category: 'Revenue', lineItem: 'Brokerage Commission', month1: 18600, month2: 22100, month3: 19800, total: 60500, pctOfRevenue: '4.2%' },
    { category: 'Revenue', lineItem: 'TOTAL REVENUE', month1: 469140, month2: 503780, month3: 486720, total: 1459640, pctOfRevenue: '100.0%' },
    { category: '', lineItem: '', month1: '', month2: '', month3: '', total: '', pctOfRevenue: '' },
    { category: 'Direct Costs', lineItem: 'Driver Pay & Benefits', month1: 152200, month2: 163700, month3: 158100, total: 474000, pctOfRevenue: '32.5%' },
    { category: 'Direct Costs', lineItem: 'Fuel (Net of Surcharge)', month1: 89200, month2: 95400, month3: 92100, total: 276700, pctOfRevenue: '19.0%' },
    { category: 'Direct Costs', lineItem: 'Tolls', month1: 6800, month2: 7200, month3: 6900, total: 20900, pctOfRevenue: '1.4%' },
    { category: 'Direct Costs', lineItem: 'Cargo Claims', month1: 0, month2: 3200, month3: 0, total: 3200, pctOfRevenue: '0.2%' },
    { category: 'Direct Costs', lineItem: 'TOTAL DIRECT COSTS', month1: 248200, month2: 269500, month3: 257100, total: 774800, pctOfRevenue: '53.1%' },
    { category: '', lineItem: '', month1: '', month2: '', month3: '', total: '', pctOfRevenue: '' },
    { category: 'Gross Profit', lineItem: 'GROSS PROFIT', month1: 220940, month2: 234280, month3: 229620, total: 684840, pctOfRevenue: '46.9%' },
    { category: '', lineItem: '', month1: '', month2: '', month3: '', total: '', pctOfRevenue: '' },
    { category: 'Operating Expenses', lineItem: 'Truck Lease / Payments', month1: 42000, month2: 42000, month3: 42000, total: 126000, pctOfRevenue: '8.6%' },
    { category: 'Operating Expenses', lineItem: 'Trailer Lease / Payments', month1: 18500, month2: 18500, month3: 18500, total: 55500, pctOfRevenue: '3.8%' },
    { category: 'Operating Expenses', lineItem: 'Insurance (Liability + Cargo)', month1: 38400, month2: 38400, month3: 38400, total: 115200, pctOfRevenue: '7.9%' },
    { category: 'Operating Expenses', lineItem: 'Maintenance & Repairs', month1: 14200, month2: 18900, month3: 11800, total: 44900, pctOfRevenue: '3.1%' },
    { category: 'Operating Expenses', lineItem: 'Tires', month1: 3200, month2: 1050, month3: 4100, total: 8350, pctOfRevenue: '0.6%' },
    { category: 'Operating Expenses', lineItem: 'ELD / Technology', month1: 2400, month2: 2400, month3: 2400, total: 7200, pctOfRevenue: '0.5%' },
    { category: 'Operating Expenses', lineItem: 'Permits & Licenses', month1: 1800, month2: 1800, month3: 1800, total: 5400, pctOfRevenue: '0.4%' },
    { category: 'Operating Expenses', lineItem: 'Office & Administrative', month1: 8200, month2: 8200, month3: 8200, total: 24600, pctOfRevenue: '1.7%' },
    { category: 'Operating Expenses', lineItem: 'Factoring Fees (2.5%)', month1: 11728, month2: 12595, month3: 12168, total: 36491, pctOfRevenue: '2.5%' },
    { category: 'Operating Expenses', lineItem: 'Communications', month1: 1600, month2: 1600, month3: 1600, total: 4800, pctOfRevenue: '0.3%' },
    { category: 'Operating Expenses', lineItem: 'Professional Services', month1: 3500, month2: 3500, month3: 3500, total: 10500, pctOfRevenue: '0.7%' },
    { category: 'Operating Expenses', lineItem: 'TOTAL OPERATING EXPENSES', month1: 145530, month2: 148945, month3: 144468, total: 438943, pctOfRevenue: '30.1%' },
    { category: '', lineItem: '', month1: '', month2: '', month3: '', total: '', pctOfRevenue: '' },
    { category: 'Net Income', lineItem: 'NET INCOME (EBITDA)', month1: 75410, month2: 85335, month3: 85152, total: 245897, pctOfRevenue: '16.8%' },
    { category: 'Net Income', lineItem: 'Depreciation', month1: 12400, month2: 12400, month3: 12400, total: 37200, pctOfRevenue: '2.5%' },
    { category: 'Net Income', lineItem: 'Interest Expense', month1: 4200, month2: 4100, month3: 4000, total: 12300, pctOfRevenue: '0.8%' },
    { category: 'Net Income', lineItem: 'NET INCOME BEFORE TAX', month1: 58810, month2: 68835, month3: 68752, total: 196397, pctOfRevenue: '13.5%' },
  ];
}

function getLaneProfitReport() {
  return [
    { lane: 'Memphis, TN → Nashville, TN', loads: 12, miles: 5400, revenue: 38400, driverPay: 15600, fuel: 6480, tolls: 240, totalCost: 22320, grossProfit: 16080, margin: '41.9%' },
    { lane: 'Dallas, TX → Houston, TX', loads: 8, miles: 5760, revenue: 38400, driverPay: 16800, fuel: 6912, tolls: 180, totalCost: 23892, grossProfit: 14508, margin: '37.8%' },
    { lane: 'Gary, IN → Columbus, OH', loads: 6, miles: 5340, revenue: 33600, driverPay: 14400, fuel: 6408, tolls: 520, totalCost: 21328, grossProfit: 12272, margin: '36.5%' },
    { lane: 'Atlanta, GA → Jacksonville, FL', loads: 10, miles: 4100, revenue: 31000, driverPay: 12400, fuel: 4920, tolls: 340, totalCost: 17660, grossProfit: 13340, margin: '43.0%' },
    { lane: 'Chicago, IL → Indianapolis, IN', loads: 7, miles: 2800, revenue: 19600, driverPay: 8400, fuel: 3360, tolls: 420, totalCost: 12180, grossProfit: 7420, margin: '37.9%' },
    { lane: 'Denver, CO → Salt Lake City, UT', loads: 4, miles: 3920, revenue: 24800, driverPay: 10800, fuel: 4704, tolls: 120, totalCost: 15624, grossProfit: 9176, margin: '37.0%' },
    { lane: 'Nashville, TN → Louisville, KY', loads: 9, miles: 3420, revenue: 26100, driverPay: 10800, fuel: 4104, tolls: 280, totalCost: 15184, grossProfit: 10916, margin: '41.8%' },
  ];
}

function getDriverProfitReport() {
  return [
    { driver: 'Marcus Johnson', loads: 8, miles: 3200, revenue: 25600, driverPay: 1856, fuel: 3840, maint: 420, totalCost: 6116, grossProfit: 19484, margin: '76.1%', rpm: 8.00, cpm: 1.91 },
    { driver: 'Sarah Chen', loads: 6, miles: 2800, revenue: 33600, driverPay: 3024, fuel: 3360, maint: 380, totalCost: 6764, grossProfit: 26836, margin: '79.9%', rpm: 12.00, cpm: 2.42 },
    { driver: 'Robert Brown', loads: 7, miles: 2600, revenue: 20800, driverPay: 1430, fuel: 3120, maint: 510, totalCost: 5060, grossProfit: 15740, margin: '75.7%', rpm: 8.00, cpm: 1.95 },
    { driver: 'James Williams', loads: 5, miles: 3400, revenue: 28000, driverPay: 4250, fuel: 4080, maint: 290, totalCost: 8620, grossProfit: 19380, margin: '69.2%', rpm: 8.24, cpm: 2.54 },
    { driver: 'Maria Rodriguez', loads: 9, miles: 3800, revenue: 27360, driverPay: 2204, fuel: 4560, maint: 340, totalCost: 7104, grossProfit: 20256, margin: '74.1%', rpm: 7.20, cpm: 1.87 },
    { driver: 'David Kim', loads: 4, miles: 1900, revenue: 16800, driverPay: 2100, fuel: 2280, maint: 220, totalCost: 4600, grossProfit: 12200, margin: '72.6%', rpm: 8.84, cpm: 2.42 },
  ];
}

function getCustomerProfitReport() {
  return [
    { customer: 'Acme Corp - LAX', loads: 14, revenue: 44800, costs: 26880, profit: 17920, margin: '40.0%', avgRate: 3200, rpm: 7.11, terms: 'Net 30', avgDays: 28 },
    { customer: 'Acme Corp - ORD', loads: 10, revenue: 48000, costs: 30720, profit: 17280, margin: '36.0%', avgRate: 4800, rpm: 6.67, terms: 'Net 30', avgDays: 32 },
    { customer: 'Acme Corp - EWR', loads: 8, revenue: 44800, costs: 28672, profit: 16128, margin: '36.0%', avgRate: 5600, rpm: 6.29, terms: 'Net 45', avgDays: 42 },
    { customer: 'Acme Corp - DFW', loads: 12, revenue: 34800, costs: 19488, profit: 15312, margin: '44.0%', avgRate: 2900, rpm: 7.63, terms: 'Net 30', avgDays: 25 },
    { customer: 'XPO Logistics', loads: 5, revenue: 17000, costs: 10540, profit: 6460, margin: '38.0%', avgRate: 3400, rpm: 6.94, terms: 'Net 15', avgDays: 14 },
    { customer: 'Echo Global Logistics', loads: 3, revenue: 8400, costs: 5544, profit: 2856, margin: '34.0%', avgRate: 2800, rpm: 8.00, terms: 'Net 30', avgDays: 35 },
  ];
}

// ─ Report Configs ─
const REPORTS: ReportConfig[] = [
  {
    id: 'loads', name: 'Load Summary', description: 'All loads with route, driver, equipment, and rate breakdown', category: 'OPERATIONS', icon: '',
    columns: [
      { key: 'loadNumber', header: 'Load #', width: 12 }, { key: 'status', header: 'Status', width: 12 }, { key: 'customer', header: 'Customer', width: 20 },
      { key: 'origin', header: 'Origin', width: 16 }, { key: 'destination', header: 'Destination', width: 16 }, { key: 'pickupDate', header: 'Pickup Date', width: 14 },
      { key: 'deliveryDate', header: 'Delivery Date', width: 14 }, { key: 'driver', header: 'Driver', width: 18 }, { key: 'equipment', header: 'Equipment', width: 14 },
      { key: 'miles', header: 'Miles', width: 10 }, { key: 'lineHaul', header: 'Line Haul', width: 12 }, { key: 'fuelSurcharge', header: 'Fuel Surcharge', width: 14 },
      { key: 'accessorials', header: 'Accessorials', width: 14 }, { key: 'totalRate', header: 'Total Rate', width: 12 }, { key: 'ratePerMile', header: '$/Mile', width: 10 },
    ],
    getData: () => getLoadReport(),
  },
  {
    id: 'revenue', name: 'Revenue by Customer', description: 'Revenue breakdown per customer with avg rates and payment performance', category: 'FINANCIAL', icon: '',
    columns: [
      { key: 'customer', header: 'Customer', width: 22 }, { key: 'loads', header: 'Loads', width: 8 }, { key: 'totalRevenue', header: 'Total Revenue', width: 16 },
      { key: 'avgRatePerLoad', header: 'Avg Rate/Load', width: 14 }, { key: 'avgRatePerMile', header: 'Avg $/Mile', width: 12 }, { key: 'fuelSurcharge', header: 'Total Fuel SC', width: 14 },
      { key: 'accessorials', header: 'Total Accessorials', width: 16 }, { key: 'lastLoad', header: 'Last Load', width: 14 }, { key: 'paymentTerms', header: 'Terms', width: 10 },
      { key: 'avgDaysToPay', header: 'Avg Days to Pay', width: 14 },
    ],
    getData: () => getRevenueReport(),
  },
  {
    id: 'ar-aging', name: 'AR Aging Report', description: 'Accounts receivable aging by customer — current, 30, 60, 90+ day buckets', category: 'FINANCIAL', icon: '',
    columns: [
      { key: 'customer', header: 'Customer', width: 22 }, { key: 'current', header: 'Current', width: 12 }, { key: 'days1to30', header: '1-30 Days', width: 12 },
      { key: 'days31to60', header: '31-60 Days', width: 12 }, { key: 'days61to90', header: '61-90 Days', width: 12 }, { key: 'over90', header: '90+ Days', width: 12 },
      { key: 'totalOutstanding', header: 'Total Outstanding', width: 16 }, { key: 'creditLimit', header: 'Credit Limit', width: 14 }, { key: 'lastPayment', header: 'Last Payment', width: 14 },
    ],
    getData: () => getARAgingReport(),
  },
  {
    id: 'drivers', name: 'Driver Performance', description: 'Driver stats — loads, miles, revenue, safety, and on-time performance', category: 'DRIVER', icon: '',
    columns: [
      { key: 'driver', header: 'Driver', width: 18 }, { key: 'truckNumber', header: 'Truck', width: 10 }, { key: 'status', header: 'Status', width: 12 },
      { key: 'loads', header: 'Loads', width: 8 }, { key: 'miles', header: 'Miles', width: 10 }, { key: 'revenue', header: 'Revenue', width: 12 },
      { key: 'revenuePerMile', header: '$/Mile', width: 10 }, { key: 'hosAvailable', header: 'HOS Avail', width: 10 }, { key: 'hosViolations', header: 'HOS Violations', width: 14 },
      { key: 'accidents', header: 'Accidents', width: 10 }, { key: 'inspections', header: 'Inspections', width: 12 }, { key: 'onTimePickup', header: 'On-Time PU', width: 12 },
      { key: 'onTimeDelivery', header: 'On-Time DEL', width: 12 },
    ],
    getData: () => getDriverReport(),
  },
  {
    id: 'fleet', name: 'Fleet Summary', description: 'Vehicle status, mileage, service schedule, insurance, and monthly costs', category: 'FLEET', icon: '',
    columns: [
      { key: 'unitNumber', header: 'Unit #', width: 10 }, { key: 'type', header: 'Type', width: 8 }, { key: 'make', header: 'Make', width: 14 },
      { key: 'model', header: 'Model', width: 12 }, { key: 'year', header: 'Year', width: 8 }, { key: 'mileage', header: 'Mileage', width: 12 },
      { key: 'status', header: 'Status', width: 14 }, { key: 'driver', header: 'Driver', width: 16 }, { key: 'lastService', header: 'Last Service', width: 14 },
      { key: 'nextService', header: 'Next Service', width: 14 }, { key: 'insuranceExpiry', header: 'Ins. Expiry', width: 14 }, { key: 'inspectionExpiry', header: 'Insp. Expiry', width: 14 },
      { key: 'monthlyFuel', header: 'Monthly Fuel', width: 12 }, { key: 'monthlyMaintenance', header: 'Monthly Maint.', width: 14 },
    ],
    getData: () => getFleetReport(),
  },
  {
    id: 'maintenance', name: 'Maintenance Log', description: 'All work orders with vendor, cost, labor, and completion status', category: 'FLEET', icon: '',
    columns: [
      { key: 'woNumber', header: 'WO #', width: 16 }, { key: 'unit', header: 'Unit', width: 10 }, { key: 'type', header: 'Type', width: 14 },
      { key: 'priority', header: 'Priority', width: 12 }, { key: 'status', header: 'Status', width: 14 }, { key: 'vendor', header: 'Vendor', width: 22 },
      { key: 'description', header: 'Description', width: 30 }, { key: 'scheduledDate', header: 'Scheduled', width: 14 }, { key: 'estimatedCost', header: 'Est. Cost', width: 12 },
      { key: 'actualCost', header: 'Actual Cost', width: 12 }, { key: 'laborHours', header: 'Labor Hours', width: 12 },
    ],
    getData: () => getMaintenanceReport(),
  },
  {
    id: 'incidents', name: 'Safety Incidents', description: 'Incident log with severity, preventability, and cost impact', category: 'SAFETY', icon: '',
    columns: [
      { key: 'incidentNumber', header: 'Incident #', width: 16 }, { key: 'type', header: 'Type', width: 18 }, { key: 'severity', header: 'Severity', width: 10 },
      { key: 'date', header: 'Date', width: 14 }, { key: 'driver', header: 'Driver', width: 18 }, { key: 'unit', header: 'Unit', width: 10 },
      { key: 'location', header: 'Location', width: 24 }, { key: 'status', header: 'Status', width: 14 }, { key: 'preventable', header: 'Preventable', width: 12 },
      { key: 'cost', header: 'Cost', width: 10 },
    ],
    getData: () => getIncidentReport(),
  },
  {
    id: 'profit-loss', name: 'Profit & Loss Statement', description: 'Monthly P&L with revenue, direct costs, gross profit, operating expenses, and net income', category: 'FINANCIAL', icon: 'ˆ',
    columns: [
      { key: 'category', header: 'Category', width: 18 }, { key: 'lineItem', header: 'Line Item', width: 30 },
      { key: 'month1', header: 'Feb 2026', width: 14 }, { key: 'month2', header: 'Mar 2026', width: 14 }, { key: 'month3', header: 'Apr 2026', width: 14 },
      { key: 'total', header: 'Total (3 mo)', width: 16 }, { key: 'pctOfRevenue', header: '% of Revenue', width: 14 },
    ],
    getData: () => getProfitLossReport(),
  },
  {
    id: 'profit-lane', name: 'Profitability by Lane', description: 'Lane-level profitability — revenue, costs, gross profit, and margin per route', category: 'FINANCIAL', icon: '',
    columns: [
      { key: 'lane', header: 'Lane', width: 30 }, { key: 'loads', header: 'Loads', width: 8 }, { key: 'miles', header: 'Miles', width: 10 },
      { key: 'revenue', header: 'Revenue', width: 12 }, { key: 'driverPay', header: 'Driver Pay', width: 12 }, { key: 'fuel', header: 'Fuel', width: 10 },
      { key: 'tolls', header: 'Tolls', width: 8 }, { key: 'totalCost', header: 'Total Cost', width: 12 }, { key: 'grossProfit', header: 'Gross Profit', width: 12 },
      { key: 'margin', header: 'Margin %', width: 10 },
    ],
    getData: () => getLaneProfitReport(),
  },
  {
    id: 'profit-driver', name: 'Profitability by Driver', description: 'Driver-level profitability — revenue generated, costs, margin, and efficiency metrics', category: 'DRIVER', icon: '',
    columns: [
      { key: 'driver', header: 'Driver', width: 18 }, { key: 'loads', header: 'Loads', width: 8 }, { key: 'miles', header: 'Miles', width: 10 },
      { key: 'revenue', header: 'Revenue', width: 12 }, { key: 'driverPay', header: 'Driver Pay', width: 12 }, { key: 'fuel', header: 'Fuel', width: 10 },
      { key: 'maint', header: 'Maint', width: 10 }, { key: 'totalCost', header: 'Total Cost', width: 12 }, { key: 'grossProfit', header: 'Gross Profit', width: 12 },
      { key: 'margin', header: 'Margin %', width: 10 }, { key: 'rpm', header: 'Rev/Mi', width: 8 }, { key: 'cpm', header: 'Cost/Mi', width: 8 },
    ],
    getData: () => getDriverProfitReport(),
  },
  {
    id: 'profit-customer', name: 'Profitability by Customer', description: 'Customer-level profitability with margin analysis and payment performance', category: 'FINANCIAL', icon: '',
    columns: [
      { key: 'customer', header: 'Customer', width: 22 }, { key: 'loads', header: 'Loads', width: 8 }, { key: 'revenue', header: 'Revenue', width: 14 },
      { key: 'costs', header: 'Costs', width: 12 }, { key: 'profit', header: 'Profit', width: 12 }, { key: 'margin', header: 'Margin %', width: 10 },
      { key: 'avgRate', header: 'Avg Rate', width: 10 }, { key: 'rpm', header: '$/Mile', width: 8 }, { key: 'terms', header: 'Terms', width: 10 },
      { key: 'avgDays', header: 'Avg Days Pay', width: 12 },
    ],
    getData: () => getCustomerProfitReport(),
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  OPERATIONS: 'Operations',
  FINANCIAL: 'Financial',
  SAFETY: 'Safety',
  FLEET: 'Fleet',
  DRIVER: 'Driver',
};

const CATEGORY_COLORS: Record<string, string> = {
  OPERATIONS: 'bg-blue-100 text-blue-800',
  FINANCIAL: 'bg-green-100 text-green-800',
  SAFETY: 'bg-red-100 text-red-800',
  FLEET: 'bg-gray-100 text-gray-700',
  DRIVER: 'bg-purple-100 text-purple-800',
};

// ─ Component ─
export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('2026-03-13');
  const [endDate, setEndDate] = useState('2026-04-13');
  const [exporting, setExporting] = useState(false);

  const filteredReports = useMemo(() => {
    if (categoryFilter === 'All') return REPORTS;
    return REPORTS.filter(r => r.category === categoryFilter);
  }, [categoryFilter]);

  const reportData = useMemo(() => {
    if (!selectedReport) return [];
    return selectedReport.getData(startDate, endDate);
  }, [selectedReport, startDate, endDate]);

  const exportToExcel = useCallback((report: ReportConfig) => {
    setExporting(true);
    try {
      const data = report.getData(startDate, endDate);
      const ws = XLSX.utils.json_to_sheet(data, {
        header: report.columns.map(c => c.key),
      });

      // Set column headers
      report.columns.forEach((col, i) => {
        const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
        if (ws[cellRef]) ws[cellRef].v = col.header;
      });

      // Set column widths
      ws['!cols'] = report.columns.map(col => ({ wch: col.width || 14 }));

      // Format currency columns
      const currencyKeys = ['totalRate', 'lineHaul', 'fuelSurcharge', 'accessorials', 'totalRevenue', 'avgRatePerLoad',
        'current', 'days1to30', 'days31to60', 'days61to90', 'over90', 'totalOutstanding', 'creditLimit',
        'revenue', 'estimatedCost', 'actualCost', 'cost', 'monthlyFuel', 'monthlyMaintenance',
        'month1', 'month2', 'month3', 'total'];

      data.forEach((row, rowIdx) => {
        report.columns.forEach((col, colIdx) => {
          if (currencyKeys.includes(col.key)) {
            const cellRef = XLSX.utils.encode_cell({ c: colIdx, r: rowIdx + 1 });
            if (ws[cellRef] && typeof ws[cellRef].v === 'number') ws[cellRef].z = '$#,##0';
          }
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, report.name.slice(0, 31));

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `AXON_TMS_${report.id}_${dateStr}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [startDate, endDate]);

  return (
    <div>
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Period:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <span>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* ─ Category Filters ─ */}
      <div className="flex gap-1 mb-4">
        {['All', 'OPERATIONS', 'FINANCIAL', 'DRIVER', 'FLEET', 'SAFETY'].map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${categoryFilter === c ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {CATEGORY_LABELS[c] || 'All'}
          </button>
        ))}
      </div>

      {!selectedReport ? (
        /* ─ Report Cards Grid ─ */
        <div className="grid grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{report.icon}</span>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{report.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[report.category]}`}>
                  {CATEGORY_LABELS[report.category]}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{report.columns.length} columns</span>
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); exportToExcel(report); }}
                    className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                  >
                    Export Excel
                  </button>
                  <button className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─ Report Preview ─ */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back to Reports
              </button>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span>{selectedReport.icon}</span> {selectedReport.name}
                </h3>
                <p className="text-xs text-gray-400">{reportData.length} rows · {startDate} to {endDate}</p>
              </div>
            </div>
            <button
              onClick={() => exportToExcel(selectedReport)}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : '⬇ Download Excel'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {selectedReport.columns.map(col => (
                      <th key={col.key} className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, i) => {
                    const isBlankRow = Object.values(row).every(v => v === '');
                    const isTotalRow = typeof row.lineItem === 'string' && (row.lineItem.startsWith('TOTAL') || row.lineItem.startsWith('GROSS') || row.lineItem.startsWith('NET'));

                    if (isBlankRow) return <tr key={i}><td colSpan={selectedReport.columns.length} className="h-3" /></tr>;

                    return (
                    <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${isTotalRow ? 'bg-gray-50 font-semibold' : ''}`}>
                      {selectedReport.columns.map(col => {
                        const val = row[col.key];
                        const isCurrency = typeof val === 'number' && ['totalRate', 'lineHaul', 'fuelSurcharge', 'accessorials', 'totalRevenue',
                          'avgRatePerLoad', 'current', 'days1to30', 'days31to60', 'days61to90', 'over90', 'totalOutstanding', 'creditLimit',
                          'revenue', 'estimatedCost', 'actualCost', 'cost', 'monthlyFuel', 'monthlyMaintenance',
                          'month1', 'month2', 'month3', 'total'].includes(col.key);
                        const isMiles = col.key === 'miles' || col.key === 'mileage';
                        const isRate = col.key === 'ratePerMile' || col.key === 'avgRatePerMile' || col.key === 'revenuePerMile';
                        const isPctCol = col.key === 'pctOfRevenue';
                        const isNetIncome = isTotalRow && row.lineItem?.includes('NET INCOME');

                        return (
                          <td key={col.key} className={`px-3 py-2 whitespace-nowrap ${isCurrency || isMiles || isRate || isPctCol ? 'text-right' : ''} ${col.key === 'loadNumber' || col.key === 'woNumber' || col.key === 'incidentNumber' || col.key === 'unitNumber' ? 'text-blue-600 font-semibold' : isNetIncome ? 'text-green-700' : isTotalRow ? 'text-gray-900' : 'text-gray-700'}`}>
                            {isCurrency ? `$${val.toLocaleString()}` : isMiles ? `${val.toLocaleString()}` : isRate ? `$${val.toFixed(2)}` : val}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><strong className="text-gray-800">Rows:</strong> {reportData.length}</span>
              <span><strong className="text-gray-800">Columns:</strong> {selectedReport.columns.length}</span>
              <span className="text-gray-400">Period: {startDate} to {endDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
