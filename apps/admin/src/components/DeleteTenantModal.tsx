import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  tenant: { id: string; slug: string; companyName: string };
  onDeleted: () => void;
}

export function DeleteTenantModal({ open, onClose, tenant, onDeleted }: Props) {
  const [typed, setTyped] = useState('');

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`/admin/tenants/${tenant.id}`);
      return data;
    },
    onSuccess: () => {
      setTyped('');
      onDeleted();
    },
  });

  if (!open) return null;

  const canDelete = typed === tenant.slug && !deleteMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-axon-900">Delete tenant</h3>
          </div>
          <button
            onClick={() => {
              setTyped('');
              onClose();
            }}
            className="text-axon-500 hover:text-axon-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 text-sm">
          <p className="text-axon-700">
            This will permanently delete <strong>{tenant.companyName}</strong> and
            <strong> all of its data</strong>: users, loads, customers, invoices,
            drivers, and integration settings. This cannot be undone.
          </p>

          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            Any logged-in users on this tenant will lose access immediately.
          </div>

          <div>
            <label className="block text-axon-700 mb-1">
              Type <code className="px-1.5 py-0.5 rounded bg-axon-100 text-axon-900 font-mono">{tenant.slug}</code> to confirm:
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={tenant.slug}
              className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {deleteMutation.isError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {(deleteMutation.error as any)?.response?.data?.message || 'Delete failed'}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-axon-200 bg-axon-50 rounded-b-xl">
          <button
            onClick={() => {
              setTyped('');
              onClose();
            }}
            className="px-4 py-2 text-sm text-axon-700 hover:bg-white rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={!canDelete}
            onClick={() => deleteMutation.mutate()}
            className="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
}
