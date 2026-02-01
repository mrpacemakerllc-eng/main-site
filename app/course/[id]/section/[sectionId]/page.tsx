"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ScreenshotProtection from "@/app/components/ScreenshotProtection"
import Watermark from "@/app/components/Watermark"
import VideoPlayer from "@/app/components/VideoPlayer"

export default function SectionPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [section, setSection] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [currentVideo, setCurrentVideo] = useState<any>(null)
  const [examResult, setExamResult] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch course to get section details
    const courseRes = await fetch(`/api/courses/${params.id}`)
    const courseData = await courseRes.json()
    setCourse(courseData)

    // Find the specific section - check both parent sections and child sections
    let sectionData = courseData.sections?.find((s: any) => s.id === params.sectionId)

    // If not found in parent sections, search in child sections
    if (!sectionData) {
      for (const parentSection of courseData.sections || []) {
        const childSection = parentSection.children?.find((c: any) => c.id === params.sectionId)
        if (childSection) {
          sectionData = childSection
          break
        }
      }
    }

    setSection(sectionData)

    if (sectionData?.videos?.length > 0) {
      setCurrentVideo(sectionData.videos[0])
    }

    // Fetch exam result if section has a post-quiz
    if (sectionData?.postTestId) {
      try {
        const examRes = await fetch(`/api/exams/${sectionData.postTestId}/result`)
        const examData = await examRes.json()
        setExamResult(examData)
      } catch (error) {
        console.error("Error fetching exam result:", error)
      }
    }
  }

  if (!section || !course) return <div className="p-8">Loading...</div>

  // Helper function to extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null

    // If it's already just an ID (11 characters, alphanumeric and dashes/underscores)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url
    }

    // Match youtube.com/watch?v=VIDEO_ID
    const standardMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/)
    if (standardMatch) return standardMatch[1]

    // Match youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return shortMatch[1]

    // Match youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]

    return null
  }

  // Check if this is a parent section with children
  const hasChildren = section.children && section.children.length > 0

  // Create placeholder videos if needed
  const videoCount = section.videoCount || 0
  const actualVideos = section.videos || []
  const placeholderCount = Math.max(0, videoCount - actualVideos.length)
  const placeholders = Array.from({ length: placeholderCount }, (_, i) => ({
    id: `placeholder-${i}`,
    title: `Video ${actualVideos.length + i + 1} (Coming Soon)`,
    isPlaceholder: true,
  }))
  const allVideos = [...actualVideos, ...placeholders]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screenshot Protection */}
      <ScreenshotProtection />

      {/* Company Watermark */}
      <Watermark />

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/course/${params.id}`} className="text-blue-600 hover:underline">
            ← Back to Course Outline
          </Link>
        </div>
      </nav>

      <div className="w-full">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">{section.title}</h1>
          {section.examWeight && (
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
              {section.examWeight}% of IBHRE CCDS Exam
            </span>
          )}
        </div>

        {/* If parent section, show child subsections */}
        {hasChildren && (
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Subsections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.children.map((child: any, index: number) => (
                <Link
                  key={child.id}
                  href={`/course/${params.id}/section/${child.id}`}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 flex-1 leading-snug">
                        {child.title}
                      </h3>
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Description */}
                    {child.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {child.description}
                      </p>
                    )}

                    {/* Metadata badges */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {child.videoCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <span>{child.videoCount} video{child.videoCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {child.postTestId && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          <span>📝</span>
                          <span>Quiz</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Only show videos and post-quiz if NOT a parent section */}
        {!hasChildren && (
          <>

        {/* Quiz Section */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
        {section.postTestId && (
          <div className={`border-2 rounded-lg p-4 ${examResult?.percentage === 100 ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{examResult?.percentage === 100 ? '🏆' : '📝'}</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">
                  {examResult?.percentage === 100 ? 'Perfect Score! 🎉' : 'Quiz'}
                </h2>

                {examResult?.percentage === 100 ? (
                  <p className="text-sm text-gray-700 mb-3">
                    Excellent work! You have mastered this subsection with a perfect score.
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold">Take BEFORE</span> watching videos, then <span className="font-semibold">AFTER</span> to test learning. Goal: <span className="font-semibold text-blue-600">100%</span>
                  </p>
                )}

                {examResult?.taken ? (
                  <div className="mb-3 bg-white/50 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`text-2xl font-bold ${examResult.percentage === 100 ? 'text-green-600' : examResult.percentage >= 70 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {examResult.percentage}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {examResult.correctAnswers}/{examResult.totalQuestions} correct • {new Date(examResult.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {examResult.percentage < 100 && (
                      <p className="text-xs font-semibold text-blue-700">
                        💡 Review videos and retake to reach 100%
                      </p>
                    )}
                  </div>
                ) : null}

                <Link
                  href={`/exam/${section.postTestId}`}
                  className={`inline-block text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${examResult?.percentage === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {examResult?.taken ? (examResult.percentage === 100 ? 'Retake Quiz' : 'Retake - Aim for 100%') : 'Take Quiz'}
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Video Player and List */}
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Player - Takes up 3/4 on large screens */}
          <div className="xl:col-span-3">
            {currentVideo && !currentVideo.isPlaceholder ? (
              <div className="space-y-4">
                <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                  {(() => {
                    const youtubeId = getYouTubeVideoId(currentVideo.filename)

                    if (youtubeId) {
                      // YouTube embed - protected, no easy downloads
                      return (
                        <div className="relative" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                            title={currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )
                    } else {
                      // Regular video file - use custom video player with enhanced controls
                      const videoFilename = currentVideo.filename.split('/').pop()
                      return (
                        <VideoPlayer
                          key={currentVideo.id}
                          src={`/api/video/${videoFilename}`}
                          videoId={currentVideo.id}
                          title={currentVideo.title}
                        />
                      )
                    }
                  })()}
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-semibold mb-1">{currentVideo.title}</h2>
                  {currentVideo.description && (
                    <p className="text-sm text-gray-600">{currentVideo.description}</p>
                  )}
                </div>
              </div>
            ) : currentVideo?.isPlaceholder ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold mb-2">{currentVideo.title}</h3>
                <p className="text-gray-600">
                  This video will be available soon. We're working hard to create quality content for you!
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
                <p className="text-gray-600">
                  Video content for this section is coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Video List - Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-3">
              Videos ({actualVideos.length}/{videoCount})
            </h3>

            {allVideos.length === 0 ? (
              <p className="text-gray-600 text-xs">No videos planned.</p>
            ) : (
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {allVideos.map((video: any, index: number) => (
                  <button
                    key={video.id}
                    onClick={() => !video.isPlaceholder && setCurrentVideo(video)}
                    disabled={video.isPlaceholder}
                    className={`w-full text-left p-2 rounded text-sm transition ${
                      currentVideo?.id === video.id
                        ? "bg-blue-100 border-l-4 border-blue-600 font-semibold"
                        : video.isPlaceholder
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-gray-50 hover:bg-blue-50 hover:border-l-4 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {video.isPlaceholder ? (
                        <span className="text-xs">🔒</span>
                      ) : (
                        <span className="text-xs text-green-600">▶</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">
                          {index + 1}. {video.title}
                        </div>
                        {video.isPlaceholder && (
                          <div className="text-xs text-gray-500">Coming soon</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Progress Info */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Progress:</span>
                  <span className="font-semibold">
                    {actualVideos.length}/{videoCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${videoCount > 0 ? (actualVideos.length / videoCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
