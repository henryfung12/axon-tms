import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo mode - accept any credentials, set fake admin user
    setTimeout(() => {
      setAuth(
        {
          id: "demo-user-001",
          email: email || "admin@axontms.com",
          firstName: "Demo",
          lastName: "User",
          role: "ADMIN",
        },
        "demo-access-token"
      );
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">AXON TMS</h1>
          <p className="text-sm text-gray-500 mt-1">Transportation Management System</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="admin@axontms.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Demo mode - any credentials will work
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          (c) {new Date().getFullYear()} AXON TMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}