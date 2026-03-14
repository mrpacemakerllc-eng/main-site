'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold">Product Access & Analytics</h1>
          </div>
          <span className="text-gray-600">{session?.user?.email}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Total Page Views</div>
            <div className="text-3xl font-bold">{analytics?.totalPageViews || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Total Purchases</div>
            <div className="text-3xl font-bold">{analytics?.totalPurchases || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-emerald-600">
              ${((analytics?.totalRevenue || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grant Access Form */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Grant Product Access</h2>
            <p className="text-gray-500 text-sm mb-4">
              Give someone free access to a product without payment.
            </p>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product</label>
                <select
                  value={grantProduct}
                  onChange={(e) => setGrantProduct(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="paced_ecg_booklet">Paced ECG Booklet ($19.99)</option>
                  <option value="ecg_rhythm_library">ECG Rhythm Library ($19)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={grantLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {grantLoading ? 'Granting...' : 'Grant Access'}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${message.includes('Error') || message.includes('Failed') || message.includes('already') ? 'text-red-500' : 'text-emerald-600'}`}>
                {message}
              </p>
            )}

            {/* Granted Access List */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Manually Granted Access ({grantedAccess.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {grantedAccess.length === 0 ? (
                  <p className="text-gray-400 text-sm">No manual access granted yet</p>
                ) : (
                  grantedAccess.map((access) => (
                    <div key={access.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <div className="text-sm font-medium">{access.email}</div>
                        <div className="text-xs text-gray-500">{access.productName}</div>
                      </div>
                      <button
                        onClick={() => handleRevokeAccess(access.id, access.email)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Revoke
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {!analytics?.recentPurchases?.length ? (
                <p className="text-gray-400 text-sm">No purchases yet</p>
              ) : (
                analytics.recentPurchases.map((purchase, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{purchase.email}</div>
                      <div className="text-xs text-gray-500">{purchase.productName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-600">
                        ${(purchase.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics?.topPages?.length ? (
              analytics.topPages.map((page, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-sm font-medium truncate" title={page.path}>
                    {page.path || '/'}
                  </div>
                  <div className="text-2xl font-bold text-gray-700">{page.views}</div>
                  <div className="text-xs text-gray-400">views</div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm col-span-4">No page view data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
