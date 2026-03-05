import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboard() {
  // Get stats
  const [
    totalPageViews,
    todayPageViews,
    uniqueSessions,
    recentEvents,
    topPages,
    purchases,
    quizLeads,
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.pageView.groupBy({ by: ['sessionId'] }).then((r) => r.length),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.quizLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <Link href="/" className="text-teal-600 hover:text-teal-700">
            ← Back to Site
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-teal-600">{totalPageViews}</div>
            <div className="text-slate-600">Total Page Views</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-teal-600">{todayPageViews}</div>
            <div className="text-slate-600">Today's Views</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-teal-600">{uniqueSessions}</div>
            <div className="text-slate-600">Unique Sessions</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-teal-600">{purchases.length}</div>
            <div className="text-slate-600">Purchases</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Pages */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Top Pages</h2>
            <div className="space-y-3">
              {topPages.map((page, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-slate-700 truncate">{page.path}</span>
                  <span className="text-slate-500 font-medium">{page._count.path} views</span>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-slate-400">No page views yet</p>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Events</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center text-sm">
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{event.event}</span>
                  <span className="text-slate-400">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-slate-400">No events yet</p>
              )}
            </div>
          </div>

          {/* Quiz Leads */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quiz Leads ({quizLeads.length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quizLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{lead.email}</span>
                  <span className="text-slate-400">{lead.source || 'quiz'}</span>
                </div>
              ))}
              {quizLeads.length === 0 && (
                <p className="text-slate-400">No quiz leads yet</p>
              )}
            </div>
          </div>

          {/* Purchases */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Purchases</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-slate-700">{purchase.email}</div>
                    <div className="text-slate-400 text-xs">{purchase.productName}</div>
                  </div>
                  <span className="text-teal-600 font-medium">
                    ${(purchase.amount / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              {purchases.length === 0 && (
                <p className="text-slate-400">No purchases yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
