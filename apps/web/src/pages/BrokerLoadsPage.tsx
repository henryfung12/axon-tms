import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING:          'bg-yellow-100 text-yellow-800',
  POSTED_TO_DAT:    'bg-blue-100 text-blue-800',
  CARRIER_ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_TRANSIT:       'bg-blue-100 text-blue-800',
  DELIVERED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:          'Pending',
  POSTED_TO_DAT:    'Posted to DAT',
  CARRIER_ASSIGNED: 'Carrier assigned',
  IN_TRANSIT:       'In transit',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
};

const FILTERS = ['All', 'PENDING', 'POSTED_TO_DAT', 'CARRIER_ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];
const FILTER_LABELS: Record<string, string> = {
  All:              'All loads',
  PENDING:          'Pending',
  POSTED_TO_DAT:    'Posted to DAT',
  CARRIER_ASSIGNED: 'Carrier assigned',
  IN_TRANSIT:       'In transit',
  DELIVERED:        'Delivered',
};

export function BrokerLoadsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<any>(null);
  const [form, setForm] = useState({
    customerId: '', commodity: '', weight: '', shipperRate: '',
    carrierRate: '', notes: '',
    pickupFacility: '', pickupAddress: '', pickupCity: '', pickupState: '', pickupZip: '', pickupDate: '',
    deliveryFacility: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '', deliveryDate: '',
  });
  const [assignForm, setAssignForm] = useState({ carrierId: '', carrierRate: '' });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const { data: loads, isLoading } = useQuery({
    queryKey: ['broker-loads', activeFilter],
    queryFn: async () => {
      const params = activeFilter !== 'All' ? `?status=${activeFilter}` : '';
      const { data } = await api.get(`/broker-loads${params}`);
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

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data } = await api.get('/carriers');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/broker-loads', {
        customerId: form.customerId,
        commodity: form.commodity,
        weight: parseFloat(form.weight),
        shipperRate: parseFloat(form.shipperRate),
        carrierRate: form.carrierRate ? parseFloat(form.carrierRate) : null,
        notes: form.notes,
        stops: [
          {
            type: 'PICKUP',
            facilityName: form.pickupFacility,
            address: form.pickupAddress,
            city: form.pickupCity,
            state: form.pickupState,
            zip: form.pickupZip,
            scheduledAt: form.pickupDate,
          },
          {
            type: 'DELIVERY',
            facilityName: form.deliveryFacility,
            address: form.deliveryAddress,
            city: form.deliveryCity,
            state: form.deliveryState,
            zip: form.deliveryZip,
            scheduledAt: form.deliveryDate,
          },
        ],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-loads'] });
      setShowCreateModal(false);
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/broker-loads/${showAssignModal.id}/assign-carrier`, {
        carrierId: assignForm.carrierId,
        carrierRate: parseFloat(assignForm.carrierRate),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-loads'] });
      setShowAssignModal(null);
      setAssignForm({ carrierId: '', carrierRate: '' });
    },
  });

  return (
    <div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Create broker load</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customer (shipper)</label>
                <select value={form.customerId} onChange={(e) => set('customerId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select customer</option>
                  {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Commodity</label>
                  <input value={form.commodity} onChange={(e) => set('commodity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shipper rate ($)</label>
                  <input type="number" value={form.shipperRate} onChange={(e) => set('shipperRate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target carrier rate ($)</label>
                  <input type="number" value={form.carrierRate} onChange={(e) => set('carrierRate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-3">Pickup</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Facility name</label>
                    <input value={form.pickupFacility} onChange={(e) => set('pickupFacility', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Scheduled date</label>
                    <input type="datetime-local" value={form.pickupDate} onChange={(e) => set('pickupDate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                    <input value={form.pickupAddress} onChange={(e) => set('pickupAddress', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <input value={form.pickupCity} onChange={(e) => set('pickupCity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">State</label>
                      <input value={form.pickupState} onChange={(e) => set('pickupState', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Zip</label>
                      <input value={form.pickupZip} onChange={(e) => set('pickupZip', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-3">Delivery</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Facility name</label>
                    <input value={form.deliveryFacility} onChange={(e) => set('deliveryFacility', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Scheduled date</label>
                    <input type="datetime-local" value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                    <input value={form.deliveryAddress} onChange={(e) => set('deliveryAddress', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <input value={form.deliveryCity} onChange={(e) => set('deliveryCity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">State</label>
                      <input value={form.deliveryState} onChange={(e) => set('deliveryState', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Zip</label>
                      <input value={form.deliveryZip} onChange={(e) => set('deliveryZip', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.customerId || !form.shipperRate}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create load'}
              </button>
            </div>
          </div>
        </div>
      )}{showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Assign carrier to {showAssignModal.loadNumber}</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select carrier</label>
                <select value={assignForm.carrierId} onChange={(e) => setAssignForm(p => ({ ...p, carrierId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select a carrier</option>
                  {carriers?.filter((c: any) => c.status === 'ACTIVE').map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.mcNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Carrier rate ($)</label>
                <input type="number" value={assignForm.carrierRate} onChange={(e) => setAssignForm(p => ({ ...p, carrierRate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="What you pay the carrier" />
              </div>
              {assignForm.carrierId && assignForm.carrierRate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium">
                    Your margin: ${(showAssignModal.shipperRate - parseFloat(assignForm.carrierRate)).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Shipper rate ${showAssignModal.shipperRate?.toLocaleString()} minus carrier rate ${parseFloat(assignForm.carrierRate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={() => assignMutation.mutate()}
                disabled={assignMutation.isPending || !assignForm.carrierId || !assignForm.carrierRate}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign carrier'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Broker loads</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New broker load
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Load #</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Customer</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Origin</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Destination</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Carrier</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Shipper rate</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Margin</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-gray-400 text-sm">Loading broker loads...</td>
              </tr>
            )}
            {!isLoading && loads?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-gray-400 text-sm">No broker loads yet. Click New broker load to get started.</td>
              </tr>
            )}
            {loads?.map((load: any) => (
              <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 text-blue-600 font-medium">{load.loadNumber}</td>
                <td className="px-5 py-3 text-gray-700">{load.customer?.name}</td>
                <td className="px-5 py-3 text-gray-700">{load.stops?.[0]?.city}, {load.stops?.[0]?.state}</td>
                <td className="px-5 py-3 text-gray-700">{load.stops?.[load.stops.length - 1]?.city}, {load.stops?.[load.stops.length - 1]?.state}</td>
                <td className="px-5 py-3">
                  {load.carrier
                    ? <span className="text-gray-700">{load.carrier.name}</span>
                    : <span className="text-red-500">Unassigned</span>
                  }
                </td>
                <td className="px-5 py-3 text-gray-700 font-medium">${load.shipperRate?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  {load.margin != null
                    ? <span className="text-green-700 font-medium">${load.margin?.toLocaleString()}</span>
                    : <span className="text-gray-400">—</span>
                  }
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[load.status]}`}>
                    {STATUS_LABELS[load.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {!load.carrier && (
                    <button
                      onClick={() => setShowAssignModal({ id: load.id, loadNumber: load.loadNumber, shipperRate: load.shipperRate })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Assign carrier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}