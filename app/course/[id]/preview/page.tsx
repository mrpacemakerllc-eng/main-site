"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function CoursePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [])

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      const data = await res.json()
      setCourse(data)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = () => {
    if (!session) {
      router.push(`/login?redirect=/checkout/${params.id}`)
    } else {
      // For paid courses, go to checkout. For free, enroll directly.
      if (course?.price > 0) {
        router.push(`/checkout/${params.id}`)
      } else {
        router.push(`/course/${params.id}`)
      }
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!course) return <div className="p-8">Course not found</div>

  const totalVideos = course.videos?.length || 0
  const totalSections = course.sections?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Course Preview
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="font-semibold">{totalVideos} Videos</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <span className="font-semibold">{totalSections} Sections</span>
                </div>
                {course.prePostTestEnabled && (
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    📝 <span className="font-semibold">Pre & Post Tests</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleEnroll}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                {course.price === 0 ? "Enroll Free" : `Enroll Now - $${(course.price / 100).toFixed(0)}`}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Preview Video or Image Placeholder */}
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
              <div className="aspect-video bg-white/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-white/50 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <p className="text-white/70">Course Preview Video</p>
                  <p className="text-white/50 text-sm mt-2">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What You'll Learn</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              ✅
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Master Device Programming</h3>
            <p className="text-gray-600 text-sm">Comprehensive coverage of pacemaker and ICD programming for all major manufacturers</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rhythm Analysis Skills</h3>
            <p className="text-gray-600 text-sm">Advanced ECG interpretation and troubleshooting techniques</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Exam-Focused Content</h3>
            <p className="text-gray-600 text-sm">Aligned with IBHRE CCDS exam blueprint and weighted topics</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              🏥
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Clinical Applications</h3>
            <p className="text-gray-600 text-sm">Real-world case studies and patient management scenarios</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              📝
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Practice Exams</h3>
            <p className="text-gray-600 text-sm">Multiple practice tests that mirror the actual IBHRE exam format</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Self-Paced Learning</h3>
            <p className="text-gray-600 text-sm">Study on your schedule with lifetime access to all materials</p>
          </div>
        </div>
      </div>

      {/* Course Curriculum */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Course Curriculum</h2>
          <div className="max-w-4xl mx-auto space-y-3">
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section: any, index: number) => (
                <div key={section.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-blue-600">{index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      </div>
                      {section.description && (
                        <p className="text-gray-600 text-sm mb-3 ml-8">{section.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm ml-8">
                        {section.videoCount > 0 && (
                          <span className="text-gray-600">
                            📹 {section.videoCount} videos
                          </span>
                        )}
                        {section.examWeight && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            {section.examWeight}% of exam
                          </span>
                        )}
                      </div>
                    </div>
                    {section.children && section.children.length > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {section.children.length} subsections
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">Course curriculum is being organized. Check back soon!</p>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of successful CCDS candidates who passed with our comprehensive course
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="text-5xl font-bold mb-2">
              {course.price === 0 ? "Free" : `$${(course.price / 100).toFixed(0)}`}
            </div>
            <p className="text-blue-100 mb-6">One-time payment or $67/month × 3 • 1 year access</p>
            <button
              onClick={handleEnroll}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl"
            >
              Enroll Now
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Lifetime Access
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Practice Exams
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Expert Support
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
