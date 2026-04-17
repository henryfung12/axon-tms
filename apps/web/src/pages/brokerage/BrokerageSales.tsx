import { useState, useMemo } from 'react';

interface SalesLead {
  id: string; companyName: string; contactName: string; contactEmail: string; contactPhone: string;
  city: string; state: string; stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  estimatedRevenue: number; estimatedVolume: number; probability: number;
  assignedRep: string; nextAction: string; nextActionDate: string;
  createdDate: string; lastContactDate: string; notes: string;
}

const MOCK_LEADS: SalesLead[] = [
  { id: 'sl1', companyName: 'Westbrook Electronics', contactName: 'Sarah Kim', contactEmail: 'skim@westbrookelec.com', contactPhone: '(555) 400-1001', city: 'Austin', state: 'TX', stage: 'PROPOSAL', estimatedRevenue: 180000, estimatedVolume: 60, probability: 65, assignedRep: 'Mike Santos', nextAction: 'Send rate proposal', nextActionDate: '2026-04-18', createdDate: '2026-03-15', lastContactDate: '2026-04-10', notes: 'Electronics  high value, needs white glove' },
  { id: 'sl2', companyName: 'Greenfield Organics', contactName: 'Tom Bradley', contactEmail: 'tom@greenfieldorg.com', contactPhone: '(555) 400-1002', city: 'Portland', state: 'OR', stage: 'QUALIFIED', estimatedRevenue: 120000, estimatedVolume: 45, probability: 40, assignedRep: 'Priya Patel', nextAction: 'Schedule site visit', nextActionDate: '2026-04-20', createdDate: '2026-03-28', lastContactDate: '2026-04-08', notes: 'Reefer  organic produce, weekly' },
  { id: 'sl3', companyName: 'Atlas Building Supply', contactName: 'Joe Carter', contactEmail: 'jcarter@atlasbuild.com', contactPhone: '(555) 400-1003', city: 'Denver', state: 'CO', stage: 'NEGOTIATION', estimatedRevenue: 240000, estimatedVolume: 80, probability: 75, assignedRep: 'Mike Santos', nextAction: 'Final rate negotiation', nextActionDate: '2026-04-16', createdDate: '2026-02-20', lastContactDate: '2026-04-12', notes: 'Flatbed  building materials, 80 loads/yr' },
  { id: 'sl4', companyName: 'Coastal Pharma Inc.', contactName: 'Dr. Linda Park', contactEmail: 'lpark@coastalpharma.com', contactPhone: '(555) 400-1004', city: 'San Diego', state: 'CA', stage: 'PROSPECT', estimatedRevenue: 300000, estimatedVolume: 100, probability: 20, assignedRep: 'Priya Patel', nextAction: 'Cold outreach  intro email', nextActionDate: '2026-04-15', createdDate: '2026-04-10', lastContactDate: '', notes: 'Pharma  temperature controlled, high margin potential' },
  { id: 'sl5', companyName: 'Tri-State Lumber', contactName: 'Randy Foster', contactEmail: 'rfoster@tristatelumber.com', contactPhone: '(555) 400-1005', city: 'Pittsburgh', state: 'PA', stage: 'CLOSED_WON', estimatedRevenue: 96000, estimatedVolume: 40, probability: 100, assignedRep: 'Mike Santos', nextAction: 'Onboard  first load', nextActionDate: '2026-04-22', createdDate: '2026-01-10', lastContactDate: '2026-04-05', notes: 'Flatbed lumber  converted from competitor' },
  { id: 'sl6', companyName: 'Valley Fresh Dairy', contactName: 'Karen Wilson', contactEmail: 'kwilson@valleyfresh.com', contactPhone: '(555) 400-1006', city: 'Madison', state: 'WI', stage: 'CLOSED_LOST', estimatedRevenue: 80000, estimatedVolume: 30, probability: 0, assignedRep: 'Priya Patel', nextAction: '', nextActionDate: '', createdDate: '2026-02-01', lastContactDate: '2026-03-20', notes: 'Lost to competitor  price too high' },
  { id: 'sl7', companyName: 'Metro Auto Parts', contactName: 'Brian Lee', contactEmail: 'blee@metroauto.com', contactPhone: '(555) 400-1007', city: 'Detroit', state: 'MI', stage: 'QUALIFIED', estimatedRevenue: 150000, estimatedVolume: 55, probability: 35, assignedRep: 'Mike Santos', nextAction: 'Follow-up call', nextActionDate: '2026-04-17', createdDate: '2026-04-01', lastContactDate: '2026-04-08', notes: 'Auto parts  JIT delivery, tight windows' },
];

