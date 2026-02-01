"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingSettings, setEditingSettings] = useState(false)
  const [settings, setSettings] = useState({ title: "", description: "", price: 0 })
  const [savingSettings, setSavingSettings] = useState(false)
  const [creatingSection, setCreatingSection] = useState(false)
  const [newSection, setNewSection] = useState({ title: "", description: "", videoCount: 0, examWeight: 0 })

  useEffect(() => {
    fetchCourse()
  }, [])

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${params.id}`)
    const data = await res.json()
    setCourse(data)
    setVideos(data.videos || [])
    setSettings({
      title: data.title || "",
      description: data.description || "",
      price: data.price || 0
    })
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: settings.title,
          description: settings.description,
          price: settings.price,
        }),
      })

      if (res.ok) {
        await fetchCourse()
        setEditingSettings(false)
        alert("Course settings updated successfully!")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update course settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          title: newSection.title,
          description: newSection.description,
          videoCount: newSection.videoCount,
          examWeight: newSection.examWeight || null,
          order: course.sections?.length || 0,
        }),
      })

      if (res.ok) {
        await fetchCourse()
        setNewSection({ title: "", description: "", videoCount: 0, examWeight: 0 })
        setCreatingSection(false)
        alert("Section created successfully!")
      }
    } catch (error) {
      console.error("Section creation error:", error)
      alert("Failed to create section")
    }
  }

  const handleVideoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("courseId", params.id as string)

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        await fetchCourse()
        e.currentTarget.reset()
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDuplicateExam = async (examId: string, newType: string) => {
    if (!confirm(`Duplicate this exam as a ${newType}?`)) return

    try {
      const res = await fetch(`/api/exams/${examId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newExamType: newType }),
      })

      if (res.ok) {
        await fetchCourse()
        alert("Exam duplicated successfully!")
      }
    } catch (error) {
      console.error("Duplicate error:", error)
      alert("Failed to duplicate exam")
    }
  }

  if (!course) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-2">{course.description}</p>
              <p className="text-lg font-semibold text-blue-600">
                Price: {course.price === 0 ? "Free" : `$${(course.price / 100).toFixed(2)}`}
              </p>
            </div>
            <button
              onClick={() => setEditingSettings(!editingSettings)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              {editingSettings ? "Cancel" : "Edit Settings"}
            </button>
          </div>

          {editingSettings && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (in dollars)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={(settings.price / 100).toFixed(2)}
                    onChange={(e) => setSettings({ ...settings, price: Math.round(parseFloat(e.target.value || "0") * 100) })}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set to $0.00 for a free course. Students get 1 year of access after enrollment.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  required
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Videos ({videos.length})</h2>
            {videos.length === 0 ? (
              <p className="text-gray-600">No videos yet.</p>
            ) : (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={video.id} className="p-3 border rounded">
                    <div className="font-medium">{index + 1}. {video.title}</div>
                    <div className="text-sm text-gray-600">{video.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Sections</h2>
            <button
              onClick={() => setCreatingSection(!creatingSection)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {creatingSection ? "Cancel" : "Add Section"}
            </button>
          </div>

          {creatingSection && (
            <form onSubmit={handleCreateSection} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newSection.title}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="e.g., Cardiac Anatomy & Physiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    placeholder="Brief description of what this section covers..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Number of Videos
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newSection.videoCount}
                    onChange={(e) => setNewSection({ ...newSection, videoCount: parseInt(e.target.value) || 0 })}
                    placeholder="How many videos do you plan for this section?"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps you track how many videos you still need to create
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Weight (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newSection.examWeight}
                    onChange={(e) => setNewSection({ ...newSection, examWeight: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 30 for 30%"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of exam questions from this section (IBHRE CCDS domains)
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create Section
                </button>
              </div>
            </form>
          )}

          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-3 mb-8">
              {course.sections.map((section: any, index: number) => (
                <div key={section.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
                        <span className={`${section.videos?.length >= section.videoCount ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                          {section.videos?.length || 0} / {section.videoCount} videos
                        </span>
                        {section.videos?.length < section.videoCount && (
                          <span className="text-gray-500">
                            ({section.videoCount - (section.videos?.length || 0)} needed)
                          </span>
                        )}
                        {section.examWeight && (
                          <span className="text-blue-600 font-semibold">
                            {section.examWeight}% of exam
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-8">No sections yet. Add sections to organize your course content.</p>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Exams</h2>
            <Link
              href={`/admin/course/${params.id}/exam/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Exam
            </Link>
          </div>
          {course.exams?.length === 0 ? (
            <p className="text-gray-600">No exams yet.</p>
          ) : (
            <div className="space-y-3">
              {course.exams?.map((exam: any) => (
                <div key={exam.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{exam.title}</div>
                      <div className="text-sm text-gray-600">
                        {exam.questions?.length || 0} questions
                      </div>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                        exam.examType === 'pre-test' ? 'bg-blue-100 text-blue-800' :
                        exam.examType === 'post-test' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.examType === 'pre-test' ? 'Pre-Test' :
                         exam.examType === 'post-test' ? 'Post-Test' :
                         'Regular Exam'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/exam/${exam.id}/view`}
                        className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 border border-gray-300"
                        title="View Exam"
                      >
                        View
                      </Link>
                      {exam.examType !== 'pre-test' && (
                        <button
                          onClick={() => handleDuplicateExam(exam.id, 'pre-test')}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                          title="Duplicate as Pre-Test"
                        >
                          → Pre-Test
                        </button>
                      )}
                      {exam.examType !== 'post-test' && (
                        <button
                          onClick={() => handleDuplicateExam(exam.id, 'post-test')}
                          className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100"
                          title="Duplicate as Post-Test"
                        >
                          → Post-Test
                        </button>
                      )}
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
