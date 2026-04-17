import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

// Ã¢Ã¢€ Types Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
type AcctTab = 'ar_aging' | 'ap_aging' | 'invoices' | 'bills' | 'payments' | 'cargowise' | 'factoring';

interface Invoice {
  id: string; invoiceNumber: string; loadNumber: string; customer: string;
  invoiceDate: string; dueDate: string; amount: number; paid: number; balance: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'VOID';
  daysPastDue: number;
}

interface CarrierBill {
  id: string; billNumber: string; loadNumber: string; carrier: string;
  billDate: string; dueDate: string; amount: number; paid: number; balance: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'DISPUTED' | 'VOID';
  paymentTerms: string;
}

interface Payment {
  id: string; type: 'AR' | 'AP'; refNumber: string; entity: string; loadNumber: string;
  amount: number; method: 'ACH' | 'CHECK' | 'WIRE' | 'QUICK_PAY' | 'FACTORING';
  date: string; checkNumber: string; status: 'CLEARED' | 'PENDING' | 'FAILED';
}

// Ã¢Ã¢€ Mock Data Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-20260401', loadNumber: 'SH-10421', customer: 'Acme Manufacturing', invoiceDate: '2026-04-01', dueDate: '2026-05-01', amount: 2800, paid: 0, balance: 2800, status: 'SENT', daysPastDue: 0 },
  { id: 'inv2', invoiceNumber: 'INV-20260402', loadNumber: 'SH-10422', customer: 'Heartland Foods', invoiceDate: '2026-04-02', dueDate: '2026-05-02', amount: 3400, paid: 0, balance: 3400, status: 'SENT', daysPastDue: 0 },
  { id: 'inv3', invoiceNumber: 'INV-20260315', loadNumber: 'SH-10423', customer: 'Pacific Retail Group', invoiceDate: '2026-03-15', dueDate: '2026-03-30', amount: 1800, paid: 1800, balance: 0, status: 'PAID', daysPastDue: 0 },
  { id: 'inv4', invoiceNumber: 'INV-20260310', loadNumber: 'SH-10425', customer: 'Great Lakes Chemicals', invoiceDate: '2026-03-10', dueDate: '2026-04-09', amount: 1600, paid: 0, balance: 1600, status: 'OVERDUE', daysPastDue: 5 },
  { id: 'inv5', invoiceNumber: 'INV-20260301', loadNumber: 'SH-10429', customer: 'Summit Healthcare', invoiceDate: '2026-03-01', dueDate: '2026-03-31', amount: 1200, paid: 600, balance: 600, status: 'PARTIAL', daysPastDue: 14 },
  { id: 'inv6', invoiceNumber: 'INV-20260220', loadNumber: 'SH-10431', customer: 'NorthPoint Logistics', invoiceDate: '2026-02-20', dueDate: '2026-03-22', amount: 1500, paid: 0, balance: 1500, status: 'OVERDUE', daysPastDue: 23 },
  { id: 'inv7', invoiceNumber: 'INV-20260210', loadNumber: 'SH-10418', customer: 'Southeastern Steel', invoiceDate: '2026-02-10', dueDate: '2026-03-27', amount: 2200, paid: 0, balance: 2200, status: 'OVERDUE', daysPastDue: 18 },
  { id: 'inv8', invoiceNumber: 'INV-20260115', loadNumber: 'SH-10402', customer: 'Acme Manufacturing', invoiceDate: '2026-01-15', dueDate: '2026-02-14', amount: 3100, paid: 0, balance: 3100, status: 'OVERDUE', daysPastDue: 59 },
  { id: 'inv9', invoiceNumber: 'INV-20260403', loadNumber: 'SH-10426', customer: 'NorthPoint Logistics', invoiceDate: '2026-04-03', dueDate: '2026-05-03', amount: 1400, paid: 0, balance: 1400, status: 'DRAFT', daysPastDue: 0 },
  { id: 'inv10', invoiceNumber: 'INV-20260404', loadNumber: 'SH-10427', customer: 'Summit Healthcare', invoiceDate: '2026-04-04', dueDate: '2026-05-04', amount: 2600, paid: 0, balance: 2600, status: 'DRAFT', daysPastDue: 0 },
];

