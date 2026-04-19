import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, LogOut, Pause, Play, Save, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { DeleteTenantModal } from '@/components/DeleteTenantModal';

interface TenantDetail {
  id: string;
  slug: string;
  companyName: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  isActive: boolean;
  primaryColor: string | null;
  logoUrl: string | null;
  cargoWiseEnabled: boolean;
  quickbooksEnabled: boolean;
  netsuiteEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    loads: number;
    customers: number;
    drivers?: number;
    externalCarriers?: number;
    brokerLoads?: number;
  };
}

interface UpdateBody {
  companyName?: string;
  plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  primaryColor?: string;
  logoUrl?: string | null;
}

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const detailQuery = useQuery<TenantDetail>({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data } = await api.get<TenantDetail>(`/admin/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Local editable state, hydrated from the server once loaded.
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('STARTER');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (detailQuery.data) {
      setCompanyName(detailQuery.data.companyName);
      setPlan(detailQuery.data.plan);
      setPrimaryColor(detailQuery.data.primaryColor ?? '#2563eb');
      setLogoUrl(detailQuery.data.logoUrl ?? '');
    }
  }, [detailQuery.data]);

  // Disable Save when nothing has changed.
  const isDirty = useMemo(() => {
    if (!detailQuery.data) return false;
    return (
      companyName !== detailQuery.data.companyName ||
      plan !== detailQuery.data.plan ||
      primaryColor !== (detailQuery.data.primaryColor ?? '#2563eb') ||
      logoUrl !== (detailQuery.data.logoUrl ?? '')
    );
  }, [detailQuery.data, companyName, plan, primaryColor, logoUrl]);

  const updateMutation = useMutation({
    mutationFn: async (body: UpdateBody) => {
      const { data } = await api.patch<TenantDetail>(`/admin/tenants/${id}`, body);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tenant', id], data);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: async (nextActive: boolean) => {
      const action = nextActive ? 'activate' : 'suspend';
      const { data } = await api.patch<TenantDetail>(`/admin/tenants/${id}/${action}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tenant', id], data);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const handleSave = () => {
    const body: UpdateBody = {};
    if (detailQuery.data) {
      if (companyName !== detailQuery.data.companyName) body.companyName = companyName;
      if (plan !== detailQuery.data.plan) body.plan = plan;
      if (primaryColor !== (detailQuery.data.primaryColor ?? '#2563eb')) {
        body.primaryColor = primaryColor;
      }
      if (logoUrl !== (detailQuery.data.logoUrl ?? '')) {
        // Empty string clears the logo on the backend (stored as null).
        body.logoUrl = logoUrl.trim() === '' ? null : logoUrl.trim();
      }
    }
    updateMutation.mutate(body);
  };

  const tenant = detailQuery.data;
  const isInternal = tenant?.slug === 'axon-internal';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-axon-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-axon-900 text-white flex items-center justify-center">
              <ShieldCheck size={14} />
            </div>
            <span className="font-semibold text-axon-900">Axon Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-axon-700">
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </span>
            <button
              onClick={clearAuth}
              className="flex items-center gap-1.5 text-axon-500 hover:text-axon-900 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <Link
            to="/tenants"
            className="inline-flex items-center gap-1 text-sm text-axon-500 hover:text-axon-900"
          >
            <ArrowLeft size={14} />
            All tenants
          </Link>
        </div>

        {detailQuery.isLoading && (
          <div className="text-sm text-axon-500 py-8 text-center">Loading tenant...</div>
        )}

        {detailQuery.isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            Could not load tenant. It may have been deleted, or your session expired.
          </div>
        )}

        {tenant && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {tenant.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: tenant.primaryColor ?? '#64748b' }}
                  >
                    {tenant.companyName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-semibold text-axon-900">
                    {tenant.companyName}
                  </h1>
                  <div className="text-sm text-axon-500 flex items-center gap-2">
                    <span className="font-mono">{tenant.slug}.axon-tms.com</span>
                    <span>·</span>
                    {tenant.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isInternal && (
                <button
                  disabled={setActiveMutation.isPending}
                  onClick={() => setActiveMutation.mutate(!tenant.isActive)}
                  className={
                    tenant.isActive
                      ? 'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-axon-200 text-axon-700 text-sm hover:bg-axon-50 disabled:opacity-50'
                      : 'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm hover:bg-emerald-50 disabled:opacity-50'
                  }
                >
                  {tenant.isActive ? <Pause size={14} /> : <Play size={14} />}
                  {tenant.isActive ? 'Suspend tenant' : 'Activate tenant'}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <Stat label="Users" value={tenant._count.users} />
              <Stat label="Customers" value={tenant._count.customers} />
              <Stat label="Loads" value={tenant._count.loads} />
            </div>

            {/* Branding / editable fields */}
            <div className="bg-white border border-axon-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-axon-900 mb-4">Branding & plan</h2>

              {updateMutation.isError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {(updateMutation.error as any)?.response?.data?.message || 'Save failed'}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-axon-700 mb-1">
                    Company name
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900"
                  />
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
                    <label className="block text-sm font-medium text-axon-700 mb-1">
                      Brand color
                    </label>
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

                <div>
                  <label className="block text-sm font-medium text-axon-700 mb-1">
                    Logo URL{' '}
                    <span className="text-axon-500 font-normal">
                      (https only · leave blank to use initials tile)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-axon-900"
                  />
                  {logoUrl && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-axon-500">
                      <span>Preview:</span>
                      <img
                        src={logoUrl}
                        alt=""
                        className="w-8 h-8 rounded-md object-cover border border-axon-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => navigate('/tenants')}
                    className="px-4 py-2 text-sm text-axon-700 hover:bg-axon-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty || updateMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-axon-900 text-white text-sm font-medium rounded-lg hover:bg-axon-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Integrations (read-only for now) */}
            <div className="bg-white border border-axon-200 rounded-xl p-6 mt-4">
              <h2 className="text-base font-semibold text-axon-900 mb-1">Integrations</h2>
              <p className="text-xs text-axon-500 mb-4">
                Toggle from the tenant's own settings page once those integrations ship.
              </p>
              <div className="flex gap-4 text-sm">
                <IntegrationBadge label="CargoWise" on={tenant.cargoWiseEnabled} />
                <IntegrationBadge label="QuickBooks" on={tenant.quickbooksEnabled} />
                <IntegrationBadge label="NetSuite" on={tenant.netsuiteEnabled} />
              </div>
            </div>

            {/* Danger zone (hidden for axon-internal) */}
            {!isInternal && (
              <div className="bg-white border border-red-200 rounded-xl p-6 mt-4">
                <h2 className="text-base font-semibold text-red-700 mb-1">Danger zone</h2>
                <p className="text-xs text-axon-500 mb-4">
                  Deleting a tenant permanently removes it and all of its data.
                </p>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={14} />
                  Delete tenant
                </button>
              </div>
            )}

            <DeleteTenantModal
              open={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              tenant={{ id: tenant.id, slug: tenant.slug, companyName: tenant.companyName }}
              onDeleted={() => {
                setDeleteOpen(false);
                queryClient.invalidateQueries({ queryKey: ['tenants'] });
                navigate('/tenants');
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-axon-200 rounded-xl p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-axon-500">{label}</div>
      <div className="text-2xl font-semibold text-axon-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function IntegrationBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={
        on
          ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium'
          : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-axon-50 text-axon-500 text-xs'
      }
    >
      <span className={on ? 'w-1.5 h-1.5 rounded-full bg-emerald-500' : 'w-1.5 h-1.5 rounded-full bg-axon-300'}></span>
      {label}
    </span>
  );
}
