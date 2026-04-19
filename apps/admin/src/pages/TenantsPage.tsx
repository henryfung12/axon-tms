import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Plus, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { CreateTenantModal } from '@/components/CreateTenantModal';

interface TenantRow {
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
  _count: {
    users: number;
    loads: number;
    customers: number;
  };
}

export function TenantsPage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const tenantsQuery = useQuery<TenantRow[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await api.get<TenantRow[]>('/admin/tenants');
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-axon-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-axon-900">Tenants</h1>
            <p className="text-sm text-axon-500 mt-1">
              {tenantsQuery.data
                ? `${tenantsQuery.data.length} tenant${tenantsQuery.data.length === 1 ? '' : 's'} on the platform`
                : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-axon-900 text-white text-sm font-medium rounded-lg hover:bg-axon-800 transition-colors"
          >
            <Plus size={16} />
            New tenant
          </button>
        </div>

        {tenantsQuery.isLoading && (
          <div className="text-sm text-axon-500 py-8 text-center">Loading tenants...</div>
        )}

        {tenantsQuery.isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            Failed to load tenants. Your session may have expired. Try signing in again.
          </div>
        )}

        {tenantsQuery.data && (
          <div className="bg-white border border-axon-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-axon-50 border-b border-axon-200">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-axon-500">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3 text-right">Users</th>
                  <th className="px-4 py-3 text-right">Loads</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axon-100">
                {tenantsQuery.data.map((t) => (
                  <tr key={t.id} className="hover:bg-axon-50">
                    {/* Entire row except slug/open is wrapped as a link cell by cell
                        so the open link still works without nested-anchor issues. */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/tenants/${t.id}`}
                        className="flex items-center gap-2 text-axon-900 hover:text-axon-700"
                      >
                        {t.logoUrl ? (
                          <img
                            src={t.logoUrl}
                            alt=""
                            className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                            style={{ background: t.primaryColor ?? '#64748b' }}
                          >
                            {t.companyName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{t.companyName}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-axon-700">
                      {t.slug}
                      <a
                        className="ml-2 text-axon-500 hover:text-axon-900 underline decoration-dotted"
                        href={`https://${t.slug}.axon-tms.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        open
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-axon-100 text-axon-700 text-xs">
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-axon-700">
                      {t._count.users}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-axon-700">
                      {t._count.loads}
                    </td>
                    <td className="px-4 py-3">
                      {t.isActive ? (
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
                    </td>
                    <td className="px-4 py-3 text-right text-axon-300">
                      <Link to={`/tenants/${t.id}`} aria-label="Open tenant">
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <CreateTenantModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['tenants'] })}
      />
    </div>
  );
}
