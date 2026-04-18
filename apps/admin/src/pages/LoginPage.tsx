import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tenant: { slug: string };
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      // Always log in against axon-internal — this app is staff-only.
      const { data } = await api.post<LoginResponse>('/auth/login', {
        ...creds,
        tenantSlug: 'axon-internal',
      });
      return data;
    },
    onSuccess: (data) => {
      // Reject anyone who somehow got in without the AXON_STAFF role.
      if (data.user.role !== 'AXON_STAFF') {
        setError('This account is not an Axon staff account.');
        return;
      }
      setAuth(data.user, data.accessToken);
    },
    onError: () => {
      setError('Invalid email or password.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-axon-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-axon-900 text-white mb-3">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-axon-900">Axon Admin</h1>
          <p className="text-sm text-axon-500 mt-1">Internal tenant management console</p>
        </div>

        <div className="bg-white border border-axon-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-medium text-axon-900 mb-6">Staff sign in</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-axon-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900 focus:border-transparent"
                placeholder="staff@axon-tms.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-axon-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-axon-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-axon-900 focus:border-transparent"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 px-4 bg-axon-900 text-white text-sm font-medium rounded-lg hover:bg-axon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-axon-500 mt-6">
          Restricted access — Axon employees only.
        </p>
      </div>
    </div>
  );
}