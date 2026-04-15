import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-800',
  PENDING:  'bg-yellow-100 text-yellow-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:   'Active',
  PENDING:  'Pending',
  INACTIVE: 'Inactive',
  REJECTED: 'Rejected',
};

export function CarriersPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', mcNumber: '', dotNumber: '', email: '',
    phone: '', city: '', state: '', zip: '',
    paymentTerms: '30', preferredLanes: '', notes: '',
    insuranceExpiry: '', authorityExpiry: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const { data: carriers, isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data } = await api.get('/carriers');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/carriers', {
        ...form,
        paymentTerms: parseInt(form.paymentTerms),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      setShowModal(false);
      setForm({
        name: '', mcNumber: '', dotNumber: '', email: '',
        phone: '', city: '', state: '', zip: '',
        paymentTerms: '30', preferredLanes: '', notes: '',
        insuranceExpiry: '', authorityExpiry: '',
      });
    },
  });

  const rmisMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/carriers/${id}/rmis-verify`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Add carrier</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company name</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">MC number</label>
                  <input value={form.mcNumber} onChange={(e) => set('mcNumber', e.target.value)} placeholder="MC-123456" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">DOT number</label>
                  <input value={form.dotNumber} onChange={(e) => set('dotNumber', e.target.value)} placeholder="1234567" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={(e) => set('city', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <input value={form.state} onChange={(e) => set('state', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment terms (days)</label>
                  <input type="number" value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Insurance expiry</label>
                  <input type="date" value={form.insuranceExpiry} onChange={(e) => set('insuranceExpiry', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Authority expiry</label>
                  <input type="date" value={form.authorityExpiry} onChange={(e) => set('authorityExpiry', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preferred lanes</label>
                <input value={form.preferredLanes} onChange={(e) => set('preferredLanes', e.target.value)} placeholder="e.g. Chicago to Dallas, Atlanta to Miami" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.name || !form.mcNumber || !form.dotNumber}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add carrier'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Carrier network</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add carrier
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Carrier</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">MC number</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">DOT number</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Location</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">RMIS</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">Loading carriers...</td>
              </tr>
            )}
            {!isLoading && carriers?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">No carriers yet. Click Add carrier to get started.</td>
              </tr>
            )}
            {carriers?.map((carrier: any) => (
              <tr key={carrier.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{carrier.name}</p>
                  <p className="text-xs text-gray-400">{carrier.email}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{carrier.mcNumber}</td>
                <td className="px-5 py-3 text-gray-700">{carrier.dotNumber}</td>
                <td className="px-5 py-3 text-gray-700">{carrier.city}, {carrier.state}</td>
                <td className="px-5 py-3">
                  {carrier.rmisVerifiedAt
                    ? <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Verified</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Not verified</span>
                  }
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[carrier.status]}`}>
                    {STATUS_LABELS[carrier.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {!carrier.rmisVerifiedAt && (
                    <button
                      onClick={() => rmisMutation.mutate(carrier.id)}
                      disabled={rmisMutation.isPending}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Verify with RMIS
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