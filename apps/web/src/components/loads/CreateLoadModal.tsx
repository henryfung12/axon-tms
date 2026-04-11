import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  onClose: () => void;
}

export function CreateLoadModal({ onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    customerId: '',
    commodity: '',
    weight: '',
    pieces: '',
    rate: '',
    notes: '',
    pickupFacility: '',
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    pickupDate: '',
    deliveryFacility: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryDate: '',
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/customers');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/loads', {
        customerId: form.customerId,
        commodity: form.commodity,
        weight: parseFloat(form.weight),
        pieces: parseInt(form.pieces),
        rate: parseFloat(form.rate),
        totalRate: parseFloat(form.rate),
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
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      onClose();
    },
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">Create new load</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
        </div>

        <div className="px-6 py-4 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={form.customerId}
              onChange={(e) => set('customerId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a customer</option>
              {customers?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Commodity</label>
              <input value={form.commodity} onChange={(e) => set('commodity', e.target.value)} placeholder="e.g. General freight" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="40000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rate ($)</label>
              <input type="number" value={form.rate} onChange={(e) => set('rate', e.target.value)} placeholder="2500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.customerId || !form.rate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create load'}
          </button>
        </div>
      </div>
    </div>
  );
}