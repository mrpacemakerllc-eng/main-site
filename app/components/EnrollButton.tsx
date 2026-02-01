"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/enroll/${courseId}`, { method: "POST" })
      if (res.ok) {
        // Redirect to the course page
        router.push(`/course/${courseId}`)
      } else {
        alert("Failed to enroll. Please try again.")
      }
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("Failed to enroll. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Enrolling..." : "Enroll Now"}
    </button>
  )
}