const MOCK_BILLS: CarrierBill[] = [
  { id: 'bl1', billNumber: 'BL-EFL-4521', loadNumber: 'SH-10421', carrier: 'Eagle Freight Lines', billDate: '2026-04-02', dueDate: '2026-04-16', amount: 2200, paid: 0, balance: 2200, status: 'APPROVED', paymentTerms: 'Quick Pay' },
  { id: 'bl2', billNumber: 'BL-ACC-4522', loadNumber: 'SH-10422', carrier: 'Arctic Cold Carriers', billDate: '2026-04-03', dueDate: '2026-04-18', amount: 2800, paid: 0, balance: 2800, status: 'PENDING', paymentTerms: 'Net 15' },
  { id: 'bl3', billNumber: 'BL-MET-4423', loadNumber: 'SH-10423', carrier: 'Midwest Express Trucking', billDate: '2026-03-16', dueDate: '2026-04-15', amount: 1350, paid: 1350, balance: 0, status: 'PAID', paymentTerms: 'Net 30' },
  { id: 'bl4', billNumber: 'BL-THR-4425', loadNumber: 'SH-10425', carrier: 'Thunder Road Inc.', billDate: '2026-03-12', dueDate: '2026-04-11', amount: 1200, paid: 0, balance: 1200, status: 'APPROVED', paymentTerms: 'Net 30' },
  { id: 'bl5', billNumber: 'BL-MET-4426', loadNumber: 'SH-10426', carrier: 'Midwest Express Trucking', billDate: '2026-04-04', dueDate: '2026-05-04', amount: 1050, paid: 0, balance: 1050, status: 'PENDING', paymentTerms: 'Net 30' },
  { id: 'bl6', billNumber: 'BL-EFL-4427', loadNumber: 'SH-10427', carrier: 'Eagle Freight Lines', billDate: '2026-04-05', dueDate: '2026-04-12', amount: 2100, paid: 0, balance: 2100, status: 'APPROVED', paymentTerms: 'Quick Pay' },
  { id: 'bl7', billNumber: 'BL-THR-4429', loadNumber: 'SH-10429', carrier: 'Thunder Road Inc.', billDate: '2026-03-10', dueDate: '2026-04-09', amount: 900, paid: 900, balance: 0, status: 'PAID', paymentTerms: 'Net 30' },
  { id: 'bl8', billNumber: 'BL-LSL-4431', loadNumber: 'SH-10431', carrier: 'Lone Star Logistics', billDate: '2026-03-09', dueDate: '2026-03-16', amount: 1100, paid: 1100, balance: 0, status: 'PAID', paymentTerms: 'Quick Pay' },
  { id: 'bl9', billNumber: 'BL-ACC-4432', loadNumber: 'SH-10432', carrier: 'Arctic Cold Carriers', billDate: '2026-04-05', dueDate: '2026-04-20', amount: 2500, paid: 0, balance: 2500, status: 'PENDING', paymentTerms: 'Net 15' },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'py1', type: 'AR', refNumber: 'INV-20260315', entity: 'Pacific Retail Group', loadNumber: 'SH-10423', amount: 1800, method: 'ACH', date: '2026-03-28', checkNumber: '', status: 'CLEARED' },
  { id: 'py2', type: 'AR', refNumber: 'INV-20260301', entity: 'Summit Healthcare', loadNumber: 'SH-10429', amount: 600, method: 'CHECK', date: '2026-04-05', checkNumber: '10442', status: 'CLEARED' },
  { id: 'py3', type: 'AP', refNumber: 'BL-MET-4423', entity: 'Midwest Express Trucking', loadNumber: 'SH-10423', amount: 1350, method: 'ACH', date: '2026-04-10', checkNumber: '', status: 'CLEARED' },
  { id: 'py4', type: 'AP', refNumber: 'BL-THR-4429', entity: 'Thunder Road Inc.', loadNumber: 'SH-10429', amount: 900, method: 'ACH', date: '2026-04-08', checkNumber: '', status: 'CLEARED' },
  { id: 'py5', type: 'AP', refNumber: 'BL-LSL-4431', entity: 'Lone Star Logistics', loadNumber: 'SH-10431', amount: 1100, method: 'QUICK_PAY', date: '2026-03-10', checkNumber: '', status: 'CLEARED' },
  { id: 'py6', type: 'AP', refNumber: 'BL-EFL-4521', entity: 'Eagle Freight Lines', loadNumber: 'SH-10421', amount: 2200, method: 'FACTORING', date: '2026-04-14', checkNumber: '', status: 'PENDING' },
];

// Ã¢Ã¢€ CargoWise Sync Data Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
interface CWSyncRecord {
  id: string; type: 'AR_INVOICE' | 'AP_BILL'; refNumber: string; loadNumber: string; entity: string;
  amount: number; cwJobNumber: string; syncStatus: 'NOT_SYNCED' | 'PUSHED' | 'JOB_CREATED' | 'INVOICE_MATCHED' | 'SENT' | 'CLOSED' | 'ERROR';
  lastSyncAt: string; errorMessage: string;
}

const MOCK_CW_SYNC: CWSyncRecord[] = [
  { id: 'cw1', type: 'AR_INVOICE', refNumber: 'INV-20260401', loadNumber: 'SH-10421', entity: 'Acme Manufacturing', amount: 2800, cwJobNumber: 'CW-BRK-20260401', syncStatus: 'INVOICE_MATCHED', lastSyncAt: '2026-04-14T10:00:00Z', errorMessage: '' },
  { id: 'cw2', type: 'AR_INVOICE', refNumber: 'INV-20260402', loadNumber: 'SH-10422', entity: 'Heartland Foods', amount: 3400, cwJobNumber: 'CW-BRK-20260402', syncStatus: 'JOB_CREATED', lastSyncAt: '2026-04-14T09:30:00Z', errorMessage: '' },
  { id: 'cw3', type: 'AR_INVOICE', refNumber: 'INV-20260315', loadNumber: 'SH-10423', entity: 'Pacific Retail Group', amount: 1800, cwJobNumber: 'CW-BRK-20260315', syncStatus: 'CLOSED', lastSyncAt: '2026-04-01T14:00:00Z', errorMessage: '' },
  { id: 'cw4', type: 'AR_INVOICE', refNumber: 'INV-20260310', loadNumber: 'SH-10425', entity: 'Great Lakes Chemicals', amount: 1600, cwJobNumber: 'CW-BRK-20260310', syncStatus: 'SENT', lastSyncAt: '2026-04-12T11:00:00Z', errorMessage: '' },
  { id: 'cw5', type: 'AR_INVOICE', refNumber: 'INV-20260403', loadNumber: 'SH-10426', entity: 'NorthPoint Logistics', amount: 1400, cwJobNumber: '', syncStatus: 'NOT_SYNCED', lastSyncAt: '', errorMessage: '' },
  { id: 'cw6', type: 'AR_INVOICE', refNumber: 'INV-20260404', loadNumber: 'SH-10427', entity: 'Summit Healthcare', amount: 2600, cwJobNumber: '', syncStatus: 'NOT_SYNCED', lastSyncAt: '', errorMessage: '' },
  { id: 'cw7', type: 'AP_BILL', refNumber: 'BL-EFL-4521', loadNumber: 'SH-10421', entity: 'Eagle Freight Lines', amount: 2200, cwJobNumber: 'CW-BRK-20260401', syncStatus: 'INVOICE_MATCHED', lastSyncAt: '2026-04-14T10:00:00Z', errorMessage: '' },
  { id: 'cw8', type: 'AP_BILL', refNumber: 'BL-ACC-4522', loadNumber: 'SH-10422', entity: 'Arctic Cold Carriers', amount: 2800, cwJobNumber: 'CW-BRK-20260402', syncStatus: 'PUSHED', lastSyncAt: '2026-04-14T09:30:00Z', errorMessage: '' },
  { id: 'cw9', type: 'AP_BILL', refNumber: 'BL-MET-4423', loadNumber: 'SH-10423', entity: 'Midwest Express Trucking', amount: 1350, cwJobNumber: 'CW-BRK-20260315', syncStatus: 'CLOSED', lastSyncAt: '2026-04-01T14:00:00Z', errorMessage: '' },
  { id: 'cw10', type: 'AP_BILL', refNumber: 'BL-ACC-4432', loadNumber: 'SH-10432', entity: 'Arctic Cold Carriers', amount: 2500, cwJobNumber: '', syncStatus: 'ERROR', lastSyncAt: '2026-04-14T08:00:00Z', errorMessage: 'CW validation failed: missing carrier SCAC code' },
];

