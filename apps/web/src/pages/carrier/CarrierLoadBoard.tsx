import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CarrierLoadDetail } from './CarrierLoadDetail';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 border-l-4 border-l-yellow-400',
  ASSIGNED: 'bg-purple-50 border-l-4 border-l-purple-400',
  IN_TRANSIT: '',
  DELIVERED: '',
  CANCELLED: 'bg-gray-50 opacity-60',
};

const STATUS_BADGES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

// Rows that need attention get pink highlight
const needsAttention = (load: any) =>
  load.status === 'PENDING' || !load.driverId;

// Rows that are warnings get yellow highlight  
const isWarning = (load: any) =>
  load.status === 'ASSIGNED';

export function CarrierLoadBoard() {
  const queryClient = useQueryClient();
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'Loads' | 'Trips'>('Loads');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negotiationLoad, setNegotiationLoad] = useState<any>(null);
  const [counterOffer, setCounterOffer] = useState('');
  const [showAutoRules, setShowAutoRules] = useState(false);

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: async () => {
      const { data } = await api.get('/loads');
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/customers');
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const [createForm, setCreateForm] = useState({
    customerId: '',
    commodity: '',
    weight: '',
    totalRate: '',
    equipment: 'Van - 53\'',
    notes: '',
    pickupFacility: '', pickupAddress: '', pickupCity: '', pickupState: '', pickupZip: '', pickupDate: '',
    deliveryFacility: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '', deliveryDate: '',
  });

  const setField = (f: string, v: string) =>
    setCreateForm(p => ({ ...p, [f]: v }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/loads', {
        customerId: createForm.customerId,
        commodity: createForm.commodity,
        weight: parseFloat(createForm.weight) || 0,
        totalRate: parseFloat(createForm.totalRate) || 0,
        equipment: createForm.equipment,
        notes: createForm.notes,
        stops: [
          {
            type: 'PICKUP',
            facilityName: createForm.pickupFacility,
            address: createForm.pickupAddress,
            city: createForm.pickupCity,
            state: createForm.pickupState,
            zip: createForm.pickupZip,
            scheduledAt: createForm.pickupDate,
            sequence: 0,
          },
          {
            type: 'DELIVERY',
            facilityName: createForm.deliveryFacility,
            address: createForm.deliveryAddress,
            city: createForm.deliveryCity,
            state: createForm.deliveryState,
            zip: createForm.deliveryZip,
            scheduledAt: createForm.deliveryDate,
            sequence: 1,
          },
        ],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setShowCreateModal(false);
      setCreateForm({
        customerId: '', commodity: '', weight: '', totalRate: '', equipment: 'Van - 53\'', notes: '',
        pickupFacility: '', pickupAddress: '', pickupCity: '', pickupState: '', pickupZip: '', pickupDate: '',
        deliveryFacility: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '', deliveryDate: '',
      });
    },
  });

  const filteredLoads = loads?.filter((l: any) =>
    statusFilter === 'All' || l.status === statusFilter
  ) || [];

  const totalMiles = filteredLoads.reduce((s: number, l: any) => s + (l.mileage || 0), 0);
  const totalRevenue = filteredLoads.reduce((s: number, l: any) => s + (l.totalRate || 0), 0);

  if (selectedLoadId) {
    return (
      <CarrierLoadDetail
        loadId={selectedLoadId}
        onBack={() => setSelectedLoadId(null)}
      />
    );
  }

  return (
    <div>
      {/* Create Load Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl">
            {/* Wizard header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">Load Creation</h2>
              <div className="flex items-center justify-between">
                {['Load Type', 'Billing Details', 'Order Details', 'Stop Details'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs ${i === 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                    {i < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer *</label>
                  <select
                    value={createForm.customerId}
                    onChange={e => setField('customerId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select customer</option>
                    {customers?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Equipment</label>
                  <select
                    value={createForm.equipment}
                    onChange={e => setField('equipment', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {["Van - 53'", "Van - 48'", "Straight Truck - 26'", "Flatbed - 48'", "Reefer - 53'", "Van w/ Team - 53'"].map(e => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Commodity</label>
                  <input
                    value={createForm.commodity}
                    onChange={e => setField('commodity', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="General Cargo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={createForm.weight}
                    onChange={e => setField('weight', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="42000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Rate ($) *</label>
                  <input
                    type="number"
                    value={createForm.totalRate}
                    onChange={e => setField('totalRate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="3200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 inline-flex items-center justify-center text-white" style={{ fontSize: '8px' }}>↑</span>
                    Pickup
                  </p>
                  <div className="space-y-2">
                    <input value={createForm.pickupFacility} onChange={e => setField('pickupFacility', e.target.value)} placeholder="Facility name" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <input value={createForm.pickupAddress} onChange={e => setField('pickupAddress', e.target.value)} placeholder="Address" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <div className="grid grid-cols-3 gap-1">
                      <input value={createForm.pickupCity} onChange={e => setField('pickupCity', e.target.value)} placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={createForm.pickupState} onChange={e => setField('pickupState', e.target.value)} placeholder="ST" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={createForm.pickupZip} onChange={e => setField('pickupZip', e.target.value)} placeholder="ZIP" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    </div>
                    <input type="datetime-local" value={createForm.pickupDate} onChange={e => setField('pickupDate', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-green-600 inline-flex items-center justify-center text-white" style={{ fontSize: '8px' }}>↓</span>
                    Delivery
                  </p>
                  <div className="space-y-2">
                    <input value={createForm.deliveryFacility} onChange={e => setField('deliveryFacility', e.target.value)} placeholder="Facility name" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <input value={createForm.deliveryAddress} onChange={e => setField('deliveryAddress', e.target.value)} placeholder="Address" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <div className="grid grid-cols-3 gap-1">
                      <input value={createForm.deliveryCity} onChange={e => setField('deliveryCity', e.target.value)} placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={createForm.deliveryState} onChange={e => setField('deliveryState', e.target.value)} placeholder="ST" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={createForm.deliveryZip} onChange={e => setField('deliveryZip', e.target.value)} placeholder="ZIP" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    </div>
                    <input type="datetime-local" value={createForm.deliveryDate} onChange={e => setField('deliveryDate', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Special instructions..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !createForm.customerId || !createForm.totalRate}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Load'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Loads</h2>
          <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
            {(['Loads', 'Trips'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 font-medium ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            ✕ Loads Today
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            ✕ My Loads
          </button>
          <button
            onClick={() => setShowAutoRules(true)}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ⚡ Auto-Accept Rules
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Load
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-1 mb-3">
        {['All', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'IN_TRANSIT' ? 'In Transit' : s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Pickup Region</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Dropoff Region</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Pickup Market</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Dropoff Market</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Load #</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Load Type</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Equipment</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Driver</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Status</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Miles</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-gray-400">Loading loads...</td>
                </tr>
              )}
              {!isLoading && filteredLoads.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-gray-400">No loads found. Click + New Load to get started.</td>
                </tr>
              )}
              {filteredLoads.map((load: any) => {
                const rowClass = needsAttention(load)
                  ? 'bg-red-50 border-l-4 border-l-red-400'
                  : isWarning(load)
                  ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                  : '';

                const pickup = load.stops?.[0];
                const delivery = load.stops?.[load.stops?.length - 1];

                return (
                  <tr
                    key={load.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowClass}`}
                    onClick={() => setSelectedLoadId(load.id)}
                  >
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{pickup?.state || ''}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{delivery?.state || ''}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{pickup?.city || ''}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{delivery?.city || ''}</td>
                    <td className="px-3 py-2">
                      <span className="text-blue-600 font-medium hover:underline">{load.loadNumber}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">Revenue</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{load.equipment || "Van - 53'"}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {load.driver
                        ? `${load.driver.user?.firstName} ${load.driver.user?.lastName}`
                        : <span className="text-red-500">Unassigned</span>
                      }
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[load.status] || 'bg-gray-100 text-gray-600'}`}>
                        {load.status === 'IN_TRANSIT' ? 'In Transit' : load.status?.charAt(0) + load.status?.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">{load.mileage ? `${load.mileage} mi` : ''}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                      {load.totalRate ? `$${load.totalRate.toLocaleString()}` : ''}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {load.status === 'PENDING' && <button onClick={e => { e.stopPropagation(); setNegotiationLoad(load); setCounterOffer(String(load.totalRate || '')); setShowNegotiation(true); }} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Negotiate</button>}
                      {load.status === 'ASSIGNED' && <span className="text-xs text-green-600 font-medium">✓ Accepted</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex gap-6 text-xs text-gray-600">
          <span><strong className="text-gray-800">Total Miles:</strong> {totalMiles.toLocaleString()} mi</span>
          <span><strong className="text-gray-800">Total Revenue:</strong> ${totalRevenue.toLocaleString()}</span>
          <span><strong className="text-gray-800">Total Loads:</strong> {filteredLoads.length}</span>
          <span><strong className="text-gray-800">In Transit:</strong> {filteredLoads.filter((l: any) => l.status === 'IN_TRANSIT').length}</span>
        </div>
      </div>

      {/* Rate Negotiation Modal */}
      {showNegotiation && negotiationLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNegotiation(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Rate Negotiation  {negotiationLoad.loadNumber || 'Load'}</h2><p className="text-xs text-gray-400 mt-0.5">{negotiationLoad.stops?.[0]?.city}, {negotiationLoad.stops?.[0]?.state} → {negotiationLoad.stops?.[negotiationLoad.stops?.length-1]?.city}, {negotiationLoad.stops?.[negotiationLoad.stops?.length-1]?.state}</p></div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-400">Posted Rate</p><p className="text-xl font-bold text-gray-900">${negotiationLoad.totalRate?.toLocaleString() || ''}</p></div>
                <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-xs text-blue-600">Your Counter</p><input type="number" value={counterOffer} onChange={e => setCounterOffer(e.target.value)} className="w-full text-xl font-bold text-blue-700 text-center bg-transparent border-none outline-none" /></div>
                <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-400">Margin</p><p className={`text-xl font-bold ${Number(counterOffer) > (negotiationLoad.totalRate || 0) ? 'text-green-600' : 'text-red-600'}`}>{counterOffer ? `$${(Number(counterOffer) - (negotiationLoad.totalRate || 0)).toLocaleString()}` : ''}</p></div>
              </div>
              <div><h4 className="text-xs font-semibold text-gray-700 mb-2">Negotiation History</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded"><div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">Broker</span><span className="text-xs text-gray-700">Initial offer</span></div><span className="text-xs font-bold">${negotiationLoad.totalRate?.toLocaleString()}</span></div>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Reason for counter-offer..." /></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex gap-2"><button onClick={() => setShowNegotiation(false)} className="px-4 py-2 text-sm text-red-600 font-medium">Decline Load</button></div>
              <div className="flex gap-2"><button onClick={() => setShowNegotiation(false)} className="px-4 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg font-medium">Accept at ${negotiationLoad.totalRate?.toLocaleString()}</button><button onClick={() => setShowNegotiation(false)} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Send Counter: ${Number(counterOffer).toLocaleString()}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Accept Rules Modal */}
      {showAutoRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAutoRules(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Auto-Accept Rules</h2><p className="text-xs text-gray-400 mt-0.5">Automatically accept loads that match these criteria</p></div>
            <div className="px-6 py-4 space-y-3">
              {[
                { lane: 'Memphis, TN → Nashville, TN', minRate: 2500, equipment: 'Dry Van', enabled: true },
                { lane: 'Dallas, TX → Houston, TX', minRate: 3800, equipment: 'Reefer', enabled: true },
                { lane: 'Chicago, IL → Indianapolis, IN', minRate: 2200, equipment: 'Any', enabled: false },
                { lane: 'Atlanta, GA → Jacksonville, FL', minRate: 2600, equipment: 'Dry Van', enabled: true },
              ].map((rule, i) => (
                <div key={i} className={`flex items-center justify-between py-2.5 px-3 rounded-lg border ${rule.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex-1"><p className="text-xs font-semibold text-gray-800">{rule.lane}</p><p className="text-xs text-gray-400">Min rate: ${rule.minRate.toLocaleString()} · Equipment: {rule.equipment}</p></div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3"><input type="checkbox" defaultChecked={rule.enabled} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" /></label>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600">+ Add Rule</button>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200"><button onClick={() => setShowAutoRules(false)} className="px-4 py-2 text-sm text-gray-600">Close</button><button onClick={() => setShowAutoRules(false)} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">Save Rules</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
