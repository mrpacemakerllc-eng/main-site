import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function EnrollmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as any

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Enrollments</h1>
          <div className="flex gap-4 items-center">
            <Link href="/admin" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <span className="text-gray-600">{user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => {
                const now = new Date()
                const expiresAt = enrollment.expiresAt ? new Date(enrollment.expiresAt) : null
                const isExpired = expiresAt && expiresAt < now
                const daysLeft = expiresAt
                  ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <tr key={enrollment.id} className={isExpired ? "bg-red-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.user.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expiresAt ? expiresAt.toLocaleDateString() : "Lifetime"}
                      </div>
                      {daysLeft !== null && daysLeft > 0 && (
                        <div className="text-xs text-gray-500">
                          {daysLeft} days left
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isExpired
                            ? "bg-red-100 text-red-800"
                            : enrollment.hasPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isExpired ? "Expired" : enrollment.hasPaid ? "Active" : "Pending"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {enrollments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No enrollments yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
