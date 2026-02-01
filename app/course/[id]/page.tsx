"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function CoursePage() {
  const params = useParams()
  const [course, setCourse] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [currentVideo, setCurrentVideo] = useState<any>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchCourseData()
  }, [])

  const fetchCourseData = async () => {
    const [courseRes, enrollmentRes] = await Promise.all([
      fetch(`/api/courses/${params.id}`),
      fetch(`/api/enrollment/${params.id}`)
    ])

    const courseData = await courseRes.json()
    const enrollmentData = await enrollmentRes.json()

    setCourse(courseData)
    setEnrollment(enrollmentData)

    if (courseData.videos?.length > 0) {
      setCurrentVideo(courseData.videos[0])
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id }),
      })

      const data = await res.json()

      if (data.free) {
        // Free course, just refresh
        await fetchCourseData()
      } else if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Failed to start checkout")
    } finally {
      setPurchasing(false)
    }
  }

  const handleSkipPrePostTest = async () => {
    await fetch(`/api/enrollment/${params.id}/skip-pre-post`, {
      method: "POST"
    })
    fetchCourseData()
  }

  if (!course || !enrollment) return <div className="p-8">Loading...</div>

  const prePostEnabled = course.prePostTestEnabled
  const preTest = course.exams?.find((e: any) => e.examType === "pre-test")
  const postTest = course.exams?.find((e: any) => e.examType === "post-test")
  const regularExams = course.exams?.filter((e: any) => e.examType === "regular") || []

  // Pre-test/Post-test workflow logic
  const showPreTestPrompt = prePostEnabled && !enrollment.skipPrePostTest && !enrollment.preTestCompleted && preTest
  const showVideos = !prePostEnabled || enrollment.skipPrePostTest || enrollment.preTestCompleted
  const showPostTestPrompt = prePostEnabled && !enrollment.skipPrePostTest && enrollment.preTestCompleted && !enrollment.postTestCompleted && course.videos?.length > 0

  // Check if user needs to pay
  const needsPayment = !enrollment.hasPaid && course.price > 0

  // Check if access has expired
  const hasExpired = enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <img src="/logo.jpg" alt="MrPacemaker LLC" className="h-10 w-auto rounded-lg shadow-sm" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        {/* Access expired wall */}
        {hasExpired && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold mb-4">Access Expired</h2>
            <p className="text-gray-600 mb-6">
              Your 1-year access to this course has expired. Renew your access to continue learning.
            </p>
            <div className="text-lg text-gray-500 mb-8">
              Expired on: {enrollment.expiresAt ? new Date(enrollment.expiresAt).toLocaleDateString() : 'N/A'}
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? "Processing..." : "Renew Access"}
            </button>
          </div>
        )}

        {/* Payment wall */}
        {!hasExpired && needsPayment && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold mb-4">Purchase Required</h2>
            <p className="text-gray-600 mb-6">
              This course requires payment to access. Purchase once and get lifetime access to all videos and exams.
            </p>
            <div className="text-4xl font-bold text-blue-600 mb-8">
              ${(course.price / 100).toFixed(2)}
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? "Processing..." : "Purchase Course"}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Secure payment powered by Stripe
            </p>
          </div>
        )}

        {!hasExpired && !needsPayment && (
          <>

        {/* Pre-test prompt */}
        {showPreTestPrompt && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold mb-4">📝 Pre-Test Required</h2>
            <p className="text-gray-700 mb-6">
              Before watching the course videos, please take the pre-test to assess your current knowledge.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/exam/${preTest.id}?type=pre-test`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Take Pre-Test
              </Link>
              <button
                onClick={handleSkipPrePostTest}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
              >
                Skip Pre/Post Test Mode
              </button>
            </div>
          </div>
        )}

        {/* Post-test prompt */}
        {showPostTestPrompt && postTest && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold mb-4">🎓 Ready for Post-Test!</h2>
            <p className="text-gray-700 mb-6">
              You've completed the pre-test. Now take the post-test to see how much you've learned!
            </p>
            <Link
              href={`/exam/${postTest.id}?type=post-test`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Take Post-Test
            </Link>
          </div>
        )}

        {/* Course Outline - Main View */}
        {showVideos && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Course Outline</h2>
              <p className="text-gray-600 text-center mb-8">
                Select a section below to begin. Each section includes a knowledge check and video lessons.
              </p>

              {/* Course Sections as Cards */}
              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-4">
                  {course.sections.map((section: any, index: number) => {
                    const hasChildren = section.children && section.children.length > 0
                    const childCount = hasChildren ? section.children.length : 0

                    return (
                      <Link
                        key={section.id}
                        href={`/course/${params.id}/section/${section.id}`}
                        className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-blue-600">
                                {index + 1}
                              </span>
                              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                {section.title}
                              </h3>
                            </div>
                            {section.description && (
                              <p className="text-gray-600 ml-11 mb-3">{section.description}</p>
                            )}
                            <div className="ml-11 flex items-center gap-4 text-sm flex-wrap">
                              {hasChildren && (
                                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                  📚 {childCount} subsections
                                </span>
                              )}
                              {!hasChildren && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                  {section.videoCount || 0} videos
                                </span>
                              )}
                              {section.preTestId && (
                                <span className="flex items-center gap-1 text-blue-600">
                                  📝 Knowledge check
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {section.examWeight && (
                              <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-lg whitespace-nowrap">
                                {section.examWeight}%
                              </div>
                            )}
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Course content is being organized. Check back soon!</p>
                </div>
              )}

              {/* Progress indicator */}
              {prePostEnabled && !enrollment.skipPrePostTest && (enrollment.preTestCompleted || enrollment.postTestCompleted) && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Overall Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div className={enrollment.preTestCompleted ? "text-green-600" : "text-gray-400"}>
                      ✓ Pre-test {enrollment.preTestCompleted ? "completed" : "pending"}
                    </div>
                    <div className={enrollment.postTestCompleted ? "text-green-600" : "text-gray-400"}>
                      ✓ Post-test {enrollment.postTestCompleted ? "completed" : "pending"}
                    </div>
                  </div>

                  {/* View Results Link */}
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/course/${params.id}/results`}
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm transition"
                    >
                      📊 View Exam Results & Performance
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
