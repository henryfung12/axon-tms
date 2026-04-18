import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface CreatePayload {
  slug: string;
  companyName: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  primaryColor?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export function CreateTenantModal({ open, onClose, onCreated }: Props) {
  const [slug, setSlug] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('STARTER');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setSlug('');
    setCompanyName('');
    setPlan('STARTER');
    setPrimaryColor('#2563eb');
    setAdminEmail('');
    setAdminPassword('');
    setAdminFirstName('');
    setAdminLastName('');
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const { data } = await api.post('/admin/tenants', payload);
      return data;
    },
    onSuccess: () => {
      reset();
      onCreated();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create tenant');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: CreatePayload = {
      slug: slug.trim(),
      companyName: companyName.trim(),
      plan,
      primaryColor,
    };
    // Only include the admin fields if the user provided them — otherwise
    // the tenant is created without any user (can be added later).
    if (adminEmail && adminPassword) {
      payload.adminEmail = adminEmail.trim();
      payload.adminPassword = adminPassword;
      if (adminFirstName) payload.adminFirstName = adminFirstName.trim();
      if (adminLastName) payload.adminLastName = adminLastName.trim();
    }
    createMutation.mutate(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-axon-900/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-200">
          <h2 className="text-lg font-semibold text-axon-900">New tenant</h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-axon-500 hover:text-axon-900"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-axon-700 mb-1">Company name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
              placeholder="Acme Logistics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-axon-700 mb-1">
              Slug <span className="text-axon-500 font-normal">(becomes the subdomain)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className="flex-1 px-3 py-2 border border-axon-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-axon-900"
                placeholder="acme-logistics"
              />
              <span className="text-sm text-axon-500 font-mono">.axon-tms.com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-axon-700 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')
                }
                className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900 bg-white"
              >
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-axon-700 mb-1">Brand color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-axon-200 cursor-pointer"
                />
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-axon-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-axon-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-axon-100">
            <p className="text-xs text-axon-500 mb-3">
              Optional: create the first admin user for this tenant. Leave blank if you will add users later.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  className="px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
                  placeholder="First name"
                />
                <input
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  className="px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
                  placeholder="Last name"
                />
              </div>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
                placeholder="Admin email"
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
                placeholder="Admin password (min 8 chars)"
                minLength={8}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 text-sm text-axon-700 hover:bg-axon-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-axon-900 text-white text-sm font-medium rounded-lg hover:bg-axon-800 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}