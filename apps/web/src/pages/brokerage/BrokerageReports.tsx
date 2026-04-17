import { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

// ─ Types ─
interface MonthlyData {
  year: number; month: string; monthNum: number; buy: number; sell: number; margin: number;
  marginPct: number; shipments: number; commission: number; netMargin: number;
}

type ReportType = 'profitability_by_month' | 'profitability_by_customer' | 'profitability_by_lane' | 'shipped_report' | 'carrier_summary' | 'customer_trends' | 'inactive_customer' | 'accounting_concerns' | 'commissions_linking';
type DateType = 'pickup_date' | 'delivery_date' | 'invoice_date' | 'created_date';

// ─ Mock Data ─
const MONTHLY_DATA: MonthlyData[] = [
  { year: 2026, month: 'Apr', monthNum: 4, buy: 379782.50, sell: 442640.00, margin: 62857.50, marginPct: 14.2, shipments: 396, commission: 0, netMargin: 62857.50 },
  { year: 2026, month: 'Mar', monthNum: 3, buy: 745759.75, sell: 844875.00, margin: 99115.25, marginPct: 11.7, shipments: 813, commission: 0, netMargin: 99115.25 },
  { year: 2026, month: 'Feb', monthNum: 2, buy: 543257.50, sell: 624175.00, margin: 80917.50, marginPct: 13.0, shipments: 667, commission: 0, netMargin: 80917.50 },
  { year: 2026, month: 'Jan', monthNum: 1, buy: 704187.50, sell: 811950.00, margin: 107762.50, marginPct: 13.3, shipments: 815, commission: 0, netMargin: 107762.50 },
  { year: 2025, month: 'Dec', monthNum: 12, buy: 682450.00, sell: 788200.00, margin: 105750.00, marginPct: 13.4, shipments: 790, commission: 0, netMargin: 105750.00 },
  { year: 2025, month: 'Nov', monthNum: 11, buy: 598320.00, sell: 689400.00, margin: 91080.00, marginPct: 13.2, shipments: 710, commission: 0, netMargin: 91080.00 },
  { year: 2025, month: 'Oct', monthNum: 10, buy: 621890.00, sell: 714500.00, margin: 92610.00, marginPct: 13.0, shipments: 735, commission: 0, netMargin: 92610.00 },
  { year: 2025, month: 'Sep', monthNum: 9, buy: 558700.00, sell: 642800.00, margin: 84100.00, marginPct: 13.1, shipments: 665, commission: 0, netMargin: 84100.00 },
  { year: 2025, month: 'Aug', monthNum: 8, buy: 612400.00, sell: 708600.00, margin: 96200.00, marginPct: 13.6, shipments: 748, commission: 0, netMargin: 96200.00 },
  { year: 2025, month: 'Jul', monthNum: 7, buy: 578900.00, sell: 668500.00, margin: 89600.00, marginPct: 13.4, shipments: 698, commission: 0, netMargin: 89600.00 },
  { year: 2025, month: 'Jun', monthNum: 6, buy: 534200.00, sell: 615800.00, margin: 81600.00, marginPct: 13.3, shipments: 642, commission: 0, netMargin: 81600.00 },
  { year: 2025, month: 'May', monthNum: 5, buy: 502800.00, sell: 579400.00, margin: 76600.00, marginPct: 13.2, shipments: 608, commission: 0, netMargin: 76600.00 },
];

const CUSTOMER_PROFITABILITY = [
  { customer: 'Acme Manufacturing', shipments: 124, buy: 248000, sell: 310000, margin: 62000, marginPct: 20.0 },
  { customer: 'Heartland Foods', shipments: 89, buy: 178000, sell: 213600, margin: 35600, marginPct: 16.7 },
  { customer: 'Pacific Retail Group', shipments: 67, buy: 134000, sell: 167500, margin: 33500, marginPct: 20.0 },
  { customer: 'Southeastern Steel', shipments: 45, buy: 112500, sell: 135000, margin: 22500, marginPct: 16.7 },
  { customer: 'Great Lakes Chemicals', shipments: 38, buy: 95000, sell: 118750, margin: 23750, marginPct: 20.0 },
  { customer: 'NorthPoint Logistics', shipments: 52, buy: 78000, sell: 97500, margin: 19500, marginPct: 20.0 },
  { customer: 'Summit Healthcare', shipments: 28, buy: 56000, sell: 70000, margin: 14000, marginPct: 20.0 },
];

const LANE_PROFITABILITY = [
  { lane: 'DET → CHI', shipments: 98, buy: 215600, sell: 274400, margin: 58800, marginPct: 21.4 },
  { lane: 'KC → DAL', shipments: 72, buy: 201600, sell: 244800, margin: 43200, marginPct: 17.6 },
  { lane: 'LAX → PHX', shipments: 54, buy: 72900, sell: 97200, margin: 24300, marginPct: 25.0 },
  { lane: 'BHM → ATL', shipments: 42, buy: 75600, sell: 92400, margin: 16800, marginPct: 18.2 },
  { lane: 'CHI → IND', shipments: 68, buy: 71400, sell: 95200, margin: 23800, marginPct: 25.0 },
  { lane: 'CLE → PIT', shipments: 35, buy: 42000, sell: 56000, margin: 14000, marginPct: 25.0 },
  { lane: 'BNA → MEM', shipments: 28, buy: 25200, sell: 33600, margin: 8400, marginPct: 25.0 },
];

const REPORT_TYPES: { id: ReportType; label: string; section: string }[] = [
  { id: 'profitability_by_month', label: 'Profitability By Month', section: 'Reports' },
  { id: 'profitability_by_customer', label: 'Profitability By Customer', section: 'Reports' },
  { id: 'profitability_by_lane', label: 'Profitability By Lane', section: 'Reports' },
  { id: 'shipped_report', label: 'Shipped Report', section: 'Reports' },
  { id: 'carrier_summary', label: 'Carrier Summary Report', section: 'Reports' },
  { id: 'customer_trends', label: 'Customer Trends Report', section: 'Reports' },
  { id: 'inactive_customer', label: 'Inactive Customer Report', section: 'Reports' },
  { id: 'accounting_concerns', label: 'Accounting Concerns Report', section: 'Reports' },
  { id: 'commissions_linking', label: 'Commissions Linking Report', section: 'Reports' },
];

// ─ Helpers ─
function fmtCurrency(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ─ Bar Chart Component ─
function ProfitabilityChart({ data }: { data: MonthlyData[] }) {
  const chartData = [...data].reverse();
  const maxVal = Math.max(...chartData.map(d => d.sell));
  const barWidth = Math.max(40, Math.floor(600 / chartData.length) - 8);

  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Profitability By Month - Chart</div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 14, height: 14, background: '#1e3a5f', borderRadius: 2 }} />Total Margin</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 14, height: 14, background: '#60a5fa', borderRadius: 2 }} />Total Commissions</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 14, height: 14, background: '#7c3aed', borderRadius: 2 }} />Total Buy</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 220, borderBottom: '1px solid #e5e7eb', paddingBottom: 4, overflow: 'hidden' }}>
        {/* Y-axis labels */}
        <div style={{ width: 60, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', textAlign: 'right', paddingRight: 8 }}>
          {[maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0].map((v, i) => (
            <span key={i}>{(v / 1000).toFixed(0)}k</span>
          ))}
        </div>
        {/* Bars */}
        {chartData.map(d => {
          const buyH = (d.buy / maxVal) * 200;
          const marginH = (d.margin / maxVal) * 200;
          return (
            <div key={d.month + d.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 200 }}>
                <div style={{ width: barWidth / 3, height: marginH, background: '#1e3a5f', borderRadius: '3px 3px 0 0' }} title={`Margin: ${fmtCurrency(d.margin)}`} />
                <div style={{ width: barWidth / 3, height: 0, background: '#60a5fa', borderRadius: '3px 3px 0 0' }} />
                <div style={{ width: barWidth / 3, height: buyH, background: '#7c3aed', borderRadius: '3px 3px 0 0' }} title={`Buy: ${fmtCurrency(d.buy)}`} />
              </div>
              <span style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─ Component ─
export function BrokerageReports() {
  const [reportType, setReportType] = useState<ReportType>('profitability_by_month');
  const [dateType, setDateType] = useState<DateType>('pickup_date');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-04-14');
  const [showInvoicedOnly, setShowInvoicedOnly] = useState(false);
  const [showMarginDetails, setShowMarginDetails] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const filteredMonthly = useMemo(() => {
    const sYear = parseInt(startDate.split('-')[0]);
    const sMonth = parseInt(startDate.split('-')[1]);
    const eYear = parseInt(endDate.split('-')[0]);
    const eMonth = parseInt(endDate.split('-')[1]);
    return MONTHLY_DATA.filter(d => {
      const val = d.year * 100 + d.monthNum;
      return val >= sYear * 100 + sMonth && val <= eYear * 100 + eMonth;
    });
  }, [startDate, endDate]);

  const totals = useMemo(() => {
    const data = filteredMonthly;
    return {
      buy: data.reduce((s, d) => s + d.buy, 0),
      sell: data.reduce((s, d) => s + d.sell, 0),
      margin: data.reduce((s, d) => s + d.margin, 0),
      shipments: data.reduce((s, d) => s + d.shipments, 0),
      commission: data.reduce((s, d) => s + d.commission, 0),
      netMargin: data.reduce((s, d) => s + d.netMargin, 0),
    };
  }, [filteredMonthly]);

  const exportReport = () => {
    let data: any[];
    let sheetName: string;

    if (reportType === 'profitability_by_month') {
      data = filteredMonthly.map(d => ({ Year: d.year, Month: d.month, Buy: d.buy, Sell: d.sell, Margin: d.margin, 'Margin %': `${d.marginPct}%`, Shipments: d.shipments, Commission: d.commission, 'Net Margin': d.netMargin }));
      data.push({ Year: '', Month: 'Totals:', Buy: totals.buy, Sell: totals.sell, Margin: totals.margin, 'Margin %': `${totals.sell > 0 ? ((totals.margin / totals.sell) * 100).toFixed(1) : 0}%`, Shipments: totals.shipments, Commission: totals.commission, 'Net Margin': totals.netMargin });
      sheetName = 'Profitability By Month';
    } else if (reportType === 'profitability_by_customer') {
      data = CUSTOMER_PROFITABILITY.map(d => ({ Customer: d.customer, Shipments: d.shipments, Buy: d.buy, Sell: d.sell, Margin: d.margin, 'Margin %': `${d.marginPct}%` }));
      sheetName = 'By Customer';
    } else {
      data = LANE_PROFITABILITY.map(d => ({ Lane: d.lane, Shipments: d.shipments, Buy: d.buy, Sell: d.sell, Margin: d.margin, 'Margin %': `${d.marginPct}%` }));
      sheetName = 'By Lane';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `AXON_Brokerage_${sheetName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const reportLabel = REPORT_TYPES.find(r => r.id === reportType)?.label || '';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>Profitability Report</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#374151', background: 'white', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }}>⬇ Export to Excel</button>
          <button style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, color: 'white', background: '#2563eb', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Create Report</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Report Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Report Type</label>
            <div style={{ position: 'relative' }}>
              <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 8, appearance: 'none', background: 'white', cursor: 'pointer' }}>
                {REPORT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>
          {/* Date Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Date Type</label>
            <select value={dateType} onChange={e => setDateType(e.target.value as DateType)} style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 8, background: 'white' }}>
              <option value="pickup_date">Pickup Date</option>
              <option value="delivery_date">Delivery Date</option>
              <option value="invoice_date">Invoice Date</option>
              <option value="created_date">Created Date</option>
            </select>
          </div>
          {/* Date Range */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Date Range</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '8px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8 }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ flex: 1, padding: '8px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          {/* Min/Max Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Min Shipment Status</label>
              <select style={{ width: '100%', padding: '8px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8, background: 'white' }}>
                <option>Committed</option><option>Ready</option><option>Sent</option><option>Dispatched</option><option>In Transit</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Max Shipment Status</label>
              <select style={{ width: '100%', padding: '8px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8, background: 'white' }}>
                <option>Complete</option><option>Delivered</option><option>Invoiced</option><option>Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          <strong style={{ color: '#374151' }}>Status Range</strong> Committed, Ready, Sent, Dispatched, In Transit, Out for Delivery, Delivered, Complete
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={showInvoicedOnly} onChange={e => setShowInvoicedOnly(e.target.checked)} style={{ borderRadius: 4 }} />
            Show Only Invoiced Shipments
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={showMarginDetails} onChange={e => setShowMarginDetails(e.target.checked)} style={{ borderRadius: 4 }} />
            Show Margin Details
          </label>
        </div>
      </div>

      {/* ─ Profitability By Month ─ */}
      {reportType === 'profitability_by_month' && (
        <>
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Chart */}
            <div style={{ flex: 1 }}>
              <ProfitabilityChart data={filteredMonthly} />
            </div>

            {/* Details Table */}
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Profitability By Month - Details</div>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: 'white' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Year</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Month</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Buy</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Sell</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin %</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Shipments</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Commission</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Net Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMonthly.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <td style={{ padding: '8px 12px', color: '#374151' }}>{d.year}</td>
                        <td style={{ padding: '8px 12px', color: '#374151' }}>{d.month}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#374151' }}>{fmtCurrency(d.buy)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#374151' }}>{fmtCurrency(d.sell)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{fmtCurrency(d.margin)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: d.marginPct >= 15 ? '#16a34a' : d.marginPct >= 12 ? '#ca8a04' : '#dc2626' }}>{d.marginPct}%</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#374151' }}>{d.shipments}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#9ca3af' }}>{fmtCurrency(d.commission)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{fmtCurrency(d.netMargin)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 700, color: '#1f2937' }}>Totals:</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>{fmtCurrency(totals.buy)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>{fmtCurrency(totals.sell)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmtCurrency(totals.margin)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{totals.sell > 0 ? ((totals.margin / totals.sell) * 100).toFixed(1) : 0}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>{totals.shipments}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#9ca3af' }}>{fmtCurrency(totals.commission)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmtCurrency(totals.netMargin)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Print button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, color: '#374151', background: 'white', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }}>ðŸ¨ Print</button>
          </div>
        </>
      )}

      {/* ─ Profitability By Customer ─ */}
      {reportType === 'profitability_by_customer' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Profitability By Customer</div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: 'white' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Customer</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Shipments</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Buy</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Sell</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMER_PROFITABILITY.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#2563eb' }}>{d.customer}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{d.shipments}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtCurrency(d.buy)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtCurrency(d.sell)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{fmtCurrency(d.margin)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: d.marginPct >= 20 ? '#16a34a' : d.marginPct >= 15 ? '#ca8a04' : '#dc2626' }}>{d.marginPct}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Totals:</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{CUSTOMER_PROFITABILITY.reduce((s, d) => s + d.shipments, 0)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(CUSTOMER_PROFITABILITY.reduce((s, d) => s + d.buy, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(CUSTOMER_PROFITABILITY.reduce((s, d) => s + d.sell, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmtCurrency(CUSTOMER_PROFITABILITY.reduce((s, d) => s + d.margin, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{(() => { const t = CUSTOMER_PROFITABILITY.reduce((s, d) => ({ sell: s.sell + d.sell, margin: s.margin + d.margin }), { sell: 0, margin: 0 }); return ((t.margin / t.sell) * 100).toFixed(1); })()}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ─ Profitability By Lane ─ */}
      {reportType === 'profitability_by_lane' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Profitability By Lane</div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: 'white' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Lane</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Shipments</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Buy</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Sell</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {LANE_PROFITABILITY.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#2563eb' }}>{d.lane}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{d.shipments}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtCurrency(d.buy)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmtCurrency(d.sell)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{fmtCurrency(d.margin)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: d.marginPct >= 20 ? '#16a34a' : d.marginPct >= 15 ? '#ca8a04' : '#dc2626' }}>{d.marginPct}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Totals:</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{LANE_PROFITABILITY.reduce((s, d) => s + d.shipments, 0)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(LANE_PROFITABILITY.reduce((s, d) => s + d.buy, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(LANE_PROFITABILITY.reduce((s, d) => s + d.sell, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmtCurrency(LANE_PROFITABILITY.reduce((s, d) => s + d.margin, 0))}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{(() => { const t = LANE_PROFITABILITY.reduce((s, d) => ({ sell: s.sell + d.sell, margin: s.margin + d.margin }), { sell: 0, margin: 0 }); return ((t.margin / t.sell) * 100).toFixed(1); })()}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ─ Placeholder for other report types ─ */}
      {!['profitability_by_month', 'profitability_by_customer', 'profitability_by_lane'].includes(reportType) && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>ðŸ</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>{reportLabel}</div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>Select date range and click "Create Report" to generate</p>
        </div>
      )}

      {/* Footer totals bar */}
      <div style={{ display: 'flex', gap: 24, padding: '12px 0', marginTop: 12, fontSize: 13, color: '#6b7280' }}>
        <span>Total Shipments: <strong style={{ color: '#1f2937' }}>{totals.shipments.toLocaleString()}</strong></span>
        <span>Total Sell: <strong style={{ color: '#1f2937' }}>{fmtCurrency(totals.sell)}</strong></span>
        <span>Total Buy: <strong style={{ color: '#1f2937' }}>{fmtCurrency(totals.buy)}</strong></span>
        <span>Total Margin: <strong style={{ color: '#16a34a' }}>{fmtCurrency(totals.margin)}</strong></span>
      </div>
    </div>
  );
}