const CW_STATUS_FLOW = ['NOT_SYNCED', 'PUSHED', 'JOB_CREATED', 'INVOICE_MATCHED', 'SENT', 'CLOSED'];
const CW_STATUS_BADGE: Record<string, string> = { NOT_SYNCED: 'bg-gray-100 text-gray-500', PUSHED: 'bg-blue-100 text-blue-800', JOB_CREATED: 'bg-indigo-100 text-indigo-800', INVOICE_MATCHED: 'bg-purple-100 text-purple-800', SENT: 'bg-orange-100 text-orange-800', CLOSED: 'bg-green-100 text-green-800', ERROR: 'bg-red-100 text-red-800' };
const CW_STATUS_LABEL: Record<string, string> = { NOT_SYNCED: 'Not Synced', PUSHED: 'Pushed to CW', JOB_CREATED: 'Job Created', INVOICE_MATCHED: 'Invoice Matched', SENT: 'Sent & Pending', CLOSED: 'Closed & Paid', ERROR: 'Error' };

// Ã¢Ã¢€ Factoring / Quick-Pay Data Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
interface FactoringRecord {
  id: string; billNumber: string; loadNumber: string; carrier: string; amount: number;
  factoringCompany: string; factoringStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'FUNDED' | 'REJECTED' | 'RECOURSE';
  submittedAt: string; fundedAt: string; fee: number; feeType: 'FLAT' | 'PERCENT'; netAmount: number;
  paymentMethod: 'QUICK_PAY' | 'STANDARD' | 'SAME_DAY'; remitTo: string; notes: string;
}

const MOCK_FACTORING: FactoringRecord[] = [
  { id: 'f1', billNumber: 'BL-EFL-4521', loadNumber: 'SH-10421', carrier: 'Eagle Freight Lines', amount: 2200, factoringCompany: 'RTS Financial', factoringStatus: 'FUNDED', submittedAt: '2026-04-13T14:00:00Z', fundedAt: '2026-04-13T16:00:00Z', fee: 66.00, feeType: 'PERCENT', netAmount: 2134.00, paymentMethod: 'QUICK_PAY', remitTo: 'RTS Financial Services', notes: 'Quick pay Ã¢funded same day' },
  { id: 'f2', billNumber: 'BL-EFL-4427', loadNumber: 'SH-10427', carrier: 'Eagle Freight Lines', amount: 2100, factoringCompany: 'RTS Financial', factoringStatus: 'SUBMITTED', submittedAt: '2026-04-14T10:00:00Z', fundedAt: '', fee: 63.00, feeType: 'PERCENT', netAmount: 2037.00, paymentMethod: 'QUICK_PAY', remitTo: 'RTS Financial Services', notes: 'Awaiting RTS approval' },
  { id: 'f3', billNumber: 'BL-ACC-4522', loadNumber: 'SH-10422', carrier: 'Arctic Cold Carriers', amount: 2800, factoringCompany: '', factoringStatus: 'PENDING', submittedAt: '', fundedAt: '', fee: 0, feeType: 'FLAT', netAmount: 2800, paymentMethod: 'STANDARD', remitTo: 'Arctic Cold Carriers', notes: 'No factoring Ã¢Net 15 direct pay' },
  { id: 'f4', billNumber: 'BL-THR-4425', loadNumber: 'SH-10425', carrier: 'Thunder Road Inc.', amount: 1200, factoringCompany: '', factoringStatus: 'PENDING', submittedAt: '', fundedAt: '', fee: 0, feeType: 'FLAT', netAmount: 1200, paymentMethod: 'STANDARD', remitTo: 'Thunder Road Inc.', notes: 'Net 30 Ã¢no factoring' },
  { id: 'f5', billNumber: 'BL-LSL-4431', loadNumber: 'SH-10431', carrier: 'Lone Star Logistics', amount: 1100, factoringCompany: 'OTR Solutions', factoringStatus: 'FUNDED', submittedAt: '2026-03-09T12:00:00Z', fundedAt: '2026-03-09T14:00:00Z', fee: 33.00, feeType: 'PERCENT', netAmount: 1067.00, paymentMethod: 'QUICK_PAY', remitTo: 'OTR Solutions', notes: 'Quick pay Ã¢funded same day' },
  { id: 'f6', billNumber: 'BL-MET-4426', loadNumber: 'SH-10426', carrier: 'Midwest Express Trucking', amount: 1050, factoringCompany: '', factoringStatus: 'PENDING', submittedAt: '', fundedAt: '', fee: 0, feeType: 'FLAT', netAmount: 1050, paymentMethod: 'STANDARD', remitTo: 'Midwest Express Trucking', notes: 'Net 30 direct' },
  { id: 'f7', billNumber: 'BL-ACC-4432', loadNumber: 'SH-10432', carrier: 'Arctic Cold Carriers', amount: 2500, factoringCompany: 'TriumphPay', factoringStatus: 'APPROVED', submittedAt: '2026-04-14T08:00:00Z', fundedAt: '', fee: 50.00, feeType: 'FLAT', netAmount: 2450.00, paymentMethod: 'SAME_DAY', remitTo: 'TriumphPay Network', notes: 'TriumphPay approved Ã¢pending funding' },
  { id: 'f8', billNumber: 'BL-SFS-4433', loadNumber: 'SH-10420', carrier: 'Summit Flatbed Services', amount: 3200, factoringCompany: 'TriumphPay', factoringStatus: 'REJECTED', submittedAt: '2026-04-12T09:00:00Z', fundedAt: '', fee: 0, feeType: 'FLAT', netAmount: 3200, paymentMethod: 'QUICK_PAY', remitTo: 'TriumphPay Network', notes: 'Rejected Ã¢carrier insurance expired. Resubmit after renewal.' },
];

