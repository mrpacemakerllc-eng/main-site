'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Analytics {
  totalPageViews: number;
  totalPurchases: number;
  totalRevenue: number;
  totalUsers: number;
  totalQuizLeads: number;
  recentPurchases: Array<{
    email: string;
    productName: string;
    amount: number;
    createdAt: string;
  }>;
  users: Array<{
    email: string;
    name: string | null;
    createdAt: string;
  }>;
  quizLeads: Array<{
    email: string;
    score: number | null;
    total: number | null;
    source: string | null;
    createdAt: string;
  }>;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  activity: Array<{
    type: 'purchase' | 'signup' | 'quiz_lead';
    email: string;
    details: string;
    createdAt: string;
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
  const [activeTab, setActiveTab] = useState<'activity' | 'emails' | 'pages'>('activity');

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return (
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'signup':
        return (
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'quiz_lead':
        return (
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Collect all unique emails
  const allEmails = new Set<string>();
  analytics?.recentPurchases?.forEach(p => allEmails.add(p.email));
  analytics?.users?.forEach(u => allEmails.add(u.email));
  analytics?.quizLeads?.forEach(q => allEmails.add(q.email));

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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Emails Collected</div>
            <div className="text-2xl font-bold text-white">{allEmails.size}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Purchases</div>
            <div className="text-2xl font-bold text-emerald-400">{analytics?.totalPurchases || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Revenue</div>
            <div className="text-2xl font-bold text-emerald-400">${((analytics?.totalRevenue || 0) / 100).toFixed(0)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Signups</div>
            <div className="text-2xl font-bold text-blue-400">{analytics?.totalUsers || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Page Views</div>
            <div className="text-2xl font-bold text-white">{analytics?.totalPageViews || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel - Activity/Emails/Pages */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'activity' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                Activity Feed
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'emails' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                All Emails ({allEmails.size})
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'pages' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                Top Pages
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {activeTab === 'activity' && (
                <div className="divide-y divide-slate-800">
                  {!analytics?.activity?.length ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    analytics.activity.map((item, i) => (
                      <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 transition">
                        {getActivityIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.email}</div>
                          <div className="text-xs text-slate-500">{item.details}</div>
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'emails' && (
                <div className="divide-y divide-slate-800">
                  {Array.from(allEmails).map((email, i) => {
                    const purchase = analytics?.recentPurchases?.find(p => p.email === email);
                    const user = analytics?.users?.find(u => u.email === email);
                    const quiz = analytics?.quizLeads?.find(q => q.email === email);

                    return (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-semibold text-sm">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{email}</div>
                            <div className="flex gap-2 mt-1">
                              {purchase && (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                                  Purchased
                                </span>
                              )}
                              {user && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                  Signed Up
                                </span>
                              )}
                              {quiz && (
                                <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                                  Quiz Lead
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(email)}
                          className="text-xs text-slate-500 hover:text-white px-2 py-1 hover:bg-slate-700 rounded transition"
                        >
                          Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'pages' && (
                <div className="p-6">
                  <div className="space-y-3">
                    {analytics?.topPages?.map((page, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="text-sm text-slate-400 w-6">{i + 1}</div>
                        <div className="flex-1 bg-slate-800 rounded-lg overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-3 flex items-center justify-between"
                            style={{ width: `${Math.max(20, (page.views / (analytics?.topPages?.[0]?.views || 1)) * 100)}%` }}
                          >
                            <span className="text-sm font-medium truncate">{page.path || '/'}</span>
                            <span className="text-sm text-slate-400 ml-2">{page.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grant Access Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold">Grant Access</h2>
              <p className="text-xs text-slate-500 mt-1">Give free product access</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                    placeholder="user@email.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Product</label>
                  <select
                    value={grantProduct}
                    onChange={(e) => setGrantProduct(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition appearance-none cursor-pointer text-sm"
                  >
                    <option value="paced_ecg_booklet">Paced ECG Booklet</option>
                    <option value="ecg_rhythm_library">ECG Rhythm Library</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 text-sm"
                >
                  {grantLoading ? 'Granting...' : 'Grant Access'}
                </button>
              </form>
              {message && (
                <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${message.includes('Error') || message.includes('Failed') || message.includes('already') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {message}
                </div>
              )}

              {grantedAccess.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-medium text-slate-400 mb-3">
                    Manual Access ({grantedAccess.length})
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {grantedAccess.map((access) => (
                      <div key={access.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <div className="text-xs truncate flex-1">{access.email}</div>
                        <button
                          onClick={() => handleRevokeAccess(access.id, access.email)}
                          className="text-red-400 hover:text-red-300 text-xs ml-2"
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
      </main>
    </div>
  );
}
