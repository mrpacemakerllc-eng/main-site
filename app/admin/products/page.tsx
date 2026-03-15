'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Analytics {
  totalPageViews: number;
  totalPurchases: number;
  totalRevenue: number;
  recentPurchases: Array<{
    email: string;
    productName: string;
    amount: number;
    createdAt: string;
  }>;
  topPages: Array<{
    path: string;
    views: number;
  }>;
}

interface GrantedAccess {
  id: string;
  email: string;
  productId: string;
  productName: string;
  createdAt: string;
}

export default function ProductsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [grantedAccess, setGrantedAccess] = useState<GrantedAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantProduct, setGrantProduct] = useState('paced_ecg_booklet');
  const [grantLoading, setGrantLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [analyticsRes, accessRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/access'),
      ]);

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }
      if (accessRes.ok) {
        setGrantedAccess(await accessRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail) return;

    setGrantLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: grantEmail,
          productId: grantProduct,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Access granted to ${grantEmail}`);
        setGrantEmail('');
        fetchData();
      } else {
        setMessage(data.error || 'Failed to grant access');
      }
    } catch (error) {
      setMessage('Error granting access');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevokeAccess = async (id: string, email: string) => {
    if (!confirm(`Revoke access for ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/access?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Access revoked');
        fetchData();
      }
    } catch (error) {
      setMessage('Error revoking access');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">
                MP
              </div>
              <span className="hidden sm:inline">Mr Pacemaker</span>
            </Link>
            <span className="text-slate-600">|</span>
            <h1 className="text-lg font-semibold text-slate-200">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-slate-400 text-sm font-medium">Page Views</span>
            </div>
            <div className="text-3xl font-bold">{(analytics?.totalPageViews || 0).toLocaleString()}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-slate-400 text-sm font-medium">Purchases</span>
            </div>
            <div className="text-3xl font-bold">{analytics?.totalPurchases || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-slate-400 text-sm font-medium">Revenue</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              ${((analytics?.totalRevenue || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Purchases */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold">Recent Purchases</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                {analytics?.recentPurchases?.length || 0} total
              </span>
            </div>
            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {!analytics?.recentPurchases?.length ? (
                <div className="px-6 py-8 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No purchases yet</p>
                </div>
              ) : (
                analytics.recentPurchases.map((purchase, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-semibold text-sm">
                        {purchase.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{purchase.email}</div>
                        <div className="text-xs text-slate-500">{purchase.productName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-400">
                        +${(purchase.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(purchase.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Grant Access */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold">Grant Access</h2>
              <p className="text-xs text-slate-500 mt-1">Give someone free access to a product</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                    placeholder="user@email.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Product</label>
                  <select
                    value={grantProduct}
                    onChange={(e) => setGrantProduct(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="paced_ecg_booklet">Paced ECG Booklet ($19.99)</option>
                    <option value="ecg_rhythm_library">ECG Rhythm Library ($19.99)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {grantLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Granting...
                    </span>
                  ) : (
                    'Grant Access'
                  )}
                </button>
              </form>
              {message && (
                <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${message.includes('Error') || message.includes('Failed') || message.includes('already') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {message}
                </div>
              )}

              {/* Granted Access List */}
              {grantedAccess.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-medium text-slate-400 mb-3">
                    Manual Access ({grantedAccess.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {grantedAccess.map((access) => (
                      <div key={access.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <div>
                          <div className="text-sm">{access.email}</div>
                          <div className="text-xs text-slate-500">{access.productName}</div>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(access.id, access.email)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 hover:bg-red-500/10 rounded transition"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold">Top Pages</h2>
          </div>
          <div className="p-6">
            {analytics?.topPages?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {analytics.topPages.map((page, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition">
                    <div className="text-xs text-slate-400 truncate mb-1" title={page.path}>
                      {page.path || '/'}
                    </div>
                    <div className="text-2xl font-bold">{page.views.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">views</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No page view data yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