const STAGE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PROSPECT: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Prospect' },
  QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Qualified' },
  PROPOSAL: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Proposal' },
  NEGOTIATION: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Negotiation' },
  CLOSED_WON: { bg: 'bg-green-100', text: 'text-green-800', label: 'Won' },
  CLOSED_LOST: { bg: 'bg-red-100', text: 'text-red-800', label: 'Lost' },
};

const PIPELINE_STAGES = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'] as const;
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''; }

export function BrokerageSales() {
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);

  const filtered = useMemo(() => MOCK_LEADS.filter(l => stageFilter === 'All' || l.stage === stageFilter), [stageFilter]);

  const pipeline = useMemo(() => {
    const active = MOCK_LEADS.filter(l => l.stage !== 'CLOSED_LOST');
    return {
      totalPipeline: active.filter(l => l.stage !== 'CLOSED_WON').reduce((s, l) => s + l.estimatedRevenue, 0),
      weightedPipeline: active.filter(l => l.stage !== 'CLOSED_WON').reduce((s, l) => s + (l.estimatedRevenue * l.probability / 100), 0),
      closedWon: MOCK_LEADS.filter(l => l.stage === 'CLOSED_WON').reduce((s, l) => s + l.estimatedRevenue, 0),
      closedLost: MOCK_LEADS.filter(l => l.stage === 'CLOSED_LOST').reduce((s, l) => s + l.estimatedRevenue, 0),
      activeDeals: active.filter(l => l.stage !== 'CLOSED_WON').length,
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Sales Pipeline</h2>
        <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700">+ Add Lead</button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total Pipeline</p><p className="text-xl font-bold text-gray-900">${(pipeline.totalPipeline / 1000).toFixed(0)}k</p><p className="text-xs text-gray-400 mt-1.5">{pipeline.activeDeals} active deals</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Weighted Pipeline</p><p className="text-xl font-bold text-blue-600">${(pipeline.weightedPipeline / 1000).toFixed(0)}k</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Closed Won (YTD)</p><p className="text-xl font-bold text-green-600">${(pipeline.closedWon / 1000).toFixed(0)}k</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Lost (YTD)</p><p className="text-xl font-bold text-red-600">${(pipeline.closedLost / 1000).toFixed(0)}k</p></div>
        <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Win Rate</p><p className="text-xl font-bold text-green-600">{pipeline.closedWon + pipeline.closedLost > 0 ? Math.round((pipeline.closedWon / (pipeline.closedWon + pipeline.closedLost)) * 100) : 0}%</p></div>
      </div>

      {/* Pipeline Visual */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-3">
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = MOCK_LEADS.filter(l => l.stage === stage);
          const stageRev = stageLeads.reduce((s, l) => s + l.estimatedRevenue, 0);
          return (
            <div key={stage} className="flex-1 text-center">
              <div className={`h-8 rounded flex items-center justify-center text-sm font-bold text-white ${stage === 'CLOSED_WON' ? 'bg-green-500' : stage === 'NEGOTIATION' ? 'bg-orange-500' : stage === 'PROPOSAL' ? 'bg-purple-500' : stage === 'QUALIFIED' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                {stageLeads.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">{STAGE_BADGE[stage].label}</p>
              <p className="text-xs font-medium text-gray-700">${(stageRev / 1000).toFixed(0)}k</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 mb-3">
        {['All', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].map(s => (
          <button key={s} onClick={() => setStageFilter(s)} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${stageFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'All' ? 'All' : STAGE_BADGE[s]?.label || s}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Company</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Contact</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Stage</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Est. Revenue</th>
            <th className="text-right px-3 py-2.5 font-medium text-gray-500">Probability</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Rep</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Next Action</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500">Due</th>
          </tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${l.stage === 'CLOSED_LOST' ? 'opacity-50' : ''}`} onClick={() => setSelectedLead(l)}>
                <td className="px-3 py-2.5"><span className="font-semibold text-blue-600">{l.companyName}</span><br/><span className="text-xs text-gray-400">{l.city}, {l.state}</span></td>
                <td className="px-3 py-2.5"><span className="text-sm text-gray-800">{l.contactName}</span><br/><span className="text-xs text-gray-400">{l.contactEmail}</span></td>
                <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_BADGE[l.stage].bg} ${STAGE_BADGE[l.stage].text}`}>{STAGE_BADGE[l.stage].label}</span></td>
                <td className="px-3 py-2.5 text-right font-medium text-gray-900">${(l.estimatedRevenue / 1000).toFixed(0)}k</td>
                <td className="px-3 py-2.5 text-right"><span className={`font-medium ${l.probability >= 60 ? 'text-green-600' : l.probability >= 30 ? 'text-yellow-600' : 'text-gray-400'}`}>{l.probability}%</span></td>
                <td className="px-3 py-2.5 text-gray-700">{l.assignedRep}</td>
                <td className="px-3 py-2.5 text-sm text-gray-600">{l.nextAction || ''}</td>
                <td className="px-3 py-2.5 text-sm text-gray-600">{fmtDate(l.nextActionDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedLead(null)}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative w-[420px] bg-white shadow-2xl h-full overflow-y-auto border-l border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-gray-900">{selectedLead.companyName}</h3><button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button></div>
              <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_BADGE[selectedLead.stage].bg} ${STAGE_BADGE[selectedLead.stage].text}`}>{STAGE_BADGE[selectedLead.stage].label}</span><span className="text-xs text-gray-400">{selectedLead.city}, {selectedLead.state}</span></div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">${(selectedLead.estimatedRevenue/1000).toFixed(0)}k</p><p className="text-xs text-gray-400">Est. Revenue/yr</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-gray-900">{selectedLead.estimatedVolume}</p><p className="text-xs text-gray-400">Est. Loads/yr</p></div>
              </div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Contact</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1"><p className="text-sm font-medium text-gray-900">{selectedLead.contactName}</p><p className="text-xs text-blue-600">{selectedLead.contactEmail}</p><p className="text-xs text-gray-600">{selectedLead.contactPhone}</p></div></div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Details</h4><div className="bg-gray-50 rounded-lg p-3 space-y-1.5"><div className="flex justify-between text-xs"><span className="text-gray-500">Assigned Rep</span><span className="text-gray-800">{selectedLead.assignedRep}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Probability</span><span className={`font-medium ${selectedLead.probability >= 60 ? 'text-green-600' : 'text-yellow-600'}`}>{selectedLead.probability}%</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Created</span><span className="text-gray-800">{fmtDate(selectedLead.createdDate)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Last Contact</span><span className="text-gray-800">{fmtDate(selectedLead.lastContactDate)}</span></div></div></div>
              {selectedLead.nextAction && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-xs font-semibold text-blue-800 mb-1">Next Action  {fmtDate(selectedLead.nextActionDate)}</p><p className="text-xs text-blue-700">{selectedLead.nextAction}</p></div>}
              {selectedLead.notes && <div><h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4><p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedLead.notes}</p></div>}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Log Activity</button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Edit Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
