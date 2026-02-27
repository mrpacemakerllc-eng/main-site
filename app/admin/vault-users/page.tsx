import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function VaultUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as any

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all users with their ECG Vault subscriptions
  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: {
          productId: "ecg_vault"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Separate into paid and free
  const paidUsers = users.filter(u =>
    u.subscriptions.some(s => s.status === 'active')
  )
  const freeUsers = users.filter(u =>
    !u.subscriptions.some(s => s.status === 'active')
  )

  // Get subscription stats
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      productId: "ecg_vault",
      status: "active"
    }
  })

  const canceledSubscriptions = await prisma.subscription.count({
    where: {
      productId: "ecg_vault",
      status: "canceled"
    }
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-400 hover:text-white">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-white">ECG Library Users</h1>
          </div>
          <span className="text-slate-400">{user.email}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-6 border border-emerald-500/30">
            <p className="text-emerald-400 text-sm">Paid (Pro)</p>
            <p className="text-3xl font-bold text-emerald-400">{paidUsers.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm">Free Users</p>
            <p className="text-3xl font-bold text-white">{freeUsers.length}</p>
          </div>
          <div className="bg-amber-500/20 rounded-xl p-6 border border-amber-500/30">
            <p className="text-amber-400 text-sm">Canceled</p>
            <p className="text-3xl font-bold text-amber-400">{canceledSubscriptions}</p>
          </div>
        </div>

        {/* Paid Users */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Paid Users ({paidUsers.length})
          </h2>
          {paidUsers.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
              <p className="text-slate-400">No paid subscribers yet.</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Renews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paidUsers.map((u) => {
                    const sub = u.subscriptions.find(s => s.status === 'active')
                    return (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{u.name || "No name"}</div>
                          <div className="text-sm text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            PRO
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {sub?.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {sub?.cancelAtPeriodEnd ? (
                            <span className="text-amber-400">Cancels {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : ''}</span>
                          ) : (
                            sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '-'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Free Users */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
            Free Users ({freeUsers.length})
          </h2>
          {freeUsers.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
              <p className="text-slate-400">No free users yet.</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {freeUsers.map((u) => {
                    const hadSubscription = u.subscriptions.length > 0
                    return (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{u.name || "No name"}</div>
                          <div className="text-sm text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hadSubscription ? (
                            <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                              CANCELED
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold bg-slate-600 text-slate-300 rounded-full">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
