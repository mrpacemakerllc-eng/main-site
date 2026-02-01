import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import EnrollButton from "@/app/components/EnrollButton"
import ProgressCircle from "@/app/components/ProgressCircle"
import DarkModeToggle from "@/app/components/DarkModeToggle"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as any

  if (user.role === "admin") {
    redirect("/admin")
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          videos: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalVideos = enrollment.course.videos.length
      const completedVideos = await prisma.videoProgress.count({
        where: {
          userId: user.id,
          videoId: { in: enrollment.course.videos.map(v => v.id) },
          completed: true
        }
      })
      const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0
      return { ...enrollment, progress }
    })
  )

  const allCourses = await prisma.course.findMany({
    include: {
      videos: true,
      _count: { select: { enrollments: true } },
    },
  })

  const availableCourses = allCourses.filter(
    (course) => !enrollmentsWithProgress.some((e) => e.courseId === course.id)
  )

  const hasEnrollments = enrollmentsWithProgress.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/logo.jpg" alt="MrPacemaker LLC" className="h-8 md:h-10 w-auto rounded-lg shadow-sm" />
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="text-blue-600 dark:text-blue-400">Mr</span>Pacemaker<span className="text-purple-600 dark:text-purple-400">LLC</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 items-center">
              <DarkModeToggle />
              <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{user.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm md:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition whitespace-nowrap px-2 md:px-0"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* My Enrolled Courses - Priority for enrolled users */}
        {hasEnrollments && (
          <section className="mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">Pick up where you left off</p>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold self-start sm:self-auto">
                {enrollmentsWithProgress.length} Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollmentsWithProgress.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/course/${enrollment.course.id}`}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-gray-600 p-6 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group relative"
                >
                  {/* Progress Circle - Top Right */}
                  <div className="absolute top-4 right-4">
                    <ProgressCircle percentage={enrollment.progress} size={64} strokeWidth={6} />
                  </div>

                  <div className="flex items-start justify-between mb-4 pr-16">
                    <span className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                      ENROLLED
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
                    {enrollment.course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <span>{enrollment.course.videos.length} videos</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Click to access course →</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Free Study Guide - Compact version for enrolled users */}
        {hasEnrollments && (
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 md:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Free IBHRE CCDS Study Guide</h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">Download your complimentary study resource</p>
                  </div>
                </div>
                <a
                  href="/IBHRE-CCDS-Guide.pdf"
                  download
                  className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-6 py-2.5 md:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition whitespace-nowrap text-sm font-semibold self-start sm:self-auto min-h-[44px] flex items-center justify-center"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Welcome Banner + Intro - Only for non-enrolled users */}
        {!hasEnrollments && (
          <>
            <section className="mb-8 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border border-blue-200 rounded-xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                    FREE STUDY GUIDE
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Welcome to Your Learning Dashboard
                  </h2>
                  <p className="text-gray-700 text-lg">
                    Download your complimentary IBHRE CCDS study guide to get started.
                  </p>
                </div>
                <a
                  href="/IBHRE-CCDS-Guide.pdf"
                  download
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  Download Study Guide
                </a>
              </div>
            </section>

            <section className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About the IBHRE CCDS Certification Course
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <div className="text-center p-6">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <p className="text-gray-500 text-sm">Introduction Video Coming Soon</p>
                        <p className="text-gray-400 text-xs mt-2">Watch a preview of what you'll learn</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        What You'll Learn
                      </h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Comprehensive coverage of device programming and troubleshooting</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Patient management and safety protocols</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Advanced cardiac rhythm analysis aligned with IBHRE guidelines</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Practice exams that mirror the real IBHRE CCDS exam format</span>
                        </li>
                      </ul>

                      <div className="mt-6">
                        <a
                          href="https://www.ibhre.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                          Learn more about IBHRE certification
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Main Course CTA - Only show if user hasn't enrolled */}
        {!hasEnrollments && availableCourses.length > 0 && (
          <section className="mb-12">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  IBHRE CCDS Certification Preparation Course
                </h2>
                <p className="text-gray-600">
                  Comprehensive study program designed by certified cardiac device specialists
                </p>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Course Details */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Complete CCDS Preparation Course
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Comprehensive Video Lessons</p>
                          <p className="text-sm text-gray-600">Step-by-step instruction from certified experts</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Practice Exams & Quizzes</p>
                          <p className="text-sm text-gray-600">Test your knowledge with real exam-style questions</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Lifetime Access</p>
                          <p className="text-sm text-gray-600">Learn at your own pace, review anytime</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Certificate of Completion</p>
                          <p className="text-sm text-gray-600">Proof of your preparation and dedication</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> This course follows the IBHRE exam content outline and is designed to supplement your clinical experience.
                      </p>
                    </div>
                  </div>

                  {/* Right: Pricing & CTA */}
                  <div className="flex flex-col">
                    {availableCourses.map((course) => (
                      <div key={course.id} className="bg-gray-50 border border-gray-200 rounded-lg p-8 flex flex-col h-full">
                        <div className="text-center mb-6">
                          <p className="text-sm text-gray-600 mb-2">Course Fee</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-4xl font-bold text-gray-900">
                              {course.price === 0 ? "Free" : `$${(course.price / 100).toFixed(0)}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            One-time payment, lifetime access
                          </p>
                        </div>

                        <div className="space-y-3 mb-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>{course.videos.length} HD Video Lessons</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>Practice Exams Included</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>Instant Access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>Lifetime Updates</span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <EnrollButton courseId={course.id} />

                          <p className="text-xs text-center text-gray-500 mt-4">
                            Secure payment processing via Stripe
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Available Courses (if any remaining) */}
        {hasEnrollments && availableCourses.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">
                      {course.videos.length} videos
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {course.price === 0 ? "Free" : `$${(course.price / 100).toFixed(2)}`}
                    </p>
                  </div>
                  <EnrollButton courseId={course.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasEnrollments && availableCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Available Yet</h3>
            <p className="text-gray-600">Check back soon for new courses!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                Questions? Contact us at <a href="mailto:support@mrpacemakerllc.com" className="text-blue-600 hover:text-blue-700">support@mrpacemakerllc.com</a>
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a
                href="https://www.ibhre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                IBHRE.org →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