const FACTORING_STATUS_BADGE: Record<string, string> = { PENDING: 'bg-gray-100 text-gray-600', SUBMITTED: 'bg-blue-100 text-blue-800', APPROVED: 'bg-indigo-100 text-indigo-800', FUNDED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800', RECOURSE: 'bg-orange-100 text-orange-800' };
const FACTORING_COMPANY_BADGE: Record<string, string> = { 'TriumphPay': 'bg-purple-100 text-purple-800', 'RTS Financial': 'bg-blue-100 text-blue-800', 'OTR Solutions': 'bg-teal-100 text-teal-800' };
const PAY_METHOD_LABEL: Record<string, string> = { QUICK_PAY: 'Quick Pay (2-4 hrs)', SAME_DAY: 'Same Day', STANDARD: 'Standard (Net terms)' };

// Ã¢Ã¢€ Helpers Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ã¢'; }

const INV_STATUS: Record<string, string> = { DRAFT: 'bg-gray-100 text-gray-600', SENT: 'bg-blue-100 text-blue-800', PAID: 'bg-green-100 text-green-800', PARTIAL: 'bg-yellow-100 text-yellow-800', OVERDUE: 'bg-red-100 text-red-800', VOID: 'bg-gray-200 text-gray-500' };
const BILL_STATUS: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-blue-100 text-blue-800', PAID: 'bg-green-100 text-green-800', DISPUTED: 'bg-red-100 text-red-800', VOID: 'bg-gray-200 text-gray-500' };
const PAY_METHOD: Record<string, string> = { ACH: 'bg-blue-100 text-blue-800', CHECK: 'bg-gray-100 text-gray-700', WIRE: 'bg-purple-100 text-purple-800', QUICK_PAY: 'bg-orange-100 text-orange-800', FACTORING: 'bg-teal-100 text-teal-800' };

// Ã¢Ã¢€ Component Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€
export function BrokerageAccounting() {
  const [activeTab, setActiveTab] = useState<AcctTab>('ar_aging');

  const arAging = useMemo(() => {
    const open = MOCK_INVOICES.filter(i => i.balance > 0 && i.status !== 'VOID' && i.status !== 'DRAFT');
    return {
      current: open.filter(i => i.daysPastDue === 0).reduce((s, i) => s + i.balance, 0),
      days1_30: open.filter(i => i.daysPastDue >= 1 && i.daysPastDue <= 30).reduce((s, i) => s + i.balance, 0),
      days31_60: open.filter(i => i.daysPastDue >= 31 && i.daysPastDue <= 60).reduce((s, i) => s + i.balance, 0),
      days61_90: open.filter(i => i.daysPastDue >= 61 && i.daysPastDue <= 90).reduce((s, i) => s + i.balance, 0),
      days90plus: open.filter(i => i.daysPastDue > 90).reduce((s, i) => s + i.balance, 0),
      total: open.reduce((s, i) => s + i.balance, 0),
      countCurrent: open.filter(i => i.daysPastDue === 0).length,
      count1_30: open.filter(i => i.daysPastDue >= 1 && i.daysPastDue <= 30).length,
      count31_60: open.filter(i => i.daysPastDue >= 31 && i.daysPastDue <= 60).length,
      count61_90: open.filter(i => i.daysPastDue >= 61 && i.daysPastDue <= 90).length,
      count90plus: open.filter(i => i.daysPastDue > 90).length,
    };
  }, []);

  const apAging = useMemo(() => {
    const open = MOCK_BILLS.filter(b => b.balance > 0 && b.status !== 'VOID');
    const now = Date.now();
    const getDays = (d: string) => Math.max(0, Math.ceil((now - new Date(d).getTime()) / 86400000));
    return {
      current: open.filter(b => getDays(b.dueDate) === 0 || new Date(b.dueDate) > new Date()).reduce((s, b) => s + b.balance, 0),
      days1_30: open.filter(b => { const d = getDays(b.dueDate); return d >= 1 && d <= 30 && new Date(b.dueDate) <= new Date(); }).reduce((s, b) => s + b.balance, 0),
      total: open.reduce((s, b) => s + b.balance, 0),
    };
  }, []);

  const TABS: { id: AcctTab; label: string; count?: number }[] = [
    { id: 'ar_aging', label: 'AR Aging', count: MOCK_INVOICES.filter(i => i.status === 'OVERDUE').length },
    { id: 'ap_aging', label: 'AP Aging', count: MOCK_BILLS.filter(b => b.status === 'APPROVED').length },
    { id: 'invoices', label: 'Invoices', count: MOCK_INVOICES.length },
    { id: 'bills', label: 'Carrier Bills', count: MOCK_BILLS.length },
    { id: 'payments', label: 'Payments', count: MOCK_PAYMENTS.length },
    { id: 'cargowise', label: 'CargoWise Sync', count: MOCK_CW_SYNC.filter(r => r.syncStatus === 'ERROR' || r.syncStatus === 'NOT_SYNCED').length },
    { id: 'factoring', label: 'Factoring / Quick-Pay', count: MOCK_FACTORING.filter(f => f.factoringStatus === 'SUBMITTED' || f.factoringStatus === 'APPROVED').length },
  ];

  const exportTable = () => {
    let data: any[]; let name: string;
    if (activeTab === 'invoices' || activeTab === 'ar_aging') {
      data = MOCK_INVOICES.map(i => ({ 'Invoice #': i.invoiceNumber, Load: i.loadNumber, Customer: i.customer, 'Invoice Date': i.invoiceDate, 'Due Date': i.dueDate, Amount: i.amount, Paid: i.paid, Balance: i.balance, Status: i.status, 'Days Past Due': i.daysPastDue }));
      name = 'AR_Invoices';
    } else if (activeTab === 'bills' || activeTab === 'ap_aging') {
      data = MOCK_BILLS.map(b => ({ 'Bill #': b.billNumber, Load: b.loadNumber, Carrier: b.carrier, 'Bill Date': b.billDate, 'Due Date': b.dueDate, Amount: b.amount, Paid: b.paid, Balance: b.balance, Status: b.status, Terms: b.paymentTerms }));
      name = 'AP_Bills';
    } else {
      data = MOCK_PAYMENTS.map(p => ({ Type: p.type, Ref: p.refNumber, Entity: p.entity, Load: p.loadNumber, Amount: p.amount, Method: p.method, Date: p.date, 'Check #': p.checkNumber || 'Ã¢', Status: p.status }));
      name = 'Payments';
    }
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `AXON_Brokerage_${name}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Brokerage Accounting</h2>
        <button onClick={exportTable} className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Export to Excel</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">AR Outstanding</p><p className="text-xl font-bold text-gray-900">{fmtCurrency(arAging.total)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">AR Overdue</p><p className={`text-xl font-bold ${arAging.days1_30 + arAging.days31_60 + arAging.days61_90 + arAging.days90plus > 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtCurrency(arAging.days1_30 + arAging.days31_60 + arAging.days61_90 + arAging.days90plus)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">AP Outstanding</p><p className="text-xl font-bold text-gray-900">{fmtCurrency(apAging.total)}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Draft Invoices</p><p className="text-xl font-bold text-yellow-600">{MOCK_INVOICES.filter(i => i.status === 'DRAFT').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Pending Bills</p><p className="text-xl font-bold text-yellow-600">{MOCK_BILLS.filter(b => b.status === 'PENDING').length}</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Net Position</p><p className={`text-xl font-bold ${arAging.total - apAging.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtCurrency(arAging.total - apAging.total)}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {t.count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Ã¢Ã¢€ AR Aging Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'ar_aging' && (
        <div>
          {/* Aging Buckets */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            {[
              { label: 'Current', amount: arAging.current, count: arAging.countCurrent, color: 'border-green-400 bg-green-50' },
              { label: '1-30 Days', amount: arAging.days1_30, count: arAging.count1_30, color: 'border-yellow-400 bg-yellow-50' },
              { label: '31-60 Days', amount: arAging.days31_60, count: arAging.count31_60, color: 'border-orange-400 bg-orange-50' },
              { label: '61-90 Days', amount: arAging.days61_90, count: arAging.count61_90, color: 'border-red-400 bg-red-50' },
              { label: '90+ Days', amount: arAging.days90plus, count: arAging.count90plus, color: 'border-red-600 bg-red-100' },
              { label: 'Total Outstanding', amount: arAging.total, count: arAging.countCurrent + arAging.count1_30 + arAging.count31_60 + arAging.count61_90 + arAging.count90plus, color: 'border-gray-400 bg-gray-50' },
            ].map(b => (
              <div key={b.label} className={`rounded-lg p-3 border-l-4 ${b.color}`}>
                <p className="text-xs text-gray-500 mb-1">{b.label}</p>
                <p className="text-lg font-bold text-gray-900">{fmtCurrency(b.amount)}</p>
                <p className="text-xs text-gray-400 mt-1">{b.count} invoice{b.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
          {/* Overdue Invoices Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100"><h4 className="text-sm font-semibold text-red-800">Overdue Invoices</h4></div>
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Invoice #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customer</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Due Date</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Balance</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Days Past Due</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Aging Bucket</th>
            </tr></thead><tbody>
              {MOCK_INVOICES.filter(i => i.daysPastDue > 0 && i.balance > 0).sort((a, b) => b.daysPastDue - a.daysPastDue).map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-semibold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{inv.loadNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{inv.customer}</td>
                  <td className="px-3 py-2.5 text-gray-600">{fmtDate(inv.dueDate)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(inv.amount)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-red-600">{fmtCurrency(inv.balance)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-red-600">{inv.daysPastDue}d</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.daysPastDue <= 30 ? 'bg-yellow-100 text-yellow-800' : inv.daysPastDue <= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{inv.daysPastDue <= 30 ? '1-30' : inv.daysPastDue <= 60 ? '31-60' : inv.daysPastDue <= 90 ? '61-90' : '90+'}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>

          {/* Auto-Dunning Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><h4 className="text-sm font-semibold text-gray-900">Auto-Dunning Emails</h4><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">Active</span></div></div>
              <div className="flex gap-2"><button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit Templates</button><button className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Send All Overdue Notices Now</button></div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {[
                { trigger: '7 days past due', template: 'Friendly Reminder', subject: 'Invoice [#] Ã¢Payment Reminder', enabled: true, sent: '3 sent today' },
                { trigger: '30 days past due', template: 'First Notice', subject: 'Invoice [#] Ã¢Past Due Notice', enabled: true, sent: '2 sent this week' },
                { trigger: '60 days past due', template: 'Escalation', subject: 'URGENT: Invoice [#] Ã¢60 Days Past Due', enabled: true, sent: '1 sent' },
                { trigger: '90+ days past due', template: 'Final Notice', subject: 'FINAL NOTICE: Invoice [#] Ã¢Collections Warning', enabled: true, sent: '0 this period' },
              ].map((d, i) => (
                <div key={i} className="rounded-lg p-3 border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-1.5"><span className="text-xs font-bold text-gray-800">{d.trigger}</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={d.enabled} className="sr-only peer" /><div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600" /></label></div>
                  <p className="text-xs text-gray-600 mb-0.5">{d.template}</p>
                  <p className="text-xs text-gray-400 truncate">{d.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">{d.sent}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400"><span>CC: accounting@axontms.com</span><span>Ã‚·</span><span>Auto-send daily at 9:00 AM EST</span><span>Ã‚·</span><span>Skip weekends & holidays</span></div>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ AP Aging Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'ap_aging' && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg p-3 border-l-4 border-green-400 bg-green-50"><p className="text-xs text-gray-500 mb-1">Not Yet Due</p><p className="text-lg font-bold text-gray-900">{fmtCurrency(apAging.current)}</p></div>
            <div className="rounded-lg p-3 border-l-4 border-yellow-400 bg-yellow-50"><p className="text-xs text-gray-500 mb-1">Past Due</p><p className="text-lg font-bold text-gray-900">{fmtCurrency(apAging.days1_30)}</p></div>
            <div className="rounded-lg p-3 border-l-4 border-gray-400 bg-gray-50"><p className="text-xs text-gray-500 mb-1">Total AP Outstanding</p><p className="text-lg font-bold text-gray-900">{fmtCurrency(apAging.total)}</p></div>
            <div className="rounded-lg p-3 border-l-4 border-blue-400 bg-blue-50"><p className="text-xs text-gray-500 mb-1">Pending Approval</p><p className="text-lg font-bold text-blue-600">{MOCK_BILLS.filter(b => b.status === 'PENDING').length} bills</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200"><h4 className="text-sm font-semibold text-gray-800">Open Carrier Bills</h4></div>
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Bill #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Due Date</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Terms</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Balance</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
            </tr></thead><tbody>
              {MOCK_BILLS.filter(b => b.balance > 0).map(b => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-semibold text-blue-600">{b.billNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{b.loadNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{b.carrier}</td>
                  <td className="px-3 py-2.5 text-gray-600">{fmtDate(b.dueDate)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{b.paymentTerms}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(b.amount)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{fmtCurrency(b.balance)}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ All Invoices Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Invoice #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Customer</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Invoice Date</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Due Date</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Paid</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Balance</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          </tr></thead><tbody>
            {MOCK_INVOICES.map(inv => (
              <tr key={inv.id} className={`border-b border-gray-100 hover:bg-gray-50 ${inv.status === 'OVERDUE' ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2.5 font-semibold text-blue-600">{inv.invoiceNumber}</td>
                <td className="px-3 py-2.5 text-gray-700">{inv.loadNumber}</td>
                <td className="px-3 py-2.5 text-gray-700">{inv.customer}</td>
                <td className="px-3 py-2.5 text-gray-600">{fmtDate(inv.invoiceDate)}</td>
                <td className="px-3 py-2.5 text-gray-600">{fmtDate(inv.dueDate)}</td>
                <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(inv.amount)}</td>
                <td className="px-3 py-2.5 text-right text-green-600">{inv.paid > 0 ? fmtCurrency(inv.paid) : 'Ã¢'}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{fmtCurrency(inv.balance)}</td>
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INV_STATUS[inv.status]}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody></table>
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
            <span>Total: <strong>{fmtCurrency(MOCK_INVOICES.reduce((s, i) => s + i.amount, 0))}</strong></span>
            <span>Paid: <strong className="text-green-600">{fmtCurrency(MOCK_INVOICES.reduce((s, i) => s + i.paid, 0))}</strong></span>
            <span>Outstanding: <strong className="text-red-600">{fmtCurrency(MOCK_INVOICES.reduce((s, i) => s + i.balance, 0))}</strong></span>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ Carrier Bills Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'bills' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Bill #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Bill Date</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Due Date</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Terms</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Paid</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Balance</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          </tr></thead><tbody>
            {MOCK_BILLS.map(b => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5 font-semibold text-blue-600">{b.billNumber}</td>
                <td className="px-3 py-2.5 text-gray-700">{b.loadNumber}</td>
                <td className="px-3 py-2.5 text-gray-700">{b.carrier}</td>
                <td className="px-3 py-2.5 text-gray-600">{fmtDate(b.billDate)}</td>
                <td className="px-3 py-2.5 text-gray-600">{fmtDate(b.dueDate)}</td>
                <td className="px-3 py-2.5 text-gray-600">{b.paymentTerms}</td>
                <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(b.amount)}</td>
                <td className="px-3 py-2.5 text-right text-green-600">{b.paid > 0 ? fmtCurrency(b.paid) : 'Ã¢'}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{fmtCurrency(b.balance)}</td>
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BILL_STATUS[b.status]}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody></table>
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
            <span>Total: <strong>{fmtCurrency(MOCK_BILLS.reduce((s, b) => s + b.amount, 0))}</strong></span>
            <span>Paid: <strong className="text-green-600">{fmtCurrency(MOCK_BILLS.reduce((s, b) => s + b.paid, 0))}</strong></span>
            <span>Outstanding: <strong className="text-red-600">{fmtCurrency(MOCK_BILLS.reduce((s, b) => s + b.balance, 0))}</strong></span>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ Payments Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Ref #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Entity</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Method</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Check #</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
          </tr></thead><tbody>
            {MOCK_PAYMENTS.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.type === 'AR' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.type}</span></td>
                <td className="px-3 py-2.5 font-mono text-gray-700">{p.refNumber}</td>
                <td className="px-3 py-2.5 text-gray-700">{p.entity}</td>
                <td className="px-3 py-2.5 text-gray-600">{p.loadNumber}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{fmtCurrency(p.amount)}</td>
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAY_METHOD[p.method]}`}>{p.method.replace('_', ' ')}</span></td>
                <td className="px-3 py-2.5 text-gray-600">{fmtDate(p.date)}</td>
                <td className="px-3 py-2.5 text-gray-500 font-mono">{p.checkNumber || 'Ã¢'}</td>
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'CLEARED' ? 'bg-green-100 text-green-800' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody></table>
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
            <span>AR Received: <strong className="text-green-600">{fmtCurrency(MOCK_PAYMENTS.filter(p => p.type === 'AR').reduce((s, p) => s + p.amount, 0))}</strong></span>
            <span>AP Paid: <strong className="text-blue-600">{fmtCurrency(MOCK_PAYMENTS.filter(p => p.type === 'AP').reduce((s, p) => s + p.amount, 0))}</strong></span>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ CargoWise Sync Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'cargowise' && (
        <div>
          {/* Sync Status Cards */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {CW_STATUS_FLOW.map(status => {
              const count = MOCK_CW_SYNC.filter(r => r.syncStatus === status).length;
              return (
                <div key={status} className={`rounded-lg p-2.5 text-center border ${count > 0 ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{CW_STATUS_LABEL[status]}</p>
                </div>
              );
            })}
            <div className={`rounded-lg p-2.5 text-center border ${MOCK_CW_SYNC.some(r => r.syncStatus === 'ERROR') ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-lg font-bold ${MOCK_CW_SYNC.some(r => r.syncStatus === 'ERROR') ? 'text-red-600' : 'text-gray-400'}`}>{MOCK_CW_SYNC.filter(r => r.syncStatus === 'ERROR').length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Errors</p>
            </div>
          </div>

          {/* Sync Progress Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">CargoWise Sync Lifecycle</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Force Sync Now</button>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">View Sync Log</button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {CW_STATUS_FLOW.map((status, i) => (
                <div key={status} className="flex items-center flex-1">
                  <div className={`flex-1 h-2 rounded-full ${MOCK_CW_SYNC.filter(r => CW_STATUS_FLOW.indexOf(r.syncStatus) >= i).length > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  {i < CW_STATUS_FLOW.length - 1 && <span className="text-gray-300 mx-0.5"></span>}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              {CW_STATUS_FLOW.map(s => <span key={s}>{CW_STATUS_LABEL[s]}</span>)}
            </div>
          </div>

          {/* Connection & Auto-Sync Configuration */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left: Connection Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">CargoWise Connection</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-semibold text-green-800">Connected Ã¢Live Sync Active</span></div>
                  <span className="text-xs text-green-600">Heartbeat: 2 min ago</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Environment</p><p className="text-sm font-bold text-gray-900">Production</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Company Code</p><p className="text-sm font-bold text-gray-900">GMEX-PROD</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">API Version</p><p className="text-sm font-bold text-gray-900">eHub v3.2</p></div>
                  <div className="bg-gray-50 rounded-lg p-2.5"><p className="text-xs text-gray-500">Sync Mode</p><p className="text-sm font-bold text-blue-600">Bidirectional</p></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Today's Sync Activity</span><span className="text-gray-700 font-medium">148 transactions</span></div>
                  <div className="flex gap-3 text-xs"><span className="text-green-600">Ã¢‘ 82 pushed</span><span className="text-blue-600">Ã¢“ 66 pulled</span><span className="text-red-600">Ã¢Å“• 1 error</span></div>
                </div>
              </div>
            </div>

            {/* Right: Auto-Sync Triggers */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Automatic Sync Triggers</h4>
              <div className="space-y-1.5">
                {[
                  { event: 'Shipment Created', desc: 'Auto-create CW Forwarding Job when new shipment is entered', direction: 'Ã¢‘ Push', enabled: true, module: 'Shipments' },
                  { event: 'Carrier Assigned', desc: 'Push carrier details and rate to CW job when carrier is booked', direction: 'Ã¢‘ Push', enabled: true, module: 'Shipments' },
                  { event: 'Status Changed', desc: 'Sync pickup, in-transit, delivered status to CW milestones', direction: 'Ã¢‘ Push', enabled: true, module: 'Operations' },
                  { event: 'Invoice Generated', desc: 'Auto-create AR invoice in CW when shipment invoice is finalized', direction: 'Ã¢‘ Push', enabled: true, module: 'AR' },
                  { event: 'Carrier Bill Approved', desc: 'Auto-create AP voucher in CW when carrier bill is approved', direction: 'Ã¢‘ Push', enabled: true, module: 'AP' },
                  { event: 'Payment Received', desc: 'Pull payment data from CW when customer pays invoice', direction: 'Ã¢“ Pull', enabled: true, module: 'AR' },
                  { event: 'Payment Sent', desc: 'Pull payment confirmation from CW after carrier is paid', direction: 'Ã¢“ Pull', enabled: true, module: 'AP' },
                  { event: 'CW Job Updated', desc: 'Pull any manual CW changes back to TMS (rates, dates, refs)', direction: 'Ã¢“ Pull', enabled: true, module: 'Sync' },
                  { event: 'Document Attached', desc: 'Push BOL, POD, rate con to CW document management', direction: 'Ã¢‘ Push', enabled: false, module: 'Documents' },
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

          {/* Field Mapping & Sync Schedule */}
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
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Field Mapping Ã¢AR</h4>
              <div className="space-y-1 text-xs">
                {[
                  { tms: 'Shipment ID', cw: 'Job Reference' },
                  { tms: 'Customer', cw: 'Debtor Organization' },
                  { tms: 'Shipper Rate', cw: 'Revenue Charge Line' },
                  { tms: 'Invoice #', cw: 'AR Invoice Number' },
                  { tms: 'Due Date', cw: 'Payment Due Date' },
                  { tms: 'Load Origin', cw: 'Origin Port/City' },
                  { tms: 'Load Destination', cw: 'Destination Port/City' },
                ].map(m => (
                  <div key={m.tms} className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
                    <span className="flex-1 text-gray-700 font-medium">{m.tms}</span>
                    <span className="text-gray-300">Ã¢’</span>
                    <span className="flex-1 text-blue-600">{m.cw}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Field Mapping Ã¢AP</h4>
              <div className="space-y-1 text-xs">
                {[
                  { tms: 'Load Number', cw: 'Job Reference' },
                  { tms: 'Carrier Name', cw: 'Creditor Organization' },
                  { tms: 'Carrier Rate', cw: 'Cost Charge Line' },
                  { tms: 'Bill Number', cw: 'AP Voucher Number' },
                  { tms: 'Payment Terms', cw: 'Payment Terms Code' },
                  { tms: 'MC Number', cw: 'Carrier Registration' },
                  { tms: 'Factoring Co.', cw: 'Remit To Organization' },
                ].map(m => (
                  <div key={m.tms} className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
                    <span className="flex-1 text-gray-700 font-medium">{m.tms}</span>
                    <span className="text-gray-300">Ã¢’</span>
                    <span className="flex-1 text-blue-600">{m.cw}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Records Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Sync Records</h4>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-400">AR: {MOCK_CW_SYNC.filter(r => r.type === 'AR_INVOICE').length}</span>
                <span className="text-gray-400">AP: {MOCK_CW_SYNC.filter(r => r.type === 'AP_BILL').length}</span>
              </div>
            </div>
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Ref #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Entity</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">CW Job #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Sync Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Last Sync</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Actions</th>
            </tr></thead><tbody>
              {MOCK_CW_SYNC.map(r => (
                <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 ${r.syncStatus === 'ERROR' ? 'bg-red-50' : r.syncStatus === 'NOT_SYNCED' ? 'bg-yellow-50' : ''}`}>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-bold ${r.type === 'AR_INVOICE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{r.type === 'AR_INVOICE' ? 'AR' : 'AP'}</span></td>
                  <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{r.refNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{r.loadNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{r.entity}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(r.amount)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{r.cwJobNumber || 'Ã¢'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CW_STATUS_BADGE[r.syncStatus]}`}>{CW_STATUS_LABEL[r.syncStatus]}</span>
                    {r.errorMessage && <p className="text-xs text-red-500 mt-1">{r.errorMessage}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{r.lastSyncAt ? fmtDate(r.lastSyncAt) : 'Ã¢'}</td>
                  <td className="px-3 py-2.5">
                    {r.syncStatus === 'NOT_SYNCED' && <span className="text-xs text-yellow-600 font-medium">Ã¢Â³ Queued</span>}
                    {r.syncStatus === 'ERROR' && <button className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Retry Now</button>}
                    {r.syncStatus === 'PUSHED' && <span className="text-xs text-blue-600 font-medium">Processing</span>}
                    {r.syncStatus === 'JOB_CREATED' && <span className="text-xs text-indigo-600 font-medium">Awaiting match</span>}
                    {r.syncStatus === 'INVOICE_MATCHED' && <span className="text-xs text-purple-600 font-medium">Ã¢Å““ Matched</span>}
                    {r.syncStatus === 'SENT' && <span className="text-xs text-orange-600 font-medium">Ã¢Å““ Sent</span>}
                    {r.syncStatus === 'CLOSED' && <span className="text-xs text-green-600 font-medium">Ã¢Å““ Complete</span>}
                  </td>
                </tr>
              ))}
            </tbody></table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
              <span>Synced: <strong className="text-green-600">{MOCK_CW_SYNC.filter(r => !['NOT_SYNCED', 'ERROR'].includes(r.syncStatus)).length}</strong></span>
              <span>Pending: <strong className="text-yellow-600">{MOCK_CW_SYNC.filter(r => r.syncStatus === 'NOT_SYNCED').length}</strong></span>
              <span>Errors: <strong className="text-red-600">{MOCK_CW_SYNC.filter(r => r.syncStatus === 'ERROR').length}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Ã¢Ã¢€ Factoring / Quick-Pay Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢Ã¢€ */}
      {activeTab === 'factoring' && (
        <div>
          {/* Provider Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { name: 'TriumphPay', logo: 'Ã°Å¸Â¦', color: 'purple', status: 'Connected', desc: 'Automated carrier payment network Ã¢audit, match, pay', records: MOCK_FACTORING.filter(f => f.factoringCompany === 'TriumphPay'), fee: 'Flat $50/load' },
              { name: 'RTS Financial', logo: 'Ã°Å¸’Â³', color: 'blue', desc: 'Quick-pay factoring Ã¢same-day carrier funding', status: 'Connected', records: MOCK_FACTORING.filter(f => f.factoringCompany === 'RTS Financial'), fee: '3% of invoice' },
              { name: 'OTR Solutions', logo: '', color: 'teal', desc: 'Carrier factoring and fuel card programs', status: 'Connected', records: MOCK_FACTORING.filter(f => f.factoringCompany === 'OTR Solutions'), fee: '3% of invoice' },
            ].map(p => {
              const funded = p.records.filter(r => r.factoringStatus === 'FUNDED');
              const pending = p.records.filter(r => ['SUBMITTED', 'APPROVED'].includes(r.factoringStatus));
              return (
                <div key={p.name} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.logo}</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{p.name}</h4>
                        <p className="text-xs text-gray-400">{p.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-green-600 font-medium">{p.status}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-sm font-bold text-gray-900">{funded.length}</p><p className="text-xs text-gray-400">Funded</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-sm font-bold text-yellow-600">{pending.length}</p><p className="text-xs text-gray-400">Pending</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-sm font-bold text-gray-900">{fmtCurrency(funded.reduce((s, r) => s + r.netAmount, 0))}</p><p className="text-xs text-gray-400">Total Paid</p></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Fee: {p.fee}</p>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Funded</p><p className="text-xl font-bold text-green-600">{fmtCurrency(MOCK_FACTORING.filter(f => f.factoringStatus === 'FUNDED').reduce((s, f) => s + f.netAmount, 0))}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Fees Paid</p><p className="text-xl font-bold text-red-600">{fmtCurrency(MOCK_FACTORING.filter(f => f.factoringStatus === 'FUNDED').reduce((s, f) => s + f.fee, 0))}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">In Process</p><p className="text-xl font-bold text-blue-600">{MOCK_FACTORING.filter(f => ['SUBMITTED', 'APPROVED'].includes(f.factoringStatus)).length}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Direct Pay (No Factor)</p><p className="text-xl font-bold text-gray-900">{MOCK_FACTORING.filter(f => !f.factoringCompany).length}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Rejected</p><p className={`text-xl font-bold ${MOCK_FACTORING.some(f => f.factoringStatus === 'REJECTED') ? 'text-red-600' : 'text-gray-400'}`}>{MOCK_FACTORING.filter(f => f.factoringStatus === 'REJECTED').length}</p></div>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Carrier Payment Records</h4>
              <span className="text-xs text-gray-400">{MOCK_FACTORING.length} records</span>
            </div>
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Bill #</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Load</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Carrier</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Amount</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Factor / Remit To</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Payment Method</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Fee</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Net to Carrier</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Actions</th>
            </tr></thead><tbody>
              {MOCK_FACTORING.map(f => (
                <tr key={f.id} className={`border-b border-gray-100 hover:bg-gray-50 ${f.factoringStatus === 'REJECTED' ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2.5 font-mono text-blue-600 font-medium">{f.billNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{f.loadNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{f.carrier}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(f.amount)}</td>
                  <td className="px-3 py-2.5">{f.factoringCompany ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FACTORING_COMPANY_BADGE[f.factoringCompany] || 'bg-gray-100 text-gray-700'}`}>{f.factoringCompany}</span> : <span className="text-xs text-gray-400">Direct Ã¢{f.remitTo}</span>}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{PAY_METHOD_LABEL[f.paymentMethod]}</td>
                  <td className="px-3 py-2.5 text-right text-xs">{f.fee > 0 ? <span className="text-red-600">-{fmtCurrency(f.fee)}</span> : <span className="text-gray-300">Ã¢</span>}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(f.netAmount)}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FACTORING_STATUS_BADGE[f.factoringStatus]}`}>{f.factoringStatus}</span></td>
                  <td className="px-3 py-2.5">
                    {f.factoringStatus === 'PENDING' && !f.factoringCompany && <button className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Submit to Factor</button>}
                    {f.factoringStatus === 'PENDING' && f.factoringCompany && <span className="text-xs text-gray-400">Direct pay</span>}
                    {f.factoringStatus === 'SUBMITTED' && <span className="text-xs text-blue-600">Processing</span>}
                    {f.factoringStatus === 'APPROVED' && <span className="text-xs text-indigo-600">Ã¢Â³ Funding</span>}
                    {f.factoringStatus === 'FUNDED' && <span className="text-xs text-green-600 font-medium">Ã¢Å““ Paid</span>}
                    {f.factoringStatus === 'REJECTED' && <button className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Resubmit</button>}
                  </td>
                </tr>
              ))}
            </tbody></table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
              <span>Funded: <strong className="text-green-600">{fmtCurrency(MOCK_FACTORING.filter(f => f.factoringStatus === 'FUNDED').reduce((s, f) => s + f.netAmount, 0))}</strong></span>
              <span>Fees: <strong className="text-red-600">{fmtCurrency(MOCK_FACTORING.filter(f => f.factoringStatus === 'FUNDED').reduce((s, f) => s + f.fee, 0))}</strong></span>
              <span>Pending: <strong className="text-blue-600">{fmtCurrency(MOCK_FACTORING.filter(f => ['SUBMITTED', 'APPROVED'].includes(f.factoringStatus)).reduce((s, f) => s + f.amount, 0))}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
