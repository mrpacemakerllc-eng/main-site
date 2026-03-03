import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteCourseButton from "./DeleteCourseButton"

export default async function AdminPage() {
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

  const examResults = await prisma.examResult.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      exam: {
        select: {
          title: true,
          examType: true,
        },
      },
    },
    orderBy: {
      takenAt: "desc",
    },
    take: 10, // Show latest 10 exam results
  })

  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="MrPacemaker LLC" className="h-10 w-auto rounded-lg shadow-sm" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/admin/signups"
              className="text-emerald-600 hover:underline font-medium"
            >
              Quiz Leads
            </Link>
            <Link
              href="/admin/enrollments"
              className="text-blue-600 hover:underline"
            >
              View All Enrollments
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
        {/* Enrolled Students Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Enrollments</h2>
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No students enrolled yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.slice(0, 5).map((enrollment) => {
                    const now = new Date()
                    const expiresAt = enrollment.expiresAt ? new Date(enrollment.expiresAt) : null
                    const isExpired = expiresAt && expiresAt < now

                    return (
                      <tr key={enrollment.id} className={isExpired ? "bg-red-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {enrollment.user.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {enrollment.user.email}
                              </div>
                            </div>
                            {enrollment.hasPaid && (
                              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">
                                PAID
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollment.course.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expiresAt ? expiresAt.toLocaleDateString() : "Lifetime"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Test Scores Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Test Scores</h2>
          {examResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No test results yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.user.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.exam.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.exam.examType === 'pre-test' ? 'bg-blue-100 text-blue-800' :
                          result.exam.examType === 'post-test' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.exam.examType === 'pre-test' ? 'Pre-Test' :
                           result.exam.examType === 'post-test' ? 'Post-Test' :
                           'Regular'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          result.score >= 80 ? 'text-green-600' :
                          result.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {result.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.takenAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Courses Section - Simplified */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Courses</h2>
            <Link
              href="/admin/course/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No courses yet.</p>
              <Link
                href="/admin/course/new"
                className="text-blue-600 hover:underline"
              >
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {course._count.enrollments} student{course._count.enrollments !== 1 ? 's' : ''} enrolled
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/course/${course.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
